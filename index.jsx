import { useState } from "react";

const CATEGORIES = [
  { id: "vuelos",     icon: "✈️",  label: "Vuelos",               sub: "Pasajes aéreos ida y vuelta" },
  { id: "hospedaje",  icon: "🏨",  label: "Hospedaje",            sub: "Hotel, Airbnb, noches" },
  { id: "valijas",    icon: "🧳",  label: "Equipaje",             sub: "Valijas, exceso de peso" },
  { id: "auto",       icon: "🚗",  label: "Alquiler de Auto",     sub: "Renta, combustible, peajes" },
  { id: "transporte", icon: "🚇",  label: "Transporte Local",     sub: "Subway, taxi, Uber, traslados" },
  { id: "comida",     icon: "🍽️", label: "Comida & Bebida",      sub: "Restaurantes, cafés, snacks" },
  { id: "upgrade",    icon: "⭐",  label: "Upgrades & Extras",    sub: "Asiento premium, sala VIP" },
  { id: "entret",     icon: "🎭",  label: "Entretenimiento",      sub: "Museos, shows, actividades" },
  { id: "compras",    icon: "🛍️", label: "Compras & Shopping",   sub: "Ropa, souvenirs, regalos" },
  { id: "seguro",     icon: "🛡️", label: "Seguro de Viaje",      sub: "Seguro médico, visa fees" },
];

const CURRENCIES = ["USD", "ARS", "CAD"];
const SYM = { USD: "USD $", ARS: "ARS $", CAD: "CAD $" };

let _id = 1;
const uid = () => `r${_id++}`;

function fmt(n) {
  return Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function App() {
  const [currency, setCurrency] = useState("USD");
  const [openCats, setOpenCats] = useState({ vuelos: true, hospedaje: true });
  const [rows, setRows] = useState(() => {
    const init = {};
    CATEGORIES.forEach(c => { init[c.id] = []; });
    return init;
  });
  const [notes, setNotes] = useState("");

  const toggleCat = (id) => setOpenCats(p => ({ ...p, [id]: !p[id] }));

  const addRow = (catId) => {
    setRows(p => ({ ...p, [catId]: [...p[catId], { id: uid(), desc: "", amount: "", payer: "jonathan" }] }));
    setOpenCats(p => ({ ...p, [catId]: true }));
  };

  const updateRow = (catId, rowId, field, value) => {
    setRows(p => ({
      ...p,
      [catId]: p[catId].map(r => r.id === rowId ? { ...r, [field]: value } : r)
    }));
  };

  const deleteRow = (catId, rowId) => {
    setRows(p => ({ ...p, [catId]: p[catId].filter(r => r.id !== rowId) }));
  };

  // ── CÁLCULOS ──
  // Todo gasto se divide en 2. "payer" indica quién desembolsó.
  // Al final: cada uno debería haber pagado exactamente la mitad del total.
  // Si J pagó de más → G le debe a J. Si G pagó de más → J le debe a G.
  const sym = SYM[currency];
  let paidJ = 0, paidG = 0, totalItems = 0;
  const catTotals = {}, catPaidJ = {}, catPaidG = {};
  CATEGORIES.forEach(c => { catTotals[c.id] = 0; catPaidJ[c.id] = 0; catPaidG[c.id] = 0; });

  CATEGORIES.forEach(c => {
    rows[c.id].forEach(r => {
      const amt = parseFloat(r.amount) || 0;
      if (!amt) return;
      totalItems++;
      catTotals[c.id] += amt;
      if (r.payer === "jonathan") { paidJ += amt; catPaidJ[c.id] += amt; }
      else if (r.payer === "giselle") { paidG += amt; catPaidG[c.id] += amt; }
      else { paidJ += amt / 2; paidG += amt / 2; catPaidJ[c.id] += amt / 2; catPaidG[c.id] += amt / 2; }
    });
  });

  const grand = paidJ + paidG;
  const halfTotal = grand / 2;
  // Cuánto "debería" haber pagado cada uno
  const shouldPayJ = halfTotal;
  const shouldPayG = halfTotal;
  // Diferencia: positivo = pagó de más (el otro le debe)
  const balanceJ = paidJ - shouldPayJ; // + → G le debe a J
  const balanceG = paidG - shouldPayG; // + → J le debe a G

  // ── PALETA ──
  const C = { bg: "#0a0a0f", surface: "#13131a", surface2: "#1c1c28", border: "#2a2a3a", accent: "#c9a96e", purple: "#a78bda", text: "#e8e8f0", muted: "#888899", green: "#6ec9a9", red: "#e07575" };

  const s = {
    app: { fontFamily: "'Segoe UI', system-ui, sans-serif", background: C.bg, minHeight: "100vh", color: C.text, paddingBottom: 60 },
    wrap: { maxWidth: 920, margin: "0 auto", padding: "0 20px" },
    header: { textAlign: "center", padding: "36px 0 24px", borderBottom: `1px solid ${C.border}`, marginBottom: 28 },
    eyebrow: { fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: C.accent, marginBottom: 8, fontWeight: 600 },
    h1: { fontSize: "clamp(1.8rem,5vw,2.8rem)", fontWeight: 900, background: `linear-gradient(135deg,${C.accent},#fff,${C.purple})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 14, lineHeight: 1.1 },
    chips: { display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" },
    chip: { fontSize: 11, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "4px 12px", color: C.muted },
    currBar: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 20 },
    curBtn: (a) => ({ padding: "4px 13px", borderRadius: 20, border: `1px solid ${a ? C.accent : C.border}`, background: a ? C.accent : C.surface, color: a ? "#0a0a0f" : C.muted, fontWeight: a ? 700 : 400, cursor: "pointer", fontSize: 12 }),
    travelers: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 },
    tCard: (col) => ({ background: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${col}`, borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }),
    tAva: (bg, col) => ({ width: 42, height: 42, borderRadius: "50%", background: bg, color: col, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17, flexShrink: 0 }),
    tName: { fontSize: 13, fontWeight: 600, marginBottom: 2 },
    tAmt: (col) => ({ fontSize: 21, fontWeight: 800, color: col, lineHeight: 1 }),
    tSub: { fontSize: 11, color: C.muted, marginTop: 3 },
    catWrap: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 },
    cat: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" },
    catHead: { display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", cursor: "pointer" },
    catIco: { width: 36, height: 36, borderRadius: 9, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 },
    catInfo: { flex: 1 },
    catTitle: { fontSize: 14, fontWeight: 600 },
    catSub: { fontSize: 11, color: C.muted, marginTop: 1 },
    catTotal: { fontSize: 15, fontWeight: 700, color: C.accent, marginRight: 8, whiteSpace: "nowrap" },
    chevron: (open) => ({ color: C.muted, fontSize: 10, transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(180deg)" : "none" }),
    catBody: { padding: "14px 18px", borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 10 },
    rowGrid: { display: "grid", gridTemplateColumns: "1fr 110px auto 34px", gap: 8, alignItems: "end" },
    fg: { display: "flex", flexDirection: "column", gap: 3 },
    lbl: { fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" },
    inp: { background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", color: C.text, fontSize: 13, fontFamily: "inherit", width: "100%", outline: "none" },
    payerWrap: { display: "flex", gap: 4 },
    pBtn: (a, col, bg) => ({ padding: "6px 10px", borderRadius: 7, border: `1px solid ${a ? col : C.border}`, background: a ? bg : C.surface2, color: a ? col : C.muted, fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", lineHeight: 1 }),
    delBtn: { width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "flex-end" },
    addBtn: { display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px dashed ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 12, padding: "7px 14px", cursor: "pointer", width: "100%", marginTop: 2 },
    divider: { height: 1, background: C.border },
    notesSec: { marginBottom: 24 },
    notesLbl: { fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7 },
    textarea: { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 13, color: C.text, fontSize: 13, fontFamily: "inherit", resize: "vertical", minHeight: 68, outline: "none" },
    sumSec: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 26, marginBottom: 28 },
    sumH2: { fontSize: 18, fontWeight: 800, marginBottom: 18 },
    sumGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 },
    sumCard: { background: C.surface2, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` },
    sumName: (col) => ({ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, color: col, marginBottom: 6 }),
    sumAmt: (col) => ({ fontSize: 26, fontWeight: 900, color: col, marginBottom: 8 }),
    bRow: { display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 },
    bCat: { color: C.muted, display: "flex", gap: 5, alignItems: "center" },
    bAmt: { fontWeight: 700, fontSize: 13 },
    // ── conciliación ──
    concilSec: { background: `linear-gradient(135deg,rgba(201,169,110,0.08),rgba(124,111,205,0.08))`, border: `1px solid rgba(201,169,110,0.2)`, borderRadius: 14, padding: "20px 22px", marginBottom: 18 },
    concilTitle: { fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, color: C.muted, marginBottom: 14 },
    concilRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid rgba(255,255,255,0.05)`, fontSize: 13 },
    concilLabel: { color: C.muted },
    concilVal: (col) => ({ fontWeight: 700, color: col }),
    verdict: (col) => ({ marginTop: 14, padding: "13px 16px", borderRadius: 10, background: col === "green" ? "rgba(110,201,169,0.1)" : col === "red" ? "rgba(224,117,117,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${col === "green" ? C.green : col === "red" ? C.red : C.border}`, fontSize: 14, fontWeight: 600, color: col === "green" ? C.green : col === "red" ? C.red : C.text, textAlign: "center" }),
    totalStrip: { background: `linear-gradient(135deg,rgba(201,169,110,0.1),rgba(124,111,205,0.1))`, border: `1px solid rgba(201,169,110,0.2)`, borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    totalLabel: { fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 2, fontWeight: 600, marginBottom: 3 },
    totalAmt: { fontSize: 30, fontWeight: 900, background: `linear-gradient(135deg,${C.accent},#fff)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
    actBar: { display: "flex", gap: 10, flexWrap: "wrap" },
    btnPri: { flex: 1, padding: "12px 18px", background: `linear-gradient(135deg,${C.accent},#b08d4e)`, border: "none", borderRadius: 10, color: "#0a0a0f", fontWeight: 700, fontSize: 14, cursor: "pointer", minWidth: 130 },
    btnSec: { flex: 1, padding: "12px 18px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontWeight: 600, fontSize: 14, cursor: "pointer", minWidth: 120 },
  };

  const Breakdown = ({ dataJ, dataG }) => (
    <div style={s.sumGrid}>
      {[{ name: "Jonathan Moscoso", col: C.accent, paid: paidJ, data: dataJ }, { name: "Giselle", col: C.purple, paid: paidG, data: dataG }].map(p => (
        <div key={p.name} style={s.sumCard}>
          <div style={s.sumName(p.col)}>{p.name}</div>
          <div style={s.sumAmt(p.col)}>{sym} {fmt(p.paid)}</div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>desembolsado</div>
          {CATEGORIES.filter(c => p.data[c.id] > 0).map(c => (
            <div key={c.id} style={s.bRow}>
              <span style={s.bCat}>{c.icon} {c.label}</span>
              <span style={s.bAmt}>{sym} {fmt(p.data[c.id])}</span>
            </div>
          ))}
          {CATEGORIES.filter(c => p.data[c.id] > 0).length === 0 && <div style={{ fontSize: 12, color: C.muted }}>Sin pagos aún</div>}
        </div>
      ))}
    </div>
  );

  // Veredicto conciliación
  const absBalance = Math.abs(balanceJ);
  let verdictColor = "neutral", verdictText = "Cargá gastos para calcular el saldo";
  if (grand > 0) {
    if (absBalance < 0.5) {
      verdictColor = "green";
      verdictText = "✅ Están al día. Nadie le debe nada a nadie.";
    } else if (balanceJ > 0) {
      verdictColor = "red";
      verdictText = `💸 Giselle le debe a Jonathan ${sym} ${fmt(absBalance)}`;
    } else {
      verdictColor = "red";
      verdictText = `💸 Jonathan le debe a Giselle ${sym} ${fmt(absBalance)}`;
    }
  }

  return (
    <div style={s.app}>
      <div style={s.wrap}>

        {/* HEADER */}
        <div style={s.header}>
          <div style={s.eyebrow}>✈ Planificación de Viaje</div>
          <div style={s.h1}>Toronto & New York</div>
          <div style={s.chips}>
            {["📅 1 semana", "👤 2 viajeros", "🍁 Toronto", "🗽 Nueva York"].map(t => <span key={t} style={s.chip}>{t}</span>)}
          </div>
        </div>

        {/* CURRENCY */}
        <div style={s.currBar}>
          <span style={{ fontSize: 11, color: C.muted }}>Moneda:</span>
          {CURRENCIES.map(c => <button key={c} style={s.curBtn(currency === c)} onClick={() => setCurrency(c)}>{c}</button>)}
        </div>

        {/* CARDS VIAJEROS */}
        <div style={s.travelers}>
          {[{ name: "Jonathan Moscoso", col: C.accent, bg: "rgba(201,169,110,0.12)", ava: "J", paid: paidJ, balance: balanceJ },
            { name: "Giselle",          col: C.purple, bg: "rgba(167,139,218,0.12)", ava: "G", paid: paidG, balance: balanceG }
          ].map(p => (
            <div key={p.name} style={s.tCard(p.col)}>
              <div style={s.tAva(p.bg, p.col)}>{p.ava}</div>
              <div>
                <div style={s.tName}>{p.name}</div>
                <div style={s.tAmt(p.col)}>{sym} {fmt(p.paid)}</div>
                <div style={s.tSub}>
                  pagado · {grand > 0 ? (p.balance > 0.5 ? `cobrar ${sym} ${fmt(Math.abs(p.balance))}` : p.balance < -0.5 ? `deber ${sym} ${fmt(Math.abs(p.balance))}` : "al día ✓") : "sin gastos"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CATEGORÍAS */}
        <div style={s.catWrap}>
          {CATEGORIES.map(cat => (
            <div key={cat.id} style={s.cat}>
              <div style={s.catHead} onClick={() => toggleCat(cat.id)}>
                <div style={s.catIco}>{cat.icon}</div>
                <div style={s.catInfo}>
                  <div style={s.catTitle}>{cat.label}</div>
                  <div style={s.catSub}>{cat.sub}</div>
                </div>
                <div style={s.catTotal}>{catTotals[cat.id] > 0 ? `${sym} ${fmt(catTotals[cat.id])}` : ""}</div>
                <span style={s.chevron(openCats[cat.id])}>▼</span>
              </div>

              {openCats[cat.id] && (
                <div style={s.catBody}>
                  {rows[cat.id].map((row, i) => (
                    <div key={row.id}>
                      {i > 0 && <div style={{ ...s.divider, marginBottom: 10 }} />}
                      <div style={s.rowGrid}>
                        <div style={s.fg}>
                          <label style={s.lbl}>Descripción</label>
                          <input style={s.inp} placeholder="Ej: Vuelo BUE–YYZ" value={row.desc}
                            onChange={e => updateRow(cat.id, row.id, "desc", e.target.value)} />
                        </div>
                        <div style={s.fg}>
                          <label style={s.lbl}>Monto</label>
                          <input style={s.inp} type="number" placeholder="0.00" min="0" step="0.01" value={row.amount}
                            onChange={e => updateRow(cat.id, row.id, "amount", e.target.value)} />
                        </div>
                        <div style={s.fg}>
                          <label style={s.lbl}>Quién paga</label>
                          <div style={s.payerWrap}>
                            <button style={s.pBtn(row.payer==="jonathan", C.accent, "rgba(201,169,110,0.18)")}
                              onClick={() => updateRow(cat.id, row.id, "payer", "jonathan")}>Jonathan</button>
                            <button style={s.pBtn(row.payer==="giselle", C.purple, "rgba(167,139,218,0.18)")}
                              onClick={() => updateRow(cat.id, row.id, "payer", "giselle")}>Giselle</button>
                            <button style={s.pBtn(row.payer==="ambos", "#e8e8f0", "rgba(255,255,255,0.08)")}
                              onClick={() => updateRow(cat.id, row.id, "payer", "ambos")}>Ambos</button>
                          </div>
                        </div>
                        <button style={s.delBtn} onClick={() => deleteRow(cat.id, row.id)}>×</button>
                      </div>
                    </div>
                  ))}
                  <button style={s.addBtn} onClick={() => addRow(cat.id)}>＋ Agregar {cat.label.toLowerCase()}</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* NOTAS */}
        <div style={s.notesSec}>
          <div style={s.notesLbl}>📝 Notas del viaje</div>
          <textarea style={s.textarea} placeholder="Confirmaciones de reservas, links, datos importantes..."
            value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        {/* RESUMEN */}
        <div style={s.sumSec}>
          <div style={s.sumH2}>📊 Resumen</div>

          {/* Total */}
          <div style={{ ...s.totalStrip, marginBottom: 18 }}>
            <div>
              <div style={s.totalLabel}>Total del viaje</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{totalItems} gastos · dividido entre 2 = {sym} {fmt(grand / 2)} c/u</div>
            </div>
            <div style={s.totalAmt}>{sym} {fmt(grand)}</div>
          </div>

          {/* Por persona */}
          <Breakdown dataJ={catPaidJ} dataG={catPaidG} />

          {/* CONCILIACIÓN */}
          <div style={s.concilSec}>
            <div style={s.concilTitle}>⚖️ Conciliación de gastos</div>
            {[
              { label: "Total del viaje", val: `${sym} ${fmt(grand)}`, col: C.text },
              { label: "Corresponde pagar a cada uno (50%)", val: `${sym} ${fmt(halfTotal)}`, col: C.muted },
              { label: "Jonathan pagó", val: `${sym} ${fmt(paidJ)}`, col: C.accent },
              { label: "Giselle pagó", val: `${sym} ${fmt(paidG)}`, col: C.purple },
              { label: "Balance Jonathan", val: `${balanceJ >= 0 ? "+" : ""}${sym} ${fmt(balanceJ)}`, col: balanceJ > 0.5 ? C.green : balanceJ < -0.5 ? C.red : C.muted },
              { label: "Balance Giselle", val: `${balanceG >= 0 ? "+" : ""}${sym} ${fmt(balanceG)}`, col: balanceG > 0.5 ? C.green : balanceG < -0.5 ? C.red : C.muted },
            ].map(r => (
              <div key={r.label} style={s.concilRow}>
                <span style={s.concilLabel}>{r.label}</span>
                <span style={s.concilVal(r.col)}>{r.val}</span>
              </div>
            ))}
            <div style={s.verdict(verdictColor)}>{verdictText}</div>
          </div>
        </div>

        {/* ACCIONES */}
        <div style={s.actBar}>
          <button style={s.btnSec} onClick={() => { if (confirm("¿Borrar todos los gastos?")) { setRows(() => { const r = {}; CATEGORIES.forEach(c => r[c.id] = []); return r; }); setNotes(""); }}}>🗑️ Limpiar todo</button>
        </div>

      </div>
    </div>
  );
}
