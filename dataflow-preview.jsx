import { useState, useEffect, useRef } from "react";

const ACCENT = "#6c63ff";
const ACCENT2 = "#00d4ff";
const ACCENT3 = "#ff6584";
const SUCCESS = "#00e5a0";
const BG = "#050508";
const SURFACE = "#0d0d14";
const MUTED = "#6b6b80";
const TEXT = "#e8e8f0";
const BORDER = "rgba(255,255,255,0.07)";

// ── 3D Particle Canvas ──────────────────────────────
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let W, H, animId;
    const COLORS = ["108,99,255", "0,212,255", "255,101,132"];

    class Particle {
      constructor() { this.reset(true); }
      reset(rand) {
        this.x = rand ? Math.random() * W : W / 2;
        this.y = rand ? Math.random() * H : H / 2;
        this.z = Math.random() * 900 + 50;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.vz = (Math.random() - 0.5) * 1.5;
        this.r = Math.random() * 1.4 + 0.4;
      }
      update() {
        this.x += this.vx; this.y += this.vy; this.z += this.vz;
        if (this.x < 0 || this.x > W) this.vx *= -1;
        if (this.y < 0 || this.y > H) this.vy *= -1;
        if (this.z < 10 || this.z > 950) this.vz *= -1;
      }
      get proj() {
        const s = 550 / (550 + this.z);
        return { px: (this.x - W / 2) * s + W / 2, py: (this.y - H / 2) * s + H / 2, s };
      }
    }

    let particles = [];
    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      if (!particles.length) for (let i = 0; i < 110; i++) particles.push(new Particle());
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i].proj;
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j].proj;
          const d = Math.hypot(a.px - b.px, a.py - b.py);
          if (d < 115) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${COLORS[(i + j) % 3]},${(1 - d / 115) * 0.13})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(a.px, a.py); ctx.lineTo(b.px, b.py); ctx.stroke();
          }
        }
      }
      particles.forEach((p, i) => {
        const { px, py, s } = p.proj;
        ctx.beginPath();
        ctx.arc(px, py, p.r * s * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${COLORS[i % 3]},${0.45 * s})`;
        ctx.fill();
        p.update();
      });
      animId = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    draw();
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} />;
}

// ── Helpers ─────────────────────────────────────────
function GradText({ children, style }) {
  return (
    <span style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2}, ${ACCENT3})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", ...style }}>
      {children}
    </span>
  );
}

function PulseDot() {
  return (
    <span style={{
      display: "inline-block", width: 7, height: 7, background: SUCCESS, borderRadius: "50%",
      animation: "pulse 2s infinite"
    }} />
  );
}

// ── Sections ─────────────────────────────────────────
function Nav({ active, setActive }) {
  return (
    <nav style={{
      position: "fixed", top: 0, width: "100%", zIndex: 100,
      padding: "18px 40px", display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "rgba(5,5,8,0.75)", backdropFilter: "blur(20px)",
      borderBottom: `1px solid ${BORDER}`
    }}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 21, fontWeight: 700, background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -0.5 }}>
        Data<span style={{ WebkitTextFillColor: "rgba(255,255,255,0.35)", fontWeight: 300 }}> /</span>Flow
      </div>
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {["Tool", "Features", "How it Works"].map(l => (
          <button key={l} onClick={() => setActive(l)}
            style={{ background: "none", border: "none", color: active === l ? TEXT : MUTED, fontSize: 14, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
            {l}
          </button>
        ))}
        <button onClick={() => setActive("Tool")} style={{
          background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, border: "none", color: "white",
          padding: "9px 22px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif"
        }}>Start Free</button>
      </div>
    </nav>
  );
}

function Hero({ onTool }) {
  return (
    <section style={{
      position: "relative", zIndex: 10, minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "120px 20px 80px"
    }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.3)",
        padding: "6px 18px", borderRadius: 100, fontSize: 11, color: ACCENT2,
        letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 32,
        animation: "fadeDown 0.7s ease both"
      }}>
        <PulseDot /> No file size limits. No row limits. No nonsense.
      </div>

      <h1 style={{
        fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(50px,7vw,88px)",
        fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, marginBottom: 24, color: TEXT,
        animation: "fadeUp 0.8s 0.2s ease both"
      }}>
        Move data<br /><GradText>at any scale</GradText>
      </h1>

      <p style={{
        fontSize: 18, color: MUTED, maxWidth: 560, lineHeight: 1.75, marginBottom: 48,
        animation: "fadeUp 0.8s 0.35s ease both"
      }}>
        Split massive CSV files into clean chunks. Merge hundreds of sheets into one.
        Built for people who work with serious data volumes.
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.8s 0.5s ease both" }}>
        <button onClick={onTool} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, border: "none", color: "white",
          padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer",
          boxShadow: "0 0 40px rgba(108,99,255,0.35)", fontFamily: "Inter,sans-serif",
          transition: "transform 0.2s"
        }}>⚡ Start splitting &amp; merging</button>
        <button onClick={onTool} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "transparent", border: `1px solid ${BORDER}`, color: TEXT,
          padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: "pointer",
          fontFamily: "Inter,sans-serif"
        }}>See what it does →</button>
      </div>

      {/* floating data stream visual */}
      <div style={{ marginTop: 72, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", maxWidth: 700 }}>
        {["leads_2024_q1.csv","contacts_us.xlsx","prospects_uk.csv","outreach_au.tsv","crm_export.csv"].map((f, i) => (
          <div key={f} style={{
            background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10,
            padding: "10px 16px", fontSize: 12, color: MUTED, display: "flex", alignItems: "center", gap: 8,
            animation: `fadeUp 0.6s ${0.6 + i * 0.1}s ease both`
          }}>
            <span style={{ fontSize: 16 }}>{f.endsWith(".xlsx") ? "📗" : "📊"}</span>
            {f}
          </div>
        ))}
        <div style={{
          background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.25)", borderRadius: 10,
          padding: "10px 16px", fontSize: 12, color: SUCCESS, display: "flex", alignItems: "center", gap: 8,
          animation: "fadeUp 0.6s 1.1s ease both"
        }}>
          ✓ merged_final.csv — 2,847,392 rows
        </div>
      </div>
    </section>
  );
}

function StatsStrip() {
  const stats = [
    { num: "10M+", label: "Rows handled" },
    { num: "100", label: "Files per merge" },
    { num: "∞", label: "File size limit" },
    { num: "CSV XLSX TSV", label: "Formats supported" },
  ];
  return (
    <div style={{
      position: "relative", zIndex: 10, display: "flex", justifyContent: "center",
      gap: 60, flexWrap: "wrap", padding: "40px",
      borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`,
      background: "rgba(13,13,20,0.65)", backdropFilter: "blur(12px)"
    }}>
      {stats.map(s => (
        <div key={s.num} style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 34, fontWeight: 700, background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.num}</div>
          <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function Tool() {
  const [tab, setTab] = useState("merge");
  const [mergeFiles, setMergeFiles] = useState([
    { name: "leads_jan.csv", size: 2400000 },
    { name: "leads_feb.csv", size: 1850000 },
    { name: "leads_mar.xlsx", size: 3200000 },
  ]);
  const [splitFile, setSplitFile] = useState({ name: "big_export.csv", size: 48000000 });
  const [splitBy, setSplitBy] = useState("rows");
  const [chunkSize, setChunkSize] = useState(10000);
  const [parts, setParts] = useState(5);
  const [mergeResult, setMergeResult] = useState(null);
  const [splitResult, setSplitResult] = useState(null);
  const [merging, setMerging] = useState(false);
  const [splitting, setSplitting] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [splitProgress, setSplitProgress] = useState(0);

  function fmt(b) {
    if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
    return (b / 1048576).toFixed(1) + " MB";
  }

  function simulateMerge() {
    setMerging(true); setMergeResult(null); setMergeProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p = Math.min(95, p + Math.random() * 12);
      setMergeProgress(p);
      if (p >= 95) { clearInterval(iv); setMergeProgress(100); setTimeout(() => { setMerging(false); setMergeResult({ rows: 284739, cols: 14, files: mergeFiles.length }); }, 300); }
    }, 150);
  }

  function simulateSplit() {
    setSplitting(true); setSplitResult(null); setSplitProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p = Math.min(95, p + Math.random() * 14);
      setSplitProgress(p);
      if (p >= 95) { clearInterval(iv); setSplitProgress(100); setTimeout(() => { setSplitting(false); setSplitResult({ rows: 1200000, partsOut: splitBy === "rows" ? Math.ceil(1200000 / chunkSize) : parts }); }, 300); }
    }, 150);
  }

  const cardStyle = {
    background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 36,
    position: "relative", overflow: "hidden"
  };

  const dropStyle = {
    border: "2px dashed rgba(108,99,255,0.3)", borderRadius: 14, padding: "48px 20px",
    textAlign: "center", background: "rgba(108,99,255,0.03)", cursor: "pointer"
  };

  const fileItem = (name, size, onRemove) => (
    <div key={name} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`,
      borderRadius: 10, padding: "11px 16px", fontSize: 13
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18 }}>{name.endsWith(".xlsx") ? "📗" : "📊"}</span>
        <div>
          <div style={{ fontWeight: 500, color: TEXT }}>{name}</div>
          <div style={{ fontSize: 12, color: MUTED }}>{fmt(size)}</div>
        </div>
      </div>
      {onRemove && <button onClick={onRemove} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: 15 }}>✕</button>}
    </div>
  );

  return (
    <section style={{ position: "relative", zIndex: 10, maxWidth: 860, margin: "80px auto", padding: "0 20px" }}>
      <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: ACCENT, marginBottom: 10, textAlign: "center" }}>— The Tool</div>
      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(30px,4vw,46px)", fontWeight: 700, textAlign: "center", letterSpacing: -1, marginBottom: 14, color: TEXT }}>Drop your files. Done.</h2>
      <p style={{ color: MUTED, textAlign: "center", fontSize: 16, marginBottom: 44, lineHeight: 1.65 }}>No accounts. No waiting. Your data never leaves your browser until it's processed.</p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 4, marginBottom: 28 }}>
        {[["merge", "🔀 Merge Files"], ["split", "✂️ Split File"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex: 1, padding: "12px 20px", border: "none", borderRadius: 9, cursor: "pointer",
            background: tab === key ? `linear-gradient(135deg,${ACCENT},${ACCENT2})` : "transparent",
            color: tab === key ? "white" : MUTED, fontSize: 14, fontWeight: 500,
            fontFamily: "Inter,sans-serif", boxShadow: tab === key ? "0 4px 20px rgba(108,99,255,0.3)" : "none",
            transition: "all 0.2s"
          }}>{label}</button>
        ))}
      </div>

      {/* MERGE */}
      {tab === "merge" && (
        <div style={cardStyle}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${ACCENT},transparent)` }} />
          <div style={dropStyle}>
            <div style={{ fontSize: 44, marginBottom: 14, animation: "float 5s ease-in-out infinite" }}>📂</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 19, fontWeight: 600, color: TEXT, marginBottom: 8 }}>Drop your files here</div>
            <div style={{ color: MUTED, fontSize: 14, lineHeight: 1.6 }}>CSV, XLSX, XLS, TSV — as many as you need</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)", color: SUCCESS, padding: "4px 14px", borderRadius: 100, fontSize: 11, marginTop: 12 }}>
              ✓ No size limit &nbsp;·&nbsp; ✓ Up to 100 files &nbsp;·&nbsp; ✓ 10M+ rows
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 18 }}>
            {mergeFiles.map((f, i) => fileItem(f.name, f.size, () => setMergeFiles(mergeFiles.filter((_, j) => j !== i))))}
          </div>

          <button onClick={simulateMerge} disabled={merging || mergeFiles.length < 2} style={{
            width: "100%", marginTop: 22, padding: 16,
            background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, border: "none", borderRadius: 12,
            color: "white", fontSize: 16, fontWeight: 600, cursor: "pointer",
            fontFamily: "'Space Grotesk',sans-serif", boxShadow: "0 0 40px rgba(108,99,255,0.3)",
            opacity: merging ? 0.7 : 1
          }}>
            {merging ? "⏳ Merging..." : "🔀 Merge All Files"}
          </button>

          {(merging || mergeResult) && (
            <div style={{ marginTop: 20 }}>
              {merging && (
                <>
                  <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 100, height: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: `linear-gradient(90deg,${ACCENT},${ACCENT2})`, width: mergeProgress + "%", transition: "width 0.2s", borderRadius: 100 }} />
                  </div>
                  <div style={{ fontSize: 13, color: MUTED, marginTop: 8, textAlign: "center" }}>Merging {mergeFiles.length} files...</div>
                </>
              )}
              {!merging && mergeResult && (
                <div style={{ background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: 12, padding: 24, textAlign: "center" }}>
                  <div style={{ fontSize: 34, marginBottom: 10 }}>✅</div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 600, color: SUCCESS, marginBottom: 10 }}>Merge complete</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 16 }}>
                    {[["284,739", "Total rows"], [mergeResult.cols, "Columns"], [mergeResult.files, "Files merged"]].map(([n, l]) => (
                      <div key={l}>
                        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 700, color: TEXT }}>{n}</div>
                        <div style={{ fontSize: 12, color: MUTED }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <button style={{ display: "inline-flex", alignItems: "center", gap: 8, background: SUCCESS, color: "#000", padding: "11px 28px", borderRadius: 10, fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}>
                    ⬇ Download merged file
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SPLIT */}
      {tab === "split" && (
        <div style={cardStyle}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${ACCENT2},transparent)` }} />
          <div style={dropStyle}>
            <div style={{ fontSize: 44, marginBottom: 14, animation: "float 5s ease-in-out infinite" }}>📄</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 19, fontWeight: 600, color: TEXT, marginBottom: 8 }}>Drop a single file to split</div>
            <div style={{ color: MUTED, fontSize: 14 }}>Works with files of any size — no row limit</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)", color: SUCCESS, padding: "4px 14px", borderRadius: 100, fontSize: 11, marginTop: 12 }}>
              ✓ Custom chunk sizes &nbsp;·&nbsp; ✓ Instant ZIP download
            </div>
          </div>

          {splitFile && (
            <div style={{ marginTop: 16 }}>
              {fileItem(splitFile.name, splitFile.size, () => setSplitFile(null))}
            </div>
          )}

          {splitFile && (
            <div style={{ display: "flex", gap: 14, marginTop: 22, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>Split by</div>
                <select value={splitBy} onChange={e => setSplitBy(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", color: TEXT, fontSize: 14, fontFamily: "Inter,sans-serif", outline: "none" }}>
                  <option value="rows">Rows per file</option>
                  <option value="parts">Number of equal parts</option>
                </select>
              </div>
              {splitBy === "rows" ? (
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 11, color: MUTED, marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>Rows per chunk</div>
                  <input type="number" value={chunkSize} onChange={e => setChunkSize(+e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", color: TEXT, fontSize: 14, fontFamily: "Inter,sans-serif", outline: "none" }} />
                </div>
              ) : (
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 11, color: MUTED, marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>Number of parts</div>
                  <input type="number" value={parts} onChange={e => setParts(+e.target.value)} min={2} max={100} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", color: TEXT, fontSize: 14, fontFamily: "Inter,sans-serif", outline: "none" }} />
                </div>
              )}
            </div>
          )}

          <button onClick={simulateSplit} disabled={splitting || !splitFile} style={{
            width: "100%", marginTop: 22, padding: 16,
            background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, border: "none", borderRadius: 12,
            color: "white", fontSize: 16, fontWeight: 600, cursor: "pointer",
            fontFamily: "'Space Grotesk',sans-serif", boxShadow: "0 0 40px rgba(108,99,255,0.3)",
            opacity: (splitting || !splitFile) ? 0.6 : 1
          }}>
            {splitting ? "⏳ Splitting..." : "✂️ Split File"}
          </button>

          {(splitting || splitResult) && (
            <div style={{ marginTop: 20 }}>
              {splitting && (
                <>
                  <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 100, height: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: `linear-gradient(90deg,${ACCENT},${ACCENT2})`, width: splitProgress + "%", transition: "width 0.2s", borderRadius: 100 }} />
                  </div>
                  <div style={{ fontSize: 13, color: MUTED, marginTop: 8, textAlign: "center" }}>Splitting file into {splitBy === "rows" ? `${chunkSize.toLocaleString()}-row` : parts} chunks...</div>
                </>
              )}
              {!splitting && splitResult && (
                <div style={{ background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: 12, padding: 24, textAlign: "center" }}>
                  <div style={{ fontSize: 34, marginBottom: 10 }}>✅</div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 600, color: SUCCESS, marginBottom: 10 }}>Split complete</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 16 }}>
                    {[["1,200,000", "Total rows"], [splitResult.partsOut, "Parts created"]].map(([n, l]) => (
                      <div key={l}>
                        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 700, color: TEXT }}>{n}</div>
                        <div style={{ fontSize: 12, color: MUTED }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <button style={{ display: "inline-flex", alignItems: "center", gap: 8, background: SUCCESS, color: "#000", padding: "11px 28px", borderRadius: 10, fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}>
                    ⬇ Download ZIP
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Features() {
  const list = [
    { icon: "⚡", title: "No size limit, ever", text: "Upload files with millions of rows. No cap on file size. No choking at 100MB like every other tool." },
    { icon: "🔀", title: "Merge up to 100 files", text: "Stack CSVs, XLSXs, and TSVs into one clean output. Columns aligned automatically. One download." },
    { icon: "✂️", title: "Smart splitting", text: "Split by row count or equal parts. All chunks come in a ZIP ready to use immediately." },
    { icon: "🗂️", title: "Multi-format support", text: "CSV, XLSX, XLS, TSV — mix and match. Output always comes out clean." },
    { icon: "🔒", title: "Your data stays yours", text: "Files are processed server-side and immediately deleted after download. Nothing is stored." },
    { icon: "🚀", title: "Built in Python", text: "Powered by pandas — the same engine data engineers use to process billions of rows." },
  ];
  return (
    <section style={{ position: "relative", zIndex: 10, maxWidth: 1080, margin: "80px auto", padding: "0 20px" }} id="features">
      <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: ACCENT, marginBottom: 10, textAlign: "center" }}>— Built for scale</div>
      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(30px,4vw,44px)", fontWeight: 700, textAlign: "center", letterSpacing: -1, marginBottom: 14, color: TEXT }}>Why Data Flow</h2>
      <p style={{ color: MUTED, textAlign: "center", fontSize: 16, marginBottom: 44, lineHeight: 1.65 }}>Every decision made for people who work with large data every day.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 18 }}>
        {list.map(f => (
          <div key={f.title} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28, transition: "border-color 0.3s, transform 0.3s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(108,99,255,0.35)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "none"; }}>
            <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 17, fontWeight: 600, color: TEXT, marginBottom: 8 }}>{f.title}</div>
            <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7 }}>{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Drop your files", text: "Drag and drop any CSV, XLSX, or TSV file. No account needed, no size restriction, no format negotiation." },
    { n: "02", title: "Choose what to do", text: "Merging multiple files into one? Or splitting one big file into smaller chunks? Set your parameters and hit go." },
    { n: "03", title: "Download and use", text: "Your processed file is ready in seconds. Load it into Clay, Apollo, Instantly — wherever it needs to go." },
  ];
  return (
    <section style={{ position: "relative", zIndex: 10, maxWidth: 860, margin: "80px auto", padding: "0 20px" }} id="how">
      <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: ACCENT, marginBottom: 10, textAlign: "center" }}>— Simple process</div>
      <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(30px,4vw,44px)", fontWeight: 700, textAlign: "center", letterSpacing: -1, marginBottom: 48, color: TEXT }}>Three steps to done</h2>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: "flex", gap: 28, alignItems: "flex-start", padding: "30px 0", borderBottom: i < 2 ? `1px solid ${BORDER}` : "none" }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 48, fontWeight: 700, color: "rgba(108,99,255,0.13)", lineHeight: 1, minWidth: 64 }}>{s.n}</div>
          <div>
            <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 600, color: TEXT, marginBottom: 8 }}>{s.title}</h3>
            <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.7 }}>{s.text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "60px 20px 40px", borderTop: `1px solid ${BORDER}`, color: MUTED, fontSize: 13 }}>
      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 14 }}>Data Flow</div>
      <p>Merge. Split. Move on. — Built for serious lead gen and data operations.</p>
      <p style={{ marginTop: 12 }}>© 2026 Data Flow. All data deleted immediately after processing.</p>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────
export default function App() {
  const [activeNav, setActiveNav] = useState("Hero");

  function scrollToTool() {
    document.getElementById("tool-section")?.scrollIntoView({ behavior: "smooth" });
    setActiveNav("Tool");
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "Inter,sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.6); } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        * { box-sizing:border-box; margin:0; padding:0; }
        select option { background:#0d0d14; color:#e8e8f0; }
      `}</style>

      <ParticleCanvas />
      <Nav active={activeNav} setActive={setActiveNav} />
      <Hero onTool={scrollToTool} />
      <StatsStrip />
      <div id="tool-section"><Tool /></div>
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
}
