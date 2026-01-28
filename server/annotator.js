import { getDict } from "./dictLoader.js";

const CJK_LANGS = new Set(["zh_hans", "zh_hant", "ja", "yue"]);
const LOWER_LANGS = new Set(["en_US", "en_UK"]);

const MAX_TEXT_LEN = 50_000;

/**
 * @typedef {{ text: string, ipa?: string }} Span
 */

/**
 * Tokenize space-separated text into words and non-words (punctuation, whitespace).
 * @param {string} s
 * @returns {string[]}
 */
function tokenizeSpaceSeparated(s) {
  const tokens = [];
  const re = /[\w']+/g;
  let last = 0;
  let m;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) tokens.push(s.slice(last, m.index));
    tokens.push(m[0]);
    last = re.lastIndex;
  }
  if (last < s.length) tokens.push(s.slice(last));
  return tokens;
}

/**
 * Annotate using longest-match over the dictionary (CJK-style).
 * @param {string} text
 * @param {Map<string, string>} map
 * @param {number} maxKeyLen
 * @returns {Span[]}
 */
function annotateCJK(text, map, maxKeyLen) {
  const spans = [];
  let i = 0;
  const n = text.length;
  while (i < n) {
    let found = false;
    const limit = Math.min(maxKeyLen, n - i);
    for (let len = limit; len >= 1; len--) {
      const sub = text.slice(i, i + len);
      const ipa = map.get(sub);
      if (ipa != null) {
        spans.push({ text: sub, ipa });
        i += len;
        found = true;
        break;
      }
    }
    if (!found) {
      spans.push({ text: text[i] });
      i += 1;
    }
  }
  return spans;
}

/**
 * Annotate space-separated text (e.g. en, de, fr).
 * @param {string} text
 * @param {Map<string, string>} map
 * @param {boolean} lowercaseLookup
 * @returns {Span[]}
 */
function annotateSpaceSeparated(text, map, lowercaseLookup) {
  const tokens = tokenizeSpaceSeparated(text);
  const spans = [];
  for (const t of tokens) {
    const isWord = /^[\w']+$/.test(t);
    if (isWord) {
      const key = lowercaseLookup ? t.toLowerCase() : t;
      const ipa = map.get(key);
      spans.push(ipa != null ? { text: t, ipa } : { text: t });
    } else {
      spans.push({ text: t });
    }
  }
  return spans;
}

/**
 * @param {string} lang
 * @param {string} text
 * @returns {Span[]}
 */
export function annotate(lang, text) {
  if (typeof text !== "string") return [];
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (text.length > MAX_TEXT_LEN) text = text.slice(0, MAX_TEXT_LEN);
  const { map, maxKeyLen } = getDict(lang);
  const cjk = CJK_LANGS.has(lang);
  const lower = LOWER_LANGS.has(lang);
  if (cjk) return annotateCJK(text, map, maxKeyLen);
  return annotateSpaceSeparated(text, map, lower);
}
