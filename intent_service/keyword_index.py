import os
import json
import re
from app import normalize_keyword, STOP_WORDS

def extract_stems(text):
    if not text:
        return set()
    # Lowercase with Turkish character support
    text = text.replace('İ', 'i').replace('I', 'ı').lower()
    words = re.findall(r'[a-zA-Zçıgüşöâ\d]+', text)
    stems = set()
    for w in words:
        if w in STOP_WORDS or len(w) <= 2:
            continue
        stem = normalize_keyword(w)
        if len(stem) > 2:
            stems.add(stem)
    return stems

def build_keyword_index():
    tools_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../blue_bot_tools.json'))
    if not os.path.exists(tools_path):
        return {}
        
    try:
        with open(tools_path, 'r', encoding='utf-8') as f:
            tools = json.load(f)
    except Exception:
        return {}

    keyword_index = {}
    for tool in tools:
        tool_id = tool.get('id')
        name = tool.get('name', '')
        desc = tool.get('description', '')
        
        combined_text = f"{name} {desc}"
        stems = extract_stems(combined_text)
        keyword_index[tool_id] = list(stems)
        
    return keyword_index
