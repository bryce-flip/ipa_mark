import { useState, useEffect } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "";

export default function App() {
  const [languages, setLanguages] = useState([]);
  const [lang, setLang] = useState("");
  const [text, setText] = useState("");
  const [spans, setSpans] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [languagesFetched, setLanguagesFetched] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [lookupWord, setLookupWord] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/languages`)
      .then((r) => r.json())
      .then((d) => {
        const list = d.languages || [];
        setLanguages(list);
        if (list.length && !lang) setLang(list[0]);
      })
      .catch(() => setError("无法获取语言列表"))
      .finally(() => setLanguagesFetched(true));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSpans(null);
    if (!lang || !text.trim()) return;
    setLoading(true);
    fetch(`${API}/api/annotate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang, text: text.trim() }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(new Error(d.error || "标注失败")));
        return r.json();
      })
      .then((d) => {
        setSpans(d.spans || []);
      })
      .catch((err) => setError(err.message || "标注失败，请重试"))
      .finally(() => setLoading(false));
  };

  const handleCopy = async () => {
    if (!spans) return;
    
    // 生成HTML格式的内容，Word可以识别
    const htmlContent = spans.map((s) => {
      if (s.text === "\n") return "<br>";
      if (s.ipa != null) {
        return `<ruby>${s.text}<rt>${s.ipa}</rt></ruby>`;
      }
      return s.text;
    }).join("");

    // 生成纯文本格式作为后备
    const textContent = spans.map((s) => {
      if (s.text === "\n") return "\n";
      if (s.ipa != null) {
        return `${s.text}(${s.ipa})`;
      }
      return s.text;
    }).join("");

    try {
      // 使用 Clipboard API 复制HTML格式
      const clipboardItem = new ClipboardItem({
        "text/html": new Blob([htmlContent], { type: "text/html" }),
        "text/plain": new Blob([textContent], { type: "text/plain" }),
      });
      await navigator.clipboard.write([clipboardItem]);
      
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // 如果 ClipboardItem 不支持，使用传统方法
      try {
        const textarea = document.createElement("textarea");
        textarea.value = textContent;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (e) {
        setError("复制失败，请手动选择文本复制");
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleLookup = (e) => {
    e.preventDefault();
    setLookupError("");
    setLookupResult(null);
    const word = lookupWord.trim();
    if (!lang || !word) return;
    setLookupLoading(true);
    fetch(`${API}/api/lookup?lang=${encodeURIComponent(lang)}&word=${encodeURIComponent(word)}`)
      .then((r) => {
        if (r.status === 404) return r.json().then((d) => ({ notFound: true, word: d.word || word }));
        if (!r.ok) return r.json().then((d) => Promise.reject(new Error(d.error || "查询失败")));
        return r.json();
      })
      .then((d) => {
        if (d.notFound) setLookupResult("not_found");
        else setLookupResult({ word: d.word, ipa: d.ipa });
      })
      .catch((err) => setLookupError(err.message || "查询失败，请重试"))
      .finally(() => setLookupLoading(false));
  };

  return (
    <div className="app">
      <header className="header">
        <h1>IPA 音标标注</h1>
        <p className="subtitle">输入文本，选择语言，获取注音标注</p>
      </header>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <label htmlFor="lang">语言</label>
          <select
            id="lang"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            disabled={!languages.length}
          >
            {!languages.length && (
              <option value="">— 加载中 —</option>
            )}
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          {!languagesFetched && (
            <span className="hint">加载语言列表…</span>
          )}
          {languagesFetched && !languages.length && !error && (
            <span className="hint">无可用音标库。</span>
          )}
        </div>
        <div className="form-row lookup-row">
          <label htmlFor="lookup-word">查询音标</label>
          <div className="lookup-inline">
            <input
              id="lookup-word"
              type="text"
              value={lookupWord}
              onChange={(e) => setLookupWord(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleLookup(e);
                }
              }}
              placeholder="输入单词查询"
              disabled={!languages.length}
              className="lookup-input"
            />
            <button
              type="button"
              className="btn btn-lookup"
              onClick={handleLookup}
              disabled={lookupLoading || !languages.length || !lookupWord.trim()}
            >
              {lookupLoading ? "查询中…" : "查询"}
            </button>
          </div>
          {lookupResult && (
            <div className="lookup-result">
              {lookupResult === "not_found" ? (
                <span className="lookup-not-found">未找到该词</span>
              ) : (
                <ruby className="lookup-ruby">
                  {lookupResult.word}
                  <rt>{lookupResult.ipa}</rt>
                </ruby>
              )}
            </div>
          )}
          {lookupError && <span className="lookup-error">{lookupError}</span>}
        </div>
        <div className="form-row">
          <label htmlFor="text">段落标注</label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="粘贴或输入待标注文本"
            rows={6}
            disabled={!languages.length}
          />
        </div>
        <button
          type="submit"
          className="btn"
          disabled={loading || !languages.length || !text.trim()}
        >
          {loading ? "标注中…" : "标注"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {spans && (
        <section className="output">
          <div className="output-header">
            <h2>标注结果</h2>
            <div className="action-buttons">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCopy}
              >
                {copySuccess ? "✓ 已复制" : "复制到Word"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handlePrint}
              >
                打印
              </button>
            </div>
          </div>
          <div className="ruby-block" id="print-content">
            {spans.map((s, i) =>
              s.text === "\n" ? (
                <br key={i} />
              ) : s.ipa != null ? (
                <ruby key={i}>
                  {s.text}
                  <rt>{s.ipa}</rt>
                </ruby>
              ) : (
                <span key={i}>{s.text}</span>
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
}
