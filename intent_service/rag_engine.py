
import os
import json
import hashlib
import chromadb
from chromadb.utils import embedding_functions

class RAGEngine:
    def __init__(self):
        self.current_dir = os.path.dirname(os.path.abspath(__file__))
        self.tools_json_path = os.path.abspath(os.path.join(self.current_dir, "..", "blue_bot_tools.json"))
        self.db_path = os.path.join(self.current_dir, "chroma_db")
        
        # Initialize chroma client
        self.client = chromadb.PersistentClient(path=self.db_path)
        
        # ── Multilingual embedding for Turkish support ──
        self.embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="intfloat/multilingual-e5-small"
        )
        
        # Migrate: delete old english-only collection if it exists
        try:
            self.client.delete_collection("bluebot_tools")
            print("[RAG Engine] Eski 'bluebot_tools' koleksiyonu silindi (v2'ye geçiliyor).")
        except Exception:
            pass  # Collection doesn't exist, that's fine
        
        # Get or create v2 collection with multilingual embeddings
        self.collection = self.client.get_or_create_collection(
            name="bluebot_tools_v2",
            embedding_function=self.embedding_fn,
            metadata={"hnsw:space": "cosine"}
        )
        
        # Check and index if changed
        self.initialize_and_index()

    def get_json_hash(self):
        if not os.path.exists(self.tools_json_path):
            return ""
        with open(self.tools_json_path, "r", encoding="utf-8") as f:
            content = f.read()
        return hashlib.md5(content.encode("utf-8")).hexdigest()

    def _build_combined_text(self, tool: dict) -> str:
        """Build a rich combined text for embedding that includes all semantic content."""
        parts = []
        
        # Category + Name
        parts.append(f"[{tool.get('category', '')}] {tool.get('name', '')}")
        
        # Tags / Synonyms
        tags = tool.get("tags", [])
        if tags:
            parts.append(f"Etiketler: {', '.join(tags)}")
        
        # Description
        desc = tool.get("description", "")
        if desc:
            parts.append(f"Açıklama: {desc}")
        
        # Input descriptions (not just names — full semantic content)
        inputs = tool.get("inputs", [])
        if inputs:
            input_parts = []
            for inp in inputs:
                inp_desc = inp.get("description", inp.get("name", ""))
                inp_type = inp.get("type", "")
                input_parts.append(f"{inp.get('name', '')} ({inp_type}): {inp_desc}")
            parts.append(f"Girişler: {'; '.join(input_parts)}")
        
        # Output descriptions (not just names — full semantic content)
        outputs = tool.get("outputs", [])
        if outputs:
            output_parts = []
            for out in outputs:
                out_desc = out.get("description", out.get("name", ""))
                out_type = out.get("type", "")
                output_parts.append(f"{out.get('name', '')} ({out_type}): {out_desc}")
            parts.append(f"Çıkışlar: {'; '.join(output_parts)}")
        
        return "\n".join(parts)

    def initialize_and_index(self):
        if not os.path.exists(self.tools_json_path):
            print(f"[RAG Engine] Hata: {self.tools_json_path} bulunamadı!")
            return

        current_hash = self.get_json_hash()
        
        # Store index metadata in a separate small collection
        meta_collection = self.client.get_or_create_collection(name="index_metadata_v2")
        stored_meta = meta_collection.get(ids=["json_hash_v2"])
        
        stored_hash = ""
        if stored_meta and stored_meta["metadatas"]:
            stored_hash = stored_meta["metadatas"][0].get("hash", "")
            
        if current_hash == stored_hash and self.collection.count() > 0:
            print(f"[RAG Engine] JSON dosyası değişmedi. Mevcut v2 index yükleniyor ({self.collection.count()} araç).")
            return

        print("[RAG Engine] JSON değişti veya v2 index boş. Multilingual embeddings ile yeniden indeksleniyor...")
        
        # Clear existing entries
        all_ids = self.collection.get()["ids"]
        if all_ids:
            self.collection.delete(ids=all_ids)
            
        # Read and parse JSON tools
        with open(self.tools_json_path, "r", encoding="utf-8") as f:
            tools = json.load(f)
            
        documents = []
        metadatas = []
        ids = []
        
        for tool in tools:
            tool_id = tool["id"]
            
            # Rich combined text for embedding
            text_to_embed = self._build_combined_text(tool)
            
            documents.append(text_to_embed)
            metadatas.append({
                "id": tool_id,
                "name": tool.get("name", ""),
                "category": tool.get("category", ""),
                "description": tool.get("description", ""),
                "full_json": json.dumps(tool, ensure_ascii=False)
            })
            ids.append(tool_id)
            
        # Batch add to chroma
        if ids:
            self.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            
        # Save new hash
        meta_collection.upsert(
            ids=["json_hash_v2"],
            metadatas=[{"hash": current_hash}],
            documents=["json_hash_v2_doc"]
        )
        print(f"[RAG Engine] v2 indeksleme tamamlandı. Toplam {len(ids)} araç eklendi (multilingual).")

    def search(self, query: str, top_k: int = 5):
        """Single-query search without query expansion."""
        search_query = query
        if not search_query.startswith("query: "):
            search_query = f"query: {search_query}"
        print(f"[RAG Engine] Arama: '{query}' -> '{search_query}'")
        
        results = self.collection.query(
            query_texts=[search_query],
            n_results=top_k
        )
        
        return self._format_results(results)

    def multi_search(self, queries: list, top_k_per_query: int = 5) -> list:
        """
        Dual/multi-query search: runs each query separately, 
        unions the results, deduplicates by tool ID, 
        and reranks by average similarity score.
        """
        # Collect all results with their scores
        tool_scores: dict = {}  # tool_id -> { tool_data, scores: [float] }
        
        for q in queries:
            if not q or not q.strip():
                continue
            expanded = q
            if not expanded.startswith("query: "):
                expanded = f"query: {expanded}"
            print(f"[RAG Engine] Multi-search sorgusu: '{q}' -> '{expanded}'")
            
            results = self.collection.query(
                query_texts=[expanded],
                n_results=top_k_per_query
            )
            
            if not results or not results["metadatas"] or not results["metadatas"][0]:
                continue
                
            metas = results["metadatas"][0]
            distances = results["distances"][0] if "distances" in results else [0.0] * len(metas)
            
            for meta, dist in zip(metas, distances):
                tool_id = meta["id"]
                similarity = round(1.0 - dist, 4)
                
                # Keep absolute baseline above 0.70 to avoid extreme noise
                if similarity < 0.70:
                    continue
                    
                tool_data = json.loads(meta["full_json"])
                
                if tool_id in tool_scores:
                    tool_scores[tool_id]["scores"].append(similarity)
                else:
                    tool_scores[tool_id] = {
                        "tool_data": tool_data,
                        "scores": [similarity]
                    }
        
        # Calculate average score and sort descending
        ranked = []
        max_avg_similarity = 0.0
        for tool_id, entry in tool_scores.items():
            avg_score = sum(entry["scores"]) / len(entry["scores"])
            if avg_score > max_avg_similarity:
                max_avg_similarity = avg_score
            tool = entry["tool_data"]
            tool["similarity_score"] = round(avg_score, 4)
            ranked.append(tool)
        
        # Apply relative thresholding
        threshold = max(0.80, max_avg_similarity - 0.06)
        filtered_ranked = [t for t in ranked if t["similarity_score"] >= threshold]
        
        filtered_ranked.sort(key=lambda t: t["similarity_score"], reverse=True)
        
        # Return top results (combined limit)
        max_results = max(top_k_per_query, 7)
        return filtered_ranked[:max_results]

    def search_tools(self, query: str, top_k: int = 5):
        """Wrapper method for search compatibility."""
        return self.search(query, top_k=top_k)

    def _format_results(self, results) -> list:
        """Format ChromaDB query results into tool data list."""
        formatted_results = []
        if results and results["metadatas"] and results["metadatas"][0]:
            metas = results["metadatas"][0]
            distances = results["distances"][0] if "distances" in results else [0.0] * len(metas)
            
            candidates = []
            max_similarity = 0.0
            seen_ids = set()
            for meta, dist in zip(metas, distances):
                tool_data = json.loads(meta["full_json"])
                similarity = round(1.0 - dist, 4)
                tool_id = tool_data.get("id")
                
                if tool_id not in seen_ids:
                    seen_ids.add(tool_id)
                    if similarity > max_similarity:
                        max_similarity = similarity
                    tool_data["similarity_score"] = similarity
                    candidates.append(tool_data)
            
            threshold = max(0.80, max_similarity - 0.06)
            for cand in candidates:
                if cand["similarity_score"] >= threshold:
                    formatted_results.append(cand)
                    
        return formatted_results
