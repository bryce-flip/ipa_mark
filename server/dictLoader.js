import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const JSON_DIR = join(__dirname, "..", "json");

const cache = new Map();
const LOWER_LANGS = new Set(["en_US", "en_UK"]);

/**
 * @returns {string[]} Language codes from json/*.json
 */
export function listLanguages() {
  try {
    const names = readdirSync(JSON_DIR);
    return names
      .filter((n) => n.endsWith(".json"))
      .map((n) => n.slice(0, -5))
      .sort();
  } catch (_) {
    return [];
  }
}

/**
 * Lazy-load dictionary for a language. Returns { map, maxKeyLen }.
 * @param {string} lang
 * @returns {{ map: Map<string, string>, maxKeyLen: number }}
 */
export function getDict(lang) {
  if (cache.has(lang)) return cache.get(lang);
  const file = join(JSON_DIR, `${lang}.json`);
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    throw new Error(`Dictionary not found: ${lang}`);
  }
  const rootKey = Object.keys(data)[0];
  const raw = data[rootKey];
  const arr = Array.isArray(raw) ? raw[0] : raw;
  const map = new Map();
  let maxKeyLen = 0;
  const useLower = LOWER_LANGS.has(lang);
  for (const [key, val] of Object.entries(arr)) {
    if (typeof val !== "string") continue;
    // 多音标词条（如 "/ˈwɪð/, /ˈwɪθ/"）只取第一条，避免一个词显示多个标记
    const ipa = val.includes(", ") ? val.split(", ")[0].trim() : val;
    const k = useLower ? key.toLowerCase() : key;
    map.set(k, ipa);
    if (key.length > maxKeyLen) maxKeyLen = key.length;
  }
  const out = { map, maxKeyLen };
  cache.set(lang, out);
  return out;
}

/**
 * 查询单个词在指定语言下的 IPA 音标。
 * @param {string} lang
 * @param {string} word
 * @returns {string|null} 音标字符串或 null（未找到）
 */
export function getIpa(lang, word) {
  if (typeof word !== "string" || !word.trim()) return null;
  const { map } = getDict(lang);
  const key = LOWER_LANGS.has(lang) ? word.trim().toLowerCase() : word.trim();
  return map.get(key) ?? null;
}
