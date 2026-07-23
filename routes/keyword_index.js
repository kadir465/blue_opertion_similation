import re from 'fs'; // wait, no, we don't need fs for this, just helper functions

const TURKISH_SUFFIXES = [
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
];

const STOP_WORDS = new Set([
  "ve", "veya", "ile", "için", "bir", "bu", "şu", "o", "da", "de",
  "mi", "mı", "mu", "mü", "den", "dan", "ten", "tan", "deki", "daki",
  "olan", "olarak", "gibi", "kadar", "göre", "sonra", "önce",
  "tüm", "tümü", "hepsi", "bana", "lütfen", "örn", "geçen", "son",
  "ayki", "bugünkü", "dünkü",
]);

export function turkishToLower(str) {
  if (!str) return '';
  return str
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLowerCase();
}

export function normalizeKeyword(word) {
  const singleCharSuffixes = new Set(["a", "e", "ı", "i", "u", "ü"]);
  for (const suffix of TURKISH_SUFFIXES) {
    if (!word.endsWith(suffix)) {
      continue;
    }
    const rootLen = word.length - suffix.length;
    if (rootLen < 4) {
      continue;
    }
    if (singleCharSuffixes.has(suffix) && word.length < 6) {
      continue;
    }
    return word.slice(0, rootLen);
  }
  return word;
}

export function extractStems(text) {
  if (!text) return new Set();
  const lower = turkishToLower(text);
  // Match Turkish words
  const words = lower.match(/[a-zçığüşöâ\d]+/g) || [];
  const stems = new Set();
  for (const w of words) {
    if (STOP_WORDS.has(w) || w.length <= 2) {
      continue;
    }
    const stem = normalizeKeyword(w);
    if (stem.length > 2) {
      stems.add(stem);
    }
  }
  return stems;
}
// kök kelime haritası çıkarıyor eşleme kımmsında kullanıyor
export function buildKeywordIndexLocally(rawTools) {
  const keywordIndex = {};
  for (const tool of rawTools) {
    const combined = `${tool.name || ''} ${tool.description || ''}`;
    keywordIndex[tool.id] = extractStems(combined);
  }
  return keywordIndex;
}
