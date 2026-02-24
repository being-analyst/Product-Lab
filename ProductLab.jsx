import { useState, useRef, useEffect } from "react";

const IG = "linear-gradient(135deg,#FCAF45,#F77737,#E1306C,#833AB4)";
const IGS = "linear-gradient(135deg,rgba(252,175,69,0.08),rgba(225,48,108,0.06),rgba(131,58,180,0.05))";
const C = {
  bg:"#FAFAFA", white:"#FFFFFF", border:"#DBDBDB",
  text:"#262626", sub:"#737373", muted:"#C7C7C7",
  accent:"#E1306C", accentL:"#FDE8F0",
  blue:"#0095F6", blueL:"#E8F3FD",
  green:"#00BA84", greenL:"#E6FFF7",
  orange:"#F77737", orangeL:"#FFF3EC",
  purple:"#833AB4", purpleL:"#F5EDF8",
  gold:"#C77C1A", goldL:"#FFF8EC",
};
const TIER_STYLE = {
  "Mass":{ bg:"#F0F0F0", color:"#737373" },
  "Mass-Premium":{ bg:C.goldL, color:C.gold },
  "Premium":{ bg:C.purpleL, color:C.purple },
  "Ultra-Premium":{ bg:C.accentL, color:C.accent },
};
const REC_STYLE = {
  "HIGH":{ bg:"#E6FFF7", color:C.green, label:"★ Strongly Recommend" },
  "MEDIUM":{ bg:C.goldL, color:C.gold, label:"◆ Worth Exploring" },
  "LOW":{ bg:"#F5F5F5", color:C.sub, label:"○ Niche Play" },
};
const CATS = [
  { id:"haircare",    label:"Hair Care",       icon:"✂️" },
  { id:"skincare",    label:"Skin Care",        icon:"✨" },
  { id:"supplements", label:"Supplements",      icon:"💊" },
  { id:"mens",        label:"Men's Wellness",   icon:"⚡" },
  { id:"womens",      label:"Women's Wellness", icon:"🌸" },
  { id:"gut",         label:"Gut & Digestion",  icon:"🫁" },
  { id:"sleep",       label:"Sleep & Stress",   icon:"🌙" },
  { id:"baby",        label:"Baby Care",        icon:"🍼" },
];

/* ─── SYSTEM PROMPT ─────────────────────────────────────────────────────────── */
const SYSTEM = `You are a D2C product innovation strategist for the Indian market.

Simulate deep mining of: Amazon India reviews, Flipkart reviews, Nykaa ratings & Q&As, Reddit (r/IndianSkincareAddicts r/IndianHairLossRecovery r/india r/TwoXIndia), Google Trends India, Twitter India, Quora India.

Return ONLY a single valid JSON object — no markdown, no code fences, no explanation, nothing outside the JSON.

Use this EXACT structure (all fields required):
{
  "name": "Creative product name",
  "tagline": "Punchy hook max 8 words",
  "format": "One of: Serum / Gummy / Tablet / Shampoo / Oil / Cream / Capsule / Powder / Mist / Mask / Spray / Gel / Drops / Bar / Patch",
  "tier": "One of: Mass / Mass-Premium / Premium / Ultra-Premium",
  "rec": "One of: HIGH / MEDIUM / LOW",
  "rec_reason": "One sentence why this recommendation tier — be specific",
  "age": "e.g. 24-34",
  "gender": "Female or Male or Unisex",
  "persona": "2 sentences about the target consumer lifestyle and problem",
  "location": "One of: Metro-focused / All India / Tier-2/3 / Coastal cities",
  "problem": "The specific consumer pain point with a cited stat or data point",
  "quote": "A realistic consumer quote from Reddit or Amazon review",
  "why_now": "One sentence on market timing and tailwind",
  "ing1_name": "Hero Ingredient 1 name",
  "ing1_why": "Scientific mechanism — why this ingredient works for this problem",
  "ing1_type": "One of: Natural / Clinically-tested / Ayurvedic / Patented",
  "ing2_name": "Hero Ingredient 2 name",
  "ing2_why": "Scientific mechanism",
  "ing2_type": "One of: Natural / Clinically-tested / Ayurvedic / Patented",
  "ing3_name": "Hero Ingredient 3 name",
  "ing3_why": "Scientific mechanism",
  "ing3_type": "One of: Natural / Clinically-tested / Ayurvedic / Patented",
  "claim": "Bold but defensible hero marketing claim",
  "texture": "Sensory experience — what it looks, feels and smells like",
  "format_why": "Why this format beats alternatives for this consumer",
  "price": "Rs.XXX-XXX",
  "pack": "e.g. 30ml or 60 capsules or 150g",
  "per_day": "Rs.X/day or Rs.X/use",
  "price_why": "Why this price point fits this segment — specific competitor comparison",
  "comp1": "Real Indian or global competitor brand name",
  "comp1_gap": "Specific gap or weakness this competitor has",
  "comp2": "Second real competitor brand name",
  "comp2_gap": "Specific gap or weakness",
  "white_space": "The precise unserved market gap this product fills",
  "ev1_src": "Source platform name e.g. Reddit / Amazon India / Google Trends India / Nykaa",
  "ev1_stat": "Specific finding with number — e.g. '4.1K upvotes, top comment says...'",
  "ev2_src": "Source platform name",
  "ev2_stat": "Specific finding with number",
  "ev3_src": "Source platform name",
  "ev3_stat": "Specific finding with number",
  "gtm_channel": "Primary D2C launch channel",
  "gtm_hook": "Specific viral campaign angle or hook",
  "gtm_influencer": "Influencer type, niche and follower tier",
  "d2c_fit": 8,
  "mfg_complexity": 4,
  "reg_ease": 7,
  "risk": "Main risk and specific mitigation strategy",
  "market_size": 8,
  "novelty": 9,
  "competition": 3,
  "urgency": 8,
  "brand_fit": 8,
  "overall": 8,
  "verdict": "One powerful sentence why a D2C brand should build this NOW"
}

Scoring rules:
- All scores are integers 1-10
- competition: 1=blue ocean with no competitors, 10=extremely crowded market (LOWER = better opportunity)
- mfg_complexity: 1=very simple to manufacture, 10=very complex (LOWER = better)
- All other scores: HIGHER = better

Be specific: use real Indian brand names as competitors, cite realistic stats with numbers, name specific Reddit threads or Amazon review patterns. Make every concept genuinely unique — do not repeat generic ideas.

CRITICAL: Return ONLY the JSON object. No text before or after.`;

/* ─── HELPERS ────────────────────────────────────────────────────────────────── */
function Chip({ children, bg = C.blueL, color = C.blue, style = {} }) {
  return (
    <span style={{ background: bg, color, borderRadius: 20, padding: "3px 11px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", ...style }}>
      {children}
    </span>
  );
}

function Ring({ value = 5 }) {
  const v = Math.min(10, Math.max(0, value || 0));
  const r = 17, circ = 2 * Math.PI * r;
  const col = v >= 7 ? C.green : v >= 5 ? C.orange : C.accent;
  return (
    <div style={{ position: "relative", width: 46, height: 46 }}>
      <svg width={46} height={46} style={{ transform: "rotate(-90deg)", position: "absolute", inset: 0 }}>
        <circle cx={23} cy={23} r={r} fill="none" stroke={col + "25"} strokeWidth={4} />
        <circle cx={23} cy={23} r={r} fill="none" stroke={col} strokeWidth={4}
          strokeDasharray={`${(v / 10) * circ} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: col }}>{v}</div>
    </div>
  );
}

function Bar({ value = 5, invert = false }) {
  const v = invert ? Math.max(1, 11 - (value || 1)) : (value || 1);
  const col = v >= 7 ? C.green : v >= 5 ? C.orange : C.accent;
  return (
    <div style={{ height: 5, background: "#E8E8E8", borderRadius: 3, overflow: "hidden", marginTop: 3 }}>
      <div style={{ width: `${v * 10}%`, height: "100%", background: col, borderRadius: 3 }} />
    </div>
  );
}

/* ─── CONCEPT CARD ───────────────────────────────────────────────────────────── */
function ConceptCard({ c, index, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const ts = TIER_STYLE[c.tier] || TIER_STYLE["Mass"];
  const rs = REC_STYLE[c.rec] || REC_STYLE["MEDIUM"];
  const blueOcean = Math.max(1, 11 - (c.competition || 5));

  return (
    <div style={{ background: C.white, border: `1.5px solid ${c.rec === "HIGH" ? C.green : C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 12, boxShadow: c.rec === "HIGH" ? "0 2px 16px rgba(0,186,132,0.1)" : "0 1px 5px rgba(0,0,0,0.05)" }}>

      {/* ── HEADER ── */}
      <div onClick={() => setOpen(o => !o)} style={{ padding: "16px 18px", cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: IG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>#{index + 1}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 5 }}>
            <span style={{ background: rs.bg, color: rs.color, borderRadius: 20, padding: "3px 11px", fontSize: 11, fontWeight: 800 }}>{rs.label}</span>
            <Chip bg={ts.bg} color={ts.color}>{c.tier}</Chip>
            <Chip bg={C.orangeL} color={C.orange}>{c.format}</Chip>
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: C.text, letterSpacing: "-0.4px", lineHeight: 1.2 }}>{c.name}</div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 3, fontStyle: "italic" }}>{c.tagline}</div>
          <div style={{ fontSize: 11, color: rs.color, marginTop: 5, fontWeight: 600 }}>{c.rec_reason}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: IG, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{c.overall}</span>
          </div>
          <div style={{ fontSize: 8, color: C.muted, marginTop: 2, fontWeight: 700, letterSpacing: "0.5px" }}>SCORE</div>
        </div>
        <div style={{ fontSize: 18, color: C.muted, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0, alignSelf: "center" }}>⌄</div>
      </div>

      {/* ── EXPANDED BODY ── */}
      {open && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: 18 }}>

          {/* PM Verdict */}
          <div style={{ background: IGS, border: `1px solid ${C.accentL}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: C.accent, marginBottom: 6 }}>PM VERDICT</div>
            <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.7, fontWeight: 500 }}>{c.verdict}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

            {/* LEFT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              {/* Target Consumer */}
              <div style={{ background: C.purpleL, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: C.purple, marginBottom: 8 }}>TARGET CONSUMER</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                  <Chip bg={C.white} color={C.purple} style={{ fontSize: 10 }}>{c.age}</Chip>
                  <Chip bg={C.white} color={C.purple} style={{ fontSize: 10 }}>{c.gender}</Chip>
                  <Chip bg={C.white} color={C.purple} style={{ fontSize: 10 }}>{c.location}</Chip>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: C.text, lineHeight: 1.55 }}>{c.persona}</p>
              </div>

              {/* Problem */}
              <div style={{ background: "#FFF0F0", border: `1px solid #FFD6D6`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: C.accent, marginBottom: 8 }}>CONSUMER PROBLEM</div>
                <p style={{ margin: "0 0 10px", fontSize: 12, color: C.text, lineHeight: 1.6, fontWeight: 600 }}>{c.problem}</p>
                {c.quote && (
                  <div style={{ background: "#FDE8F0", borderRadius: 7, padding: "8px 10px", borderLeft: `3px solid ${C.accent}` }}>
                    <div style={{ fontSize: 10, color: C.sub, fontStyle: "italic", lineHeight: 1.5 }}>"{c.quote}"</div>
                  </div>
                )}
              </div>

              {/* Why Now */}
              <div style={{ background: C.goldL, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: C.gold, marginBottom: 6 }}>WHY NOW</div>
                <p style={{ margin: 0, fontSize: 12, color: C.text, lineHeight: 1.55 }}>{c.why_now}</p>
              </div>

              {/* Evidence */}
              <div style={{ background: C.greenL, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: C.green, marginBottom: 8 }}>CITED EVIDENCE</div>
                {[[c.ev1_src, c.ev1_stat], [c.ev2_src, c.ev2_stat], [c.ev3_src, c.ev3_stat]].filter(([s]) => s).map(([src, stat], i) => (
                  <div key={i} style={{ display: "flex", gap: 7, marginBottom: 6, alignItems: "flex-start" }}>
                    <span style={{ background: C.green, color: "#fff", fontSize: 8, fontWeight: 800, borderRadius: 3, padding: "2px 4px", flexShrink: 0, marginTop: 1 }}>{(src || "").slice(0, 2).toUpperCase()}</span>
                    <p style={{ margin: 0, fontSize: 11, color: "#1A5C42", lineHeight: 1.5 }}><strong style={{ color: C.green }}>{src}:</strong> {stat}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              {/* Formulation */}
              <div style={{ background: C.orangeL, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: C.orange, marginBottom: 8 }}>FORMULATION</div>
                <div style={{ background: C.white, borderRadius: 7, padding: "7px 10px", marginBottom: 8 }}>
                  <div style={{ fontSize: 9, color: C.orange, fontWeight: 800, marginBottom: 2 }}>HERO CLAIM</div>
                  <div style={{ fontSize: 12, color: C.text, fontWeight: 700 }}>{c.claim}</div>
                </div>
                {[[c.ing1_name, c.ing1_why, c.ing1_type], [c.ing2_name, c.ing2_why, c.ing2_type], [c.ing3_name, c.ing3_why, c.ing3_type]].filter(([n]) => n).map(([nm, why, type], i) => (
                  <div key={i} style={{ background: C.white, borderRadius: 7, padding: "6px 10px", marginBottom: 5 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: C.orange }}>{nm} <span style={{ color: C.muted, fontWeight: 400, fontSize: 10 }}>· {type}</span></div>
                    <div style={{ fontSize: 11, color: C.text, marginTop: 2, lineHeight: 1.4 }}>{why}</div>
                  </div>
                ))}
                <div style={{ marginTop: 8, fontSize: 11, color: C.sub, fontStyle: "italic", lineHeight: 1.5 }}>
                  <strong style={{ color: C.orange, fontStyle: "normal" }}>Feel:</strong> {c.texture}
                </div>
                <div style={{ marginTop: 5, fontSize: 11, color: C.sub, lineHeight: 1.5 }}>
                  <strong style={{ color: C.orange, fontStyle: "normal" }}>Why {c.format}:</strong> {c.format_why}
                </div>
              </div>

              {/* Pricing */}
              <div style={{ background: C.blueL, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: C.blue, marginBottom: 8 }}>PRICING</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.blue, letterSpacing: "-1px", lineHeight: 1 }}>{c.price}</div>
                <div style={{ fontSize: 11, color: C.sub, marginTop: 3 }}>{c.pack} · {c.per_day}</div>
                <div style={{ fontSize: 11, color: C.blue, marginTop: 8, lineHeight: 1.5 }}>{c.price_why}</div>
              </div>

              {/* Competition */}
              <div style={{ background: "#F8F0FF", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: C.purple, marginBottom: 8 }}>COMPETITIVE POSITION</div>
                {[[c.comp1, c.comp1_gap], [c.comp2, c.comp2_gap]].filter(([b]) => b).map(([brand, gap], i) => (
                  <div key={i} style={{ background: C.white, borderRadius: 6, padding: "5px 8px", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{brand}</span>
                    <div style={{ fontSize: 10, color: C.sub, marginTop: 2, lineHeight: 1.4 }}>{gap}</div>
                  </div>
                ))}
                <div style={{ marginTop: 8, background: C.white, borderRadius: 7, padding: "7px 10px" }}>
                  <div style={{ fontSize: 9, color: C.purple, fontWeight: 800, marginBottom: 3 }}>WHITE SPACE</div>
                  <div style={{ fontSize: 11, color: C.text, lineHeight: 1.4 }}>{c.white_space}</div>
                </div>
              </div>

              {/* GTM */}
              <div style={{ background: C.greenL, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: C.green, marginBottom: 8 }}>GO-TO-MARKET</div>
                <div style={{ fontSize: 11, color: C.text, marginBottom: 5 }}><strong style={{ color: C.green }}>Channel:</strong> {c.gtm_channel}</div>
                <div style={{ fontSize: 11, color: C.text, marginBottom: 5 }}><strong style={{ color: C.green }}>Hook:</strong> {c.gtm_hook}</div>
                <div style={{ fontSize: 11, color: C.text }}><strong style={{ color: C.green }}>Influencer:</strong> {c.gtm_influencer}</div>
              </div>
            </div>
          </div>

          {/* Scores */}
          <div style={{ background: C.bg, borderRadius: 10, padding: "14px 10px", marginTop: 12, display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 8 }}>
            {[
              { label: "MARKET SIZE", val: c.market_size },
              { label: "NOVELTY",     val: c.novelty },
              { label: "BLUE OCEAN",  val: blueOcean },
              { label: "URGENCY",     val: c.urgency },
              { label: "BRAND FIT",   val: c.brand_fit },
              { label: "OVERALL",     val: c.overall },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <Ring value={s.val} />
                <div style={{ fontSize: 8.5, color: C.sub, fontWeight: 700, letterSpacing: "0.4px", marginTop: 4, lineHeight: 1.3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Brand Capability + Risk */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            <div style={{ background: C.goldL, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: C.gold, marginBottom: 10 }}>BRAND CAPABILITY FIT</div>
              {[
                { label: "D2C Channel Fit",              val: c.d2c_fit,        invert: false },
                { label: "Mfg Complexity (lower=better)", val: c.mfg_complexity, invert: true },
                { label: "Regulatory Ease",              val: c.reg_ease,       invert: false },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.sub, marginBottom: 2 }}>
                    <span>{item.label}</span>
                    <span style={{ fontWeight: 800, color: C.gold }}>{item.invert ? Math.max(1, 11 - (item.val || 1)) : (item.val || 1)}/10</span>
                  </div>
                  <Bar value={item.val} invert={item.invert} />
                </div>
              ))}
            </div>
            <div style={{ background: "#FFF0F0", border: `1px solid #FFD6D6`, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: C.accent, marginBottom: 8 }}>KEY RISK &amp; MITIGATION</div>
              <p style={{ margin: 0, fontSize: 12, color: C.text, lineHeight: 1.6 }}>{c.risk}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── LOADER ─────────────────────────────────────────────────────────────────── */
function Loader({ icon }) {
  const steps = [
    "Scanning Amazon & Flipkart reviews...",
    "Mining Nykaa ratings & Q&As...",
    "Deep-diving Reddit communities...",
    "Checking Google Trends India...",
    "Analysing Twitter & Quora signals...",
    "Identifying market gaps...",
    "Crafting your concept...",
  ];
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const si = setInterval(() => setStep(s => (s + 1) % steps.length), 3800);
    const ti = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => { clearInterval(si); clearInterval(ti); };
  }, []);
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ width: 68, height: 68, borderRadius: "50%", background: IG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px", boxShadow: "0 6px 24px rgba(225,48,108,0.28)", animation: "igpulse 1.6s ease infinite" }}>{icon || "💡"}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 8 }}>Deep Research in Progress</div>
      <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, minHeight: 18, marginBottom: 10 }}>{steps[step]}</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 12 }}>
        {steps.map((_, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i === step ? C.accent : C.border, transition: "background 0.3s" }} />)}
      </div>
      <div style={{ fontSize: 11, color: C.muted }}>{elapsed}s elapsed · typically 20–40s</div>
    </div>
  );
}

/* ─── HISTORY PANEL ──────────────────────────────────────────────────────────── */
function HistoryPanel({ history, onClose, onRestore, onDelete }) {
  const [cat, setCat] = useState(null);
  const cats = [...new Set(history.map(h => h.category))];
  const list = cat ? history.filter(h => h.category === cat) : history;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
      <div onClick={onClose} style={{ flex: 1, background: "rgba(0,0,0,0.5)" }} />
      <div style={{ width: 360, background: C.white, overflowY: "auto", boxShadow: "-4px 0 24px rgba(0,0,0,0.14)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 18px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: C.white, zIndex: 1 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>History</div>
            <div style={{ fontSize: 11, color: C.sub }}>{history.length} concept{history.length !== 1 ? "s" : ""} generated</div>
          </div>
          <button onClick={onClose} style={{ background: C.bg, border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 14, color: C.sub, fontWeight: 700 }}>✕</button>
        </div>
        {cats.length > 1 && (
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button onClick={() => setCat(null)} style={{ background: cat === null ? C.accent : C.bg, color: cat === null ? "#fff" : C.sub, border: "none", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>All</button>
            {cats.map(k => <button key={k} onClick={() => setCat(k)} style={{ background: cat === k ? C.accent : C.bg, color: cat === k ? "#fff" : C.sub, border: "none", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{k}</button>)}
          </div>
        )}
        <div style={{ flex: 1, padding: "12px 14px" }}>
          {list.length === 0 && <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted, fontSize: 13 }}>No history yet</div>}
          {list.map((h, i) => (
            <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 14px", marginBottom: 10, position: "relative", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(225,48,108,0.14)"; e.currentTarget.style.borderColor = C.accent; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = C.border; }}>
              <div onClick={() => { onRestore(h); onClose(); }} style={{ cursor: "pointer", paddingRight: 28 }}>
                <div style={{ fontSize: 10, color: C.accent, fontWeight: 700, marginBottom: 2 }}>{h.category}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{h.name}</div>
                <div style={{ fontSize: 11, color: C.sub, fontStyle: "italic", marginTop: 1 }}>{h.tagline}</div>
                <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
                  <Chip bg={C.bg} color={C.sub} style={{ fontSize: 10 }}>{h.format}</Chip>
                  <Chip bg={C.bg} color={C.sub} style={{ fontSize: 10 }}>{h.price}</Chip>
                  <Chip bg={REC_STYLE[h.rec]?.bg || C.bg} color={REC_STYLE[h.rec]?.color || C.sub} style={{ fontSize: 10 }}>{h.rec}</Chip>
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); onDelete(h.ts); }} title="Delete"
                style={{ position: "absolute", top: 10, right: 10, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: C.muted, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#FFF0F0"; e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── NAV ────────────────────────────────────────────────────────────────────── */
function Nav({ onHistory, count, navPage, setNavPage }) {
  return (
    <div style={{ borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 100, background: C.white }}>
      <div onClick={() => setNavPage(null)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginRight: "auto" }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: IG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>💡</div>
        <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: "-0.3px", background: IG, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ProductLab</span>
      </div>
      {["businesses", "pricing"].map(p => (
        <button key={p} onClick={() => setNavPage(p)} style={{ background: "none", border: "none", fontSize: 13, fontWeight: 600, color: navPage === p ? C.accent : C.sub, cursor: "pointer", padding: "4px 8px" }}>
          {p === "businesses" ? "Our Businesses" : "Pricing"}
        </button>
      ))}
      <button onClick={onHistory}
        style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: "5px 13px", fontSize: 12, fontWeight: 700, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
        onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
        onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
        🕐 History
        {count > 0 && <span style={{ background: IG, color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 }}>{count > 9 ? "9+" : count}</span>}
      </button>
    </div>
  );
}

/* ─── STATIC PAGES ───────────────────────────────────────────────────────────── */
function StaticPage({ navPage, setNavPage, onHistory, count }) {
  if (navPage === "businesses") return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui,sans-serif" }}>
      <Nav onHistory={onHistory} count={count} navPage={navPage} setNavPage={setNavPage} />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "56px 24px" }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: C.text, marginBottom: 8 }}>Our Businesses</h2>
        <p style={{ color: C.sub, fontSize: 14, lineHeight: 1.7, maxWidth: 480, marginBottom: 28 }}>ProductLab is part of a suite of AI-powered D2C intelligence tools helping Indian brands move faster from insight to launch.</p>
        {[
          { name: "ProductLab",  desc: "AI product inventor for Indian D2C — mine reviews, Reddit & trends to invent data-backed concepts.", icon: "💡" },
          { name: "TrendRadar",  desc: "Real-time trend intelligence tracking Google, Reddit & social signals across 50+ categories.",         icon: "📡" },
          { name: "ReviewMiner", desc: "Bulk NLP analysis of Amazon & Nykaa reviews to surface recurring pain points at scale.",               icon: "🔍" },
        ].map(b => (
          <div key={b.name} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 22px", marginBottom: 12, display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: IG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{b.icon}</div>
            <div><div style={{ fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 3 }}>{b.name}</div><div style={{ fontSize: 13, color: C.sub, lineHeight: 1.5 }}>{b.desc}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui,sans-serif" }}>
      <Nav onHistory={onHistory} count={count} navPage={navPage} setNavPage={setNavPage} />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "56px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: C.text, marginBottom: 6 }}>Simple Pricing</h2>
        <p style={{ color: C.sub, fontSize: 14, marginBottom: 32 }}>No hidden fees. Cancel anytime.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {[
            { plan: "Free",  price: "Rs.0",     per: "forever",     features: ["10 concepts/month", "All 8 categories", "Full PM brief", "History"],                      cta: "Get started",    hi: false },
            { plan: "Pro",   price: "Rs.999",   per: "per month",   features: ["Unlimited concepts", "Deep research mode", "History up to 500", "Custom categories"],     cta: "Start free trial", hi: true },
            { plan: "Team",  price: "Rs.4,999", per: "per month",   features: ["Everything in Pro", "5 team seats", "Slack integration", "Priority support"],             cta: "Contact us",     hi: false },
          ].map(p => (
            <div key={p.plan} style={{ background: C.white, border: p.hi ? `2px solid ${C.accent}` : `1px solid ${C.border}`, borderRadius: 16, padding: "22px 18px", position: "relative" }}>
              {p.hi && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: IG, color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 14px", borderRadius: 20, whiteSpace: "nowrap" }}>POPULAR</div>}
              <div style={{ fontSize: 13, fontWeight: 800, color: C.sub, marginBottom: 5 }}>{p.plan}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: C.text }}>{p.price}</div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>{p.per}</div>
              {p.features.map(f => <div key={f} style={{ fontSize: 12, color: C.text, marginBottom: 6, textAlign: "left" }}>✓ {f}</div>)}
              <button style={{ width: "100%", marginTop: 14, padding: 10, borderRadius: 10, border: "none", background: p.hi ? IG : C.bg, color: p.hi ? "#fff" : C.text, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{p.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN APP ───────────────────────────────────────────────────────────────── */
export default function App() {
  const [selCat,   setSelCat]   = useState(null);
  const [custom,   setCustom]   = useState("");
  const [brand,    setBrand]    = useState("");
  const [phase,    setPhase]    = useState("home");
  const [concepts, setConcepts] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [history,  setHistory]  = useState([]);
  const [showHist, setShowHist] = useState(false);
  const [navPage,  setNavPage]  = useState(null);

  const catRef    = useRef("");
  const iconRef   = useRef("💡");
  const namesRef  = useRef([]);
  const bottomRef = useRef(null);

  const canGen = selCat !== null || custom.trim().length > 0;

  const fetchConcept = async (categoryLabel) => {
    setLoading(true);
    setError(null);

    const avoidNote = namesRef.current.length > 0
      ? ` Do NOT repeat any of these already-generated products: ${namesRef.current.join(", ")}.` : "";
    const brandNote = brand.trim()
      ? ` Brand context for tailoring the concept: "${brand.trim()}".` : "";

    const userMsg = `Generate ONE unique product concept for the Indian D2C "${categoryLabel}" category.${brandNote}${avoidNote} Return ONLY the JSON.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);

    try {
      const res = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAexKx7B_2mspdZu3HR-jX4PSwX7ZvTYZI",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: SYSTEM + "\n\n" + userMsg }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1800
      }
    }),
  }
);
      clearTimeout(timeout);

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();

if (!res.ok) {
  throw new Error(data?.error?.message || "Gemini API error");
};
console.log(await res.text());

      // Strip any accidental markdown fences
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
          try { parsed = JSON.parse(match[0]); }
          catch { throw new Error("Response was not valid JSON — please try again"); }
        } else {
          throw new Error("Could not find JSON in response — please try again");
        }
      }

      if (!parsed?.name) throw new Error("Response missing required fields — please try again");

      namesRef.current = [...namesRef.current, parsed.name];

      const entry = { ...parsed, category: categoryLabel, ts: Date.now() };
      setConcepts(prev => [entry, ...prev]);
      setHistory(prev => [entry, ...prev].slice(0, 50));
      setPhase("results");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 150);

    } catch (err) {
      clearTimeout(timeout);
      const msg = err.name === "AbortError"
        ? "Request timed out after 55s. Please try again."
        : (err.message || "Something went wrong — please try again.");
      setError(msg);
      if (phase === "loading") setPhase(concepts.length > 0 ? "results" : "home");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    const cat = custom.trim() || selCat?.label || "";
    if (!cat) return;
    catRef.current   = cat;
    iconRef.current  = selCat?.icon || "💡";
    namesRef.current = [];
    setConcepts([]);
    setError(null);
    setPhase("loading");
    fetchConcept(cat);
  };

  const handleMore = () => {
    fetchConcept(catRef.current);
  };

  const handleRestart = () => {
    setPhase("home");
    setSelCat(null);
    setCustom("");
    setBrand("");
    setConcepts([]);
    setError(null);
    namesRef.current = [];
  };

  const handleRestore = (entry) => {
    const found = CATS.find(c => c.label === entry.category) || null;
    setSelCat(found);
    setCustom(found ? "" : entry.category);
    catRef.current   = entry.category;
    iconRef.current  = found?.icon || "💡";
    namesRef.current = [entry.name].filter(Boolean);
    setConcepts([entry]);
    setPhase("results");
  };

  if (navPage) return (
    <StaticPage navPage={navPage} setNavPage={setNavPage} onHistory={() => setShowHist(true)} count={history.length} />
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui,-apple-system,sans-serif", color: C.text }}>
      <style>{`
        @keyframes igpulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        input, button { font-family: inherit; }
        .cat-btn { transition: all 0.18s; }
        .cat-btn:hover { border-color: #E1306C !important; box-shadow: 0 4px 14px rgba(225,48,108,0.14); transform: translateY(-2px); }
        .rst-btn:hover { background: #FDE8F0 !important; color: #E1306C !important; border-color: #E1306C !important; }
        .more-btn:hover { opacity: 0.88; transform: translateY(-1px); }
      `}</style>

      <Nav onHistory={() => setShowHist(true)} count={history.length} navPage={navPage} setNavPage={setNavPage} />

      {showHist && (
        <HistoryPanel
          history={history}
          onClose={() => setShowHist(false)}
          onRestore={handleRestore}
          onDelete={ts => setHistory(prev => prev.filter(h => h.ts !== ts))}
        />
      )}

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* ── HOME PAGE ── */}
        {phase === "home" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>

            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ width: 68, height: 68, borderRadius: "50%", background: IG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px", boxShadow: "0 6px 24px rgba(225,48,108,0.28)" }}>💡</div>
              <h1 style={{ fontSize: "clamp(24px,5vw,40px)", fontWeight: 900, margin: "0 0 10px", letterSpacing: "-1px", lineHeight: 1.1 }}>
                Stop guessing.<br />
                <span style={{ background: IG, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Start inventing.</span>
              </h1>
              <p style={{ fontSize: 14, color: C.sub, maxWidth: 460, margin: "0 auto 14px", lineHeight: 1.6 }}>
                Deep-mines Amazon, Flipkart, Nykaa, Reddit &amp; Google Trends to generate <strong>PM-ready product concepts</strong> — each backed by cited consumer data.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                {["7 sources mined", "Evidence cited", "Brand fit scored"].map(f => (
                  <span key={f} style={{ background: C.greenL, color: C.green, borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700 }}>{f}</span>
                ))}
              </div>
            </div>

            {/* Category grid */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: C.sub, marginBottom: 10 }}>SELECT CATEGORY</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {CATS.map(cat => (
                  <button key={cat.id} className="cat-btn"
                    onClick={() => { setSelCat(cat); setCustom(""); }}
                    style={{ background: selCat?.id === cat.id ? C.accentL : C.white, border: `1.5px solid ${selCat?.id === cat.id ? C.accent : C.border}`, borderRadius: 12, padding: "12px 6px", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{cat.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: selCat?.id === cat.id ? C.accent : C.sub }}>{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: C.sub, marginBottom: 7 }}>CUSTOM CATEGORY</div>
                <input value={custom} onChange={e => { setCustom(e.target.value); setSelCat(null); }}
                  placeholder="e.g. Beard Care, Nutrition, Feminine Hygiene..."
                  style={{ width: "100%", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none" }}
                  onFocus={e => e.target.style.borderColor = C.accent}
                  onBlur={e => e.target.style.borderColor = C.border} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: C.muted, marginBottom: 7 }}>BRAND CONTEXT <span style={{ fontWeight: 400 }}>(optional)</span></div>
                <input value={brand} onChange={e => setBrand(e.target.value)}
                  placeholder="e.g. Premium D2C brand, female millennials..."
                  style={{ width: "100%", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 13px", color: C.text, fontSize: 13, outline: "none" }}
                  onFocus={e => e.target.style.borderColor = C.blue}
                  onBlur={e => e.target.style.borderColor = C.border} />
              </div>
            </div>

            <button onClick={handleGenerate} disabled={!canGen}
              style={{ width: "100%", padding: 15, borderRadius: 12, border: "none", background: canGen ? IG : C.border, color: "#fff", fontSize: 15, fontWeight: 800, cursor: canGen ? "pointer" : "not-allowed", boxShadow: canGen ? "0 4px 20px rgba(225,48,108,0.28)" : "none", letterSpacing: 0.3 }}>
              Generate Product Concept
            </button>
          </div>
        )}

        {/* ── LOADING ── */}
        {phase === "loading" && <Loader icon={iconRef.current} />}

        {/* ── RESULTS ── */}
        {phase === "results" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>

            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: C.sub }}>Category</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: C.text, letterSpacing: "-0.5px" }}>{catRef.current}</div>
                <div style={{ fontSize: 11, color: C.sub, marginTop: 3 }}>{concepts.length} concept{concepts.length !== 1 ? "s" : ""} generated</div>
              </div>
              <button className="rst-btn" onClick={handleRestart}
                style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: C.sub, transition: "all 0.18s" }}>
                ↺ New Search
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div style={{ background: "#FFF0F0", border: `1px solid #FFD6D6`, borderRadius: 12, padding: "14px 16px", color: C.accent, fontSize: 13, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span><strong>Error:</strong> {error}</span>
                <button onClick={() => { setError(null); fetchConcept(catRef.current); }}
                  style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                  Retry
                </button>
              </div>
            )}

            {/* Concept cards */}
            {concepts.map((c, i) => (
              <ConceptCard key={c.ts + i} c={c} index={concepts.length - 1 - i} defaultOpen={i === 0} />
            ))}

            {/* Inline loader for More */}
            {loading && <Loader icon={iconRef.current} />}

            {/* More button */}
            {!loading && (
              <div ref={bottomRef} style={{ textAlign: "center", marginTop: 16 }}>
                <button className="more-btn" onClick={handleMore}
                  style={{ background: IG, border: "none", borderRadius: 30, padding: "13px 38px", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 18px rgba(225,48,108,0.3)", transition: "all 0.2s", letterSpacing: 0.3 }}>
                  ✦ More — Generate Another Concept
                </button>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>Previous concepts stay visible above ↑</div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
