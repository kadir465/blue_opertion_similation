import os
import re
import time
import json
import pickle
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Global holders for model and mappings
model = None
intent_mapping = None
rag_engine = None

# ─── Entity Extraction Keyword Dictionaries ─────────────────────────────────
STATUS_KEYWORDS = {
    "tamamlanan": "completed", "tamamlandı": "completed", "biten": "completed",
    "bitmiş": "completed", "çözülen": "completed", "çözüldü": "completed",
    "kapanan": "completed", "kapatilan": "completed", "kapatılan": "completed",
    "tamamlamış": "completed", "bitirilmiş": "completed", "tamamlanmış": "completed",
    "kapatılmış": "completed", "bakım": "completed", "hallolmuş": "completed",
    "giderilmiş": "completed", "yapılmış": "completed", "halledildi": "completed",
    "aktif": "active", "açık": "active", "devam eden": "active",
    "bekleyen": "active", "çözülmemiş": "active", "arızalı": "active",
    "bozuk": "active", "arıza": "active", "sorunlu": "active",
    "hatalı": "active", "hata": "active", "sızıntı": "active",
    "sorun": "active", "problem": "active", "arızalar": "active",
    "çalışmıyor": "active", "çalışmayan": "active", "patlamış": "active",
    "arızalandı": "active", "çöktü": "active",
    "gönderilen": "dispatched", "gönderildi": "dispatched",
    "iletilen": "dispatched", "bildirilen": "dispatched",
}

BUILDING_KEYWORDS = {
    "a blok": "A Blok", "b blok": "B Blok", "c blok": "C Blok",
    "d blok": "D Blok", "e blok": "E Blok", "f blok": "F Blok",
    "ana bina": "Ana Bina", "ek bina": "Ek Bina",
    "merkez": "Merkez", "depo": "Depo", "fabrika": "Fabrika",
    "ofis": "Ofis", "yönetim": "Yönetim",
}

CATEGORY_KEYWORDS = {
    "Mekanik": [
        "klima", "asansör", "havalandırma", "su sızıntısı", "sızıntı",
        "mekanik", "tesisat", "pompa", "kazan", "vana", "asansor",
        "fan", "boru", "vığhı", "yangın", "sprinkör", "mekanık",
        "yıkama", "temizlik", "filtre", "musluk", "su patlaması",
        "kombi", "ısıtma", "soğutma", "motor arızası", "hidrofor"
    ],
    "Elektrik": [
        "pano", "aydınlatma", "priz", "elektrik", "jenerator", "jeneratör",
        "ups", "kablo", "sigorta", "trafo", "motor", "şartel",
        "lamba", "led", "elektrikçi", "elektrikli", "kısa devre",
        "şalter", "ampul", "akım", "kaçak",
    ],
    "Yazılım": [
        "sistem", "güncelleme", "bağlantı", "yazılım", "entegrasyon",
        "api", "veri", "bot", "bluebot", "baglanti", "yazilim",
        "sunucu", "server", "database", "veritabanı", "ağ", "network",
        "internet", "wifi", "şifre", "giriş yapamıyorum", "çöktü",
        "uygulama", "program", "bilgisayar", "hata kodu", "bağlanmıyor"
    ],
}

ACTION_KEYWORDS = {
    "list": ["listele", "göster", "getir", "bul", "listesini", "sorgula", "list", "dök"],
    "add": ["ekle", "koy", "yerleştir", "oluştur", "add"],
    "start": ["başlat", "çalıştır", "start"],
    "stop": ["durdur", "kapat", "stop"]
}

DATE_KEYWORDS = {
    "bugün": "today", "bugünü": "today", "bugünkü": "today",
    "dün": "yesterday", "dünkü": "yesterday",
    "geçen hafta": "last_7_days", "son 1 hafta": "last_7_days", "son 7 gün": "last_7_days", "son bir hafta": "last_7_days",
    "bu ay": "last_30_days", "son 1 ay": "last_30_days", "son 30 gün": "last_30_days", "son bir ay": "last_30_days",
    "geçen ay": "last_month"
}

# Words to exclude from keyword extraction
STOP_WORDS = {
    "ve", "veya", "ile", "için", "bir", "bu", "şu", "o", "da", "de",
    "mi", "mı", "mu", "mü", "den", "dan", "ten", "tan", "deki", "daki",
    "olan", "olarak", "gibi", "kadar", "göre", "sonra", "önce",
    "tüm", "tümü", "hepsi", "bana", "lütfen", "örn", "geçen", "son",
    "ayki", "bugünkü", "dünkü",
}

# ─── Turkish Suffix Normalizer ───────────────────────────────────────────────
TURKISH_SUFFIXES = [
    "larından", "lerinden", "larıyla", "leriyle", "larında", "lerinde",
    "larına", "lerine", "larını", "lerini",
    "ından", "inden", "undan", "ünden", "ndan", "nden",
    "daki", "deki", "taki", "teki",
    "ları", "leri", "larla", "lerle",
    "ından", "inden",
    "nın", "nin", "nun", "nün",
    "ını", "ini", "unu", "ünü",
    "nı", "ni", "nu", "nü",
    "dan", "den", "tan", "ten",
    "da", "de", "ta", "te",
    "ya", "ye", "na", "ne", "la", "le",
    "lar", "ler",
    "ın", "in", "un", "ün",
    "a", "e", "ı", "i", "u", "ü",
]

def normalize_keyword(word: str) -> str:
    single_char_suffixes = {"a", "e", "ı", "i", "u", "ü"}
    for suffix in TURKISH_SUFFIXES:
        if not word.endswith(suffix):
            continue
        root_len = len(word) - len(suffix)
        if root_len < 4:
            continue
        if suffix in single_char_suffixes and len(word) < 6:
            continue
        return word[:root_len]
    return word

def extract_entities(text: str) -> dict:
    text_lower = text.lower().strip()
    entities = {
        "building": "all",
        "status": "all",
        "category": "all",
        "action": "all",
        "date_range": "all"
    }

    for keyword, building_val in BUILDING_KEYWORDS.items():
        pattern = r'\b' + re.escape(keyword.split()[0]) + r'\s*blok'
        if re.search(pattern, text_lower) or keyword in text_lower:
            entities["building"] = building_val
            break

    for keyword, status_val in STATUS_KEYWORDS.items():
        if keyword in text_lower:
            entities["status"] = status_val
            break

    for cat_label, kw_list in CATEGORY_KEYWORDS.items():
        if any(kw in text_lower for kw in kw_list):
            entities["category"] = cat_label
            break

    for act_label, kw_list in ACTION_KEYWORDS.items():
        if any(kw in text_lower for kw in kw_list):
            entities["action"] = act_label
            break

    for keyword, date_val in DATE_KEYWORDS.items():
        if keyword in text_lower:
            entities["date_range"] = date_val
            break

    remaining = text_lower
    for kw in list(STATUS_KEYWORDS.keys()) + list(BUILDING_KEYWORDS.keys()) + list(DATE_KEYWORDS.keys()):
        remaining = remaining.replace(kw, " ")
    for kw_list in list(CATEGORY_KEYWORDS.values()) + list(ACTION_KEYWORDS.values()):
        for kw in kw_list:
            remaining = remaining.replace(kw, " ")

    tokens = re.findall(r'[a-zçğıöşü]+', remaining)
    seen_roots: set = set()
    meaningful: list = []
    for t in tokens:
        if t in STOP_WORDS or len(t) <= 2:
            continue
        root = normalize_keyword(t)
        if len(root) >= 3 and root not in seen_roots:
            seen_roots.add(root)
            meaningful.append(root)

    entities["keywords"] = meaningful
    return entities

class DummyRAGEngine:
    def __init__(self) -> None:
        class DummyCollection:
            def count(self) -> int:
                return 0
        self.collection = DummyCollection()
        self.db_path = "offline"

    def search_tools(self, query: str, top_k: int = 5) -> list:
        return []

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, intent_mapping, rag_engine
    
    # 1. Load ML Model
    model_path = os.path.join(os.path.dirname(__file__), "needle_model.pkl")
    if not os.path.exists(model_path):
        raise RuntimeError(f"Serialized model file not found: {model_path}")
    
    try:
        with open(model_path, "rb") as f:
            model = pickle.load(f)
        print("Model loaded successfully from needle_model.pkl")
    except Exception as e:
        print(f"Error loading pickle file ({str(e)}). Retraining model...")
        try:
            import sys
            sys.path.append(os.path.dirname(__file__))
            from train_model import train_and_save
            train_and_save()
            with open(model_path, "rb") as f:
                model = pickle.load(f)
            print("Model retrained and loaded successfully.")
        except Exception as retrain_err:
            raise RuntimeError(f"Failed to retrain and load model: {str(retrain_err)}")
        
    # 2. Load Mappings
    mapping_path = os.path.join(os.path.dirname(__file__), "intent_mapping.json")
    if not os.path.exists(mapping_path):
        raise RuntimeError(f"Intent mapping config file not found: {mapping_path}")
        
    try:
        with open(mapping_path, "r", encoding="utf-8") as f:
            intent_mapping = json.load(f)
        print("Intent mappings loaded successfully.")
    except Exception as e:
        raise RuntimeError(f"Error reading JSON intent mapping: {str(e)}")
        
    # 3. Load RAG Engine
    try:
        from rag_engine import RAGEngine
        rag_engine = RAGEngine()
        print("RAG Engine loaded successfully.")
    except Exception as e:
        print(f"Error loading RAG Engine ({str(e)}). Using DummyRAGEngine fallback.")
        rag_engine = DummyRAGEngine()
        
    yield
    model = None
    intent_mapping = None
    rag_engine = None

# Instantiate FastAPI app
app = FastAPI(
    title="Cactus Compute Needle Entity Inference Service",
    description="Entity extraction and intent analyzer service.",
    version="3.0.0",
    lifespan=lifespan
)

# Enable CORS for Vite frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class IntentRequest(BaseModel):
    text: str = Field(..., description="Cümle (User command)")

class IntentResponse(BaseModel):
    intent: str
    mapped_parameters: dict
    confidence: float
    latency_ms: float

@app.post("/analyze-intent", response_model=IntentResponse)
async def analyze_intent(request: IntentRequest):
    start_time = time.perf_counter()
    text_input = request.text.strip()
    
    if not text_input:
        latency_ms = (time.perf_counter() - start_time) * 1000
        return IntentResponse(
            intent="unhandled",
            mapped_parameters={"building": "all", "status": "all", "category": "all", "action": "all", "date_range": "all"},
            confidence=0.0,
            latency_ms=round(latency_ms, 3)
        )
        
    try:
        probabilities = (await asyncio.to_thread(model.predict_proba, [text_input]))[0]
        max_idx = probabilities.argmax()
        confidence = float(probabilities[max_idx])
        predicted_label = model.classes_[max_idx]
        
        print(f"ML Intent: '{predicted_label}' | Confidence: {confidence:.4f}")
        
        entities = extract_entities(text_input)
        print(f"Extracted Entities: {entities}")

        mapped_params = {
            "building": entities["building"],
            "status": entities["status"],
            "category": entities["category"],
            "action": entities["action"],
            "date_range": entities["date_range"]
        }
        if "keywords" in entities and entities["keywords"]:
            mapped_params["keywords"] = entities["keywords"]

        resolved_intent = predicted_label
        latency_ms = (time.perf_counter() - start_time) * 1000
        print(f"Final Resolved Output: intent={resolved_intent}, parameters={mapped_params}, confidence={confidence:.2f}")

        return IntentResponse(
            intent=resolved_intent,
            mapped_parameters=mapped_params,
            confidence=round(confidence, 4),
            latency_ms=round(latency_ms, 3)
        )
        
    except Exception as e:
        latency_ms = (time.perf_counter() - start_time) * 1000
        print(f"Error in inference service: {str(e)}")
        return IntentResponse(
            intent="unhandled",
            mapped_parameters={"building": "all", "status": "all", "category": "all", "action": "all", "date_range": "all"},
            confidence=0.0,
            latency_ms=round(latency_ms, 3)
        )

class RAGRequest(BaseModel):
    query: str = Field(..., description="Arama sorgusu")
    top_k: int = Field(5, description="Getirilecek en yakın araç sayısı")

@app.post("/search-tools")
async def search_tools(request: RAGRequest):
    start_time = time.perf_counter()
    try:
        if not rag_engine:
            raise HTTPException(status_code=503, detail="RAG motoru henüz yüklenmedi veya devre dışı.")
        results = await asyncio.to_thread(rag_engine.search_tools, request.query, top_k=request.top_k)
        latency_ms = (time.perf_counter() - start_time) * 1000
        return {
            "query": request.query,
            "results_count": len(results),
            "results": results,
            "latency_ms": round(latency_ms, 3)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class RequestPayload(BaseModel):
    query: str = Field(..., description="Kullanıcı sorgusu")
    search_queries: list | None = Field(default=None, description="Opsiyonel: multi-search sorguları")
    trigger_condition: str | None = Field(default=None, description="Opsiyonel: tetikleyici koşul")
    target_action: str | None = Field(default=None, description="Opsiyonel: hedef eylem")

class ResponsePayload(BaseModel):
    intent_hint: str = Field(..., description="Niyet tahmini")
    confidence: float = Field(..., description="Tahmin güven skoru")
    tools: list = Field(default=[], description="RAG tarafından getirilen aday araçlar")
    entities: dict = Field(default={}, description="Varlıklar")
    message: str = Field(..., description="Sistem mesajı")

@app.post("/process-request", response_model=ResponsePayload)
async def process_request(payload: RequestPayload):
    query = payload.query.strip()
    trigger_cond = payload.trigger_condition.strip() if payload.trigger_condition else None
    target_act = payload.target_action.strip() if payload.target_action else None
    try:
        tools = []
        if rag_engine is not None and not isinstance(rag_engine, DummyRAGEngine):
            if trigger_cond or target_act:
                queries = [q for q in [trigger_cond, target_act] if q]
                tools = await asyncio.to_thread(rag_engine.multi_search, queries, top_k_per_query=5)
                print(f"[RAG Multi-Search] {len(tools)} araç bulundu (queries: {queries})")
            else:
                tools = await asyncio.to_thread(rag_engine.search_tools, query, top_k=7)
                print(f"[RAG Single-Search] {len(tools)} araç bulundu")
        else:
            print("[RAG] Engine offline — araç araması atlandı.")
        
        return ResponsePayload(
            intent_hint="workflow_creation",
            confidence=1.0,
            tools=tools,
            entities={},
            message=f"RAG: {len(tools)} aday araç."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/rag-status")
async def rag_status():
    if rag_engine is None or isinstance(rag_engine, DummyRAGEngine):
        return {"status": "offline"}
    return {"status": "ready"}

@app.get("/keyword-index")
async def get_keyword_index():
    from keyword_index import build_keyword_index
    return build_keyword_index()
