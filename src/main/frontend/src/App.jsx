import { useState, useEffect, useCallback } from "react";

const C = {
  bg: "#080b12", bg2: "#0d1120", surface: "#111827", surfaceHigh: "#192035",
  border: "#1f2d47", gold: "#d4a853", goldDim: "#8a6a2e",
  goldGlow: "rgba(212,168,83,0.08)", goldGlow2: "rgba(212,168,83,0.15)",
  text: "#eae6df", textSub: "#8b95a8", textDim: "#3d4a60",
  green: "#34d399", red: "#f87171", blue: "#60a5fa",
};

const BASE = "http://localhost:8080";

async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("jwtToken");
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...opts,
  });
  return res;
}

async function api(path, opts = {}, _retry = true) {
  const res = await apiFetch(path, opts);

  // Token wygasł — spróbuj odświeżyć
  if ((res.status === 401 || res.status === 403) && _retry) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      const r = await fetch(`${BASE}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (r.ok) {
        const d = await r.json();
        localStorage.setItem("jwtToken", d.accessToken);
        // Ponów oryginalny request z nowym tokenem
        return api(path, opts, false);
      } else {
        // Refresh token wygasł — wyloguj
        localStorage.clear();
        window.location.reload();
        return;
      }
    } else {
      localStorage.clear();
      window.location.reload();
      return;
    }
  }

  if (!res.ok) { const msg = await res.text().catch(() => res.statusText); throw new Error(msg || `Błąd ${res.status}`); }
  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") ?? "";
  return ct.includes("application/json") ? res.json() : res.text();
}

const curSym = { PLN: "zł", EUR: "€", USD: "$" };
function money(n, currency) {
  const s = curSym[currency] ?? currency ?? "";
  return `${Math.abs(Number(n)).toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${s}`;
}

/* ── SMALL COMPONENTS ─────────────────────────────── */

function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: 56 }}>
      <div style={{ width: 36, height: 36, border: `2px solid ${C.border}`, borderTop: `2px solid ${C.gold}`, borderRadius: "50%", animation: "spin .9s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ color: C.textSub, fontSize: 13 }}>Ładowanie…</span>
    </div>
  );
}

function ErrBox({ msg, retry }) {
  if (!msg) return null;
  return (
    <div style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.22)", borderRadius: 10, padding: "11px 16px", color: C.red, fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
      <span>⚠ {msg}</span>
      {retry && <button onClick={retry} style={{ background: "none", border: `1px solid ${C.red}`, color: C.red, borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>Ponów</button>}
    </div>
  );
}

function OkBox({ msg }) {
  if (!msg) return null;
  return <div style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.22)", borderRadius: 10, padding: "11px 16px", color: C.green, fontSize: 13 }}>✓ {msg}</div>;
}

function Field({ label, ...props }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <label style={{ fontSize: 11, color: f ? C.gold : C.textSub, letterSpacing: "0.1em", textTransform: "uppercase", transition: "color .2s" }}>{label}</label>}
      <input style={{ background: C.bg, border: `1px solid ${f ? C.goldDim : C.border}`, borderRadius: 8, padding: "11px 14px", color: C.text, fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color .2s" }} onFocus={() => setF(true)} onBlur={() => setF(false)} {...props} />
    </div>
  );
}

function Sel({ label, children, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <label style={{ fontSize: 11, color: C.textSub, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</label>}
      <select style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px 14px", color: C.text, fontSize: 14, outline: "none", appearance: "none", fontFamily: "inherit" }} {...props}>{children}</select>
    </div>
  );
}

function Btn({ children, variant = "gold", sm, full, disabled, style: sx, onClick }) {
  const [h, setH] = useState(false);
  const base = { border: "none", borderRadius: 8, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: sm ? 12 : 14, padding: sm ? "6px 14px" : "12px 22px", width: full ? "100%" : undefined, transition: "all .18s", opacity: disabled ? 0.5 : 1 };
  const v = {
    gold:  { background: h ? "#e6b85c" : C.gold, color: "#080b12" },
    ghost: { background: h ? C.surfaceHigh : "transparent", color: C.textSub, border: `1px solid ${C.border}` },
    red:   { background: h ? "rgba(248,113,113,0.2)" : "rgba(248,113,113,0.1)", color: C.red, border: "1px solid rgba(248,113,113,0.25)" },
    teal:  { background: h ? "rgba(52,211,153,0.2)" : "rgba(52,211,153,0.1)", color: C.green, border: "1px solid rgba(52,211,153,0.25)" },
  };
  return <button style={{ ...base, ...v[variant], ...sx }} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} disabled={disabled} onClick={onClick}>{children}</button>;
}

function AccBadge({ type }) {
  const c = type === "CheckingAccount";
  return <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 4, background: c ? "rgba(96,165,250,0.1)" : "rgba(52,211,153,0.1)", color: c ? C.blue : C.green, border: `1px solid ${c ? "rgba(96,165,250,0.22)" : "rgba(52,211,153,0.22)"}` }}>{c ? "Rachunek" : "Oszczędnościowe"}</span>;
}

/* ── SIDEBAR ──────────────────────────────────────── */

const NAV = [
  { id: "dashboard", icon: "⬡", label: "Dashboard" },
  { id: "accounts", icon: "◫", label: "Konta" },
  { id: "transfer", icon: "⇌", label: "Przelew" },
  { id: "deposit", icon: "↕", label: "Wpłata / Wypłata" },
  { id: "transactions", icon: "≡", label: "Transakcje" },
  { id: "customers", icon: "◎", label: "Klienci" },
];

function Sidebar({ page, setPage, customer, onLogout }) {
  return (
    <aside style={{ width: 230, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", minHeight: "100vh", position: "sticky", top: 0 }}>
      <div style={{ padding: "22px 20px 16px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: `linear-gradient(135deg,${C.gold},${C.goldDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#080b12", fontFamily: "'Playfair Display',serif" }}>B</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: C.gold, letterSpacing: "0.04em" }}>BankApi</div>
            <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>Private Banking</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {NAV.map(p => {
          const a = page === p.id;
          return (
            <div key={p.id} onClick={() => setPage(p.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 2, background: a ? C.goldGlow : "transparent", color: a ? C.gold : C.textSub, fontWeight: a ? 600 : 400, fontSize: 14, borderLeft: `2px solid ${a ? C.gold : "transparent"}`, transition: "all .15s" }}>
              <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{p.icon}</span>{p.label}
            </div>
          );
        })}
      </nav>
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${C.goldGlow2},${C.border})`, border: `1px solid ${C.goldDim}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.gold, fontWeight: 700, fontSize: 13 }}>{customer?.username?.[0]?.toUpperCase()}</div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 13, color: C.text, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{customer?.username}</div>
            <div style={{ fontSize: 11, color: C.textSub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{customer?.email}</div>
          </div>
        </div>
        <Btn variant="ghost" sm full onClick={onLogout}>Wyloguj się</Btn>
      </div>
    </aside>
  );
}

function Shell({ title, subtitle, action, children }) {
  return (
    <main style={{ flex: 1, padding: "34px 38px", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 4 }}>{title}</h1>
          {subtitle && <p style={{ color: C.textSub, fontSize: 13 }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </main>
  );
}

/* ── AUTH PAGE ────────────────────────────────────── */

function AuthPage({ onLogin }) {
  const [tab, setTab]   = useState("login");
  const [lU, setLU]     = useState(""); const [lP, setLP] = useState("");
  const [lBusy, setLB]  = useState(false); const [lErr, setLE] = useState("");
  const [rU, setRU]     = useState(""); const [rE, setRE] = useState(""); const [rP, setRP] = useState(""); const [rP2, setRP2] = useState("");
  const [rBusy, setRB]  = useState(false); const [rErr, setRErr] = useState(""); const [rOk, setROk] = useState(false);

  async function doLogin() {
    if (!lU || !lP) { setLE("Wypełnij wszystkie pola"); return; }
    setLB(true); setLE("");
    try {
      const d = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ username: lU, password: lP }) });
      localStorage.setItem("jwtToken", d.accessToken);
      localStorage.setItem("refreshToken", d.refreshToken);
      localStorage.setItem("customer", JSON.stringify(d.customer));
      onLogin(d.customer);
    } catch (e) { setLE(e.message); }
    finally { setLB(false); }
  }

  async function doRegister() {
    if (!rU || !rE || !rP) { setRErr("Wypełnij wszystkie pola"); return; }
    if (rP !== rP2) { setRErr("Hasła się nie zgadzają"); return; }
    if (rP.length < 6) { setRErr("Hasło musi mieć min. 6 znaków"); return; }
    setRB(true); setRErr("");
    try {
      const token = await api("/api/auth/register", { method: "POST", body: JSON.stringify({ username: rU, password: rP, email: rE }) });
      // register zwraca tylko accessToken (bez refreshToken) — po chwili logujemy ponownie
      setROk(true);
      setTimeout(async () => {
        try {
          const d = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ username: rU, password: rP }) });
          localStorage.setItem("jwtToken", d.accessToken);
          localStorage.setItem("refreshToken", d.refreshToken);
          localStorage.setItem("customer", JSON.stringify(d.customer));
          onLogin(d.customer);
        } catch { onLogin({ username: rU, email: rE, id: null }); }
      }, 900);
    } catch (e) { setRErr(e.message); }
    finally { setRB(false); }
  }

  return (
    <>
      {/* Fullscreen centering wrapper */}
      <div style={{ position: "fixed", inset: 0, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflow: "auto" }}>
        {/* Glow */}
        <div style={{ position: "fixed", top: "30%", left: "50%", transform: "translateX(-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(212,168,83,0.07) 0%,transparent 65%)", pointerEvents: "none" }} />

        <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 58, height: 58, borderRadius: 15, background: `linear-gradient(135deg,${C.gold},${C.goldDim})`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "#080b12", fontFamily: "'Playfair Display',serif", marginBottom: 14, boxShadow: "0 8px 28px rgba(212,168,83,0.25)" }}>B</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 27, fontWeight: 700, color: C.gold, letterSpacing: "0.04em" }}>BankApi</div>
            <div style={{ color: C.textSub, fontSize: 13, marginTop: 5 }}>Prywatna bankowość online</div>
          </div>

          {/* Card */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 70px rgba(0,0,0,0.55)" }}>
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
              {[["login", "Logowanie"], ["register", "Rejestracja"]].map(([id, lbl]) => (
                <button key={id} onClick={() => { setTab(id); setLE(""); setRErr(""); }} style={{ flex: 1, background: "none", border: "none", borderBottom: `2px solid ${tab === id ? C.gold : "transparent"}`, color: tab === id ? C.gold : C.textSub, fontWeight: tab === id ? 700 : 400, fontSize: 14, padding: "14px 0", cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>{lbl}</button>
              ))}
            </div>

            <div style={{ padding: "26px 28px 30px" }}>
              {tab === "login" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                  <ErrBox msg={lErr} />
                  <Field label="Nazwa użytkownika" value={lU} onChange={e => setLU(e.target.value)} placeholder="jan.kowalski" autoComplete="username" />
                  <Field label="Hasło" type="password" value={lP} onChange={e => setLP(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && doLogin()} />
                  <Btn full onClick={doLogin} disabled={lBusy}>{lBusy ? "Logowanie…" : "Zaloguj się →"}</Btn>
                </div>
              )}
              {tab === "register" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                  <ErrBox msg={rErr} />
                  <OkBox msg={rOk ? "Konto założone! Logowanie…" : ""} />
                  <Field label="Nazwa użytkownika" value={rU} onChange={e => setRU(e.target.value)} placeholder="jan.kowalski" />
                  <Field label="Email" type="email" value={rE} onChange={e => setRE(e.target.value)} placeholder="jan@example.com" />
                  <Field label="Hasło (min. 6 znaków)" type="password" value={rP} onChange={e => setRP(e.target.value)} placeholder="••••••••" />
                  <Field label="Powtórz hasło" type="password" value={rP2} onChange={e => setRP2(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && doRegister()} />
                  <Btn full onClick={doRegister} disabled={rBusy || rOk}>{rBusy ? "Rejestrowanie…" : "Zarejestruj się →"}</Btn>
                </div>
              )}
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 14, fontSize: 11, color: C.textDim }}>
            API: <span style={{ color: C.blue, fontFamily: "monospace" }}>{BASE}</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── DASHBOARD ────────────────────────────────────── */

function Dashboard({ customer, setPage, setSelAccount }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try { setAccounts(await api(`/api/customers/${customer.id}/accounts`) ?? []); }
    catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [customer.id]);

  useEffect(() => { load(); }, [load]);

  const rates = { PLN: 1, EUR: 4.27, USD: 3.89 };
  const total = accounts.reduce((s, a) => s + a.balance * (rates[a.currency] || 1), 0);

  return (
    <Shell title={`Witaj, ${customer.username}`} subtitle="Przegląd finansów">
      <div style={{ background: `linear-gradient(135deg,${C.surfaceHigh} 0%,#0e1525 100%)`, border: `1px solid ${C.border}`, borderRadius: 18, padding: "30px 34px", marginBottom: 26, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle,${C.goldGlow} 0%,transparent 70%)` }} />
        <div style={{ fontSize: 11, color: C.textSub, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Łączne saldo (szac. PLN)</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 46, fontWeight: 700, color: C.text, lineHeight: 1 }}>{loading ? "—" : money(total, "PLN")}</div>
        <div style={{ color: C.textSub, fontSize: 13, marginTop: 8 }}>{accounts.length} {accounts.length === 1 ? "konto" : "konta"} · {customer.email}</div>
      </div>
      {loading && <Spinner />}
      {err && <ErrBox msg={err} retry={load} />}
      {!loading && !err && (
        <>
          <div style={{ fontSize: 11, color: C.textSub, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Twoje konta</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 13 }}>
            {accounts.map(acc => (
              <div key={acc.id} onClick={() => { setSelAccount(acc); setPage("accounts"); }} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px", cursor: "pointer", transition: "all .18s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.goldDim; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${C.goldGlow}`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  <AccBadge type={acc.type} />
                  <span style={{ fontFamily: "monospace", color: C.textSub, fontSize: 11 }}>···· {acc.accountNumber}</span>
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 21, fontWeight: 600, color: C.text }}>{money(acc.balance, acc.currency)}</div>
                {acc.overdraftLimit != null && <div style={{ fontSize: 11, color: C.textSub, marginTop: 5 }}>Limit: {money(acc.overdraftLimit, acc.currency)}</div>}
                {acc.interestRate  != null && <div style={{ fontSize: 11, color: C.green,   marginTop: 5 }}>+{acc.interestRate}% rocznie</div>}
              </div>
            ))}
            {accounts.length === 0 && <div style={{ color: C.textSub, fontSize: 13 }}>Brak kont.</div>}
          </div>
        </>
      )}
    </Shell>
  );
}

/* ── ACCOUNTS ─────────────────────────────────────── */

function Accounts({ customer, selAccount, setSelAccount }) {
  const [accounts, setAccounts] = useState([]);
  const [txns, setTxns]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [txLoad, setTxLoad]     = useState(false);
  const [err, setErr]           = useState("");

  // Formularz nowego konta bankowego
  const [showNew, setShowNew]     = useState(false);
  const [newType, setNewType]     = useState("CheckingAccount");
  const [newCur, setNewCur]       = useState("PLN");
  const [newBusy, setNewBusy]     = useState(false);
  const [newErr, setNewErr]       = useState("");
  const [newOk, setNewOk]         = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try {
      const d = await api(`/api/customers/${customer.id}/accounts`);
      setAccounts(d ?? []);
      if (!selAccount && d?.length) setSelAccount(d[0]);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [customer.id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!selAccount) return;
    setTxLoad(true);
    api(`/api/account/${selAccount.id}/transactions`)
      .then(d => setTxns((d ?? []).sort((a, b) => new Date(a.date) - new Date(b.date))))
      .catch(() => setTxns([]))
      .finally(() => setTxLoad(false));
  }, [selAccount?.id]);

  async function createAccount() {
    setNewBusy(true); setNewErr(""); setNewOk(false);
    try {
      // PUT /api/customer/{id}/account
      // Backend ustawia domyślne wartości (overdraftLimit=200, interestRate=0.05)
      // Konstruktor przyjmuje tylko: type, currency, customer
      const body = {
        type: newType,
        currency: newCur,
        customer: { id: customer.id },
      };
      await api(`/api/customer/${customer.id}/account`, { method: "PUT", body: JSON.stringify(body) });
      setNewOk(true);
      setTimeout(() => { setShowNew(false); setNewOk(false); }, 1200);
      load();
    } catch (e) { setNewErr(e.message); }
    finally { setNewBusy(false); }
  }

  const txIcon  = { SEND: "↑", RECEIVE: "↓", DEPOSIT: "↓", WITHDRAW: "↑" };
  const txColor = { SEND: C.red, RECEIVE: C.green, DEPOSIT: C.green, WITHDRAW: C.red };

  return (
    <Shell
      title="Konta"
      subtitle="Szczegóły i historia transakcji"
      action={<Btn onClick={() => { setShowNew(v => !v); setNewErr(""); setNewOk(false); }} variant={showNew ? "ghost" : "gold"}>{showNew ? "Anuluj" : "+ Nowe konto"}</Btn>}
    >
      {/* ── Formularz nowego konta ── */}
      {showNew && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 16 }}>Otwórz nowe konto bankowe</div>
          <ErrBox msg={newErr} />
          <OkBox msg={newOk ? "Konto zostało utworzone!" : ""} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginTop: newErr || newOk ? 14 : 0 }}>
            <Sel label="Typ konta" value={newType} onChange={e => setNewType(e.target.value)}>
              <option value="CheckingAccount">Rachunek bieżący (limit: 200)</option>
              <option value="SavingAccount">Konto oszczędnościowe (5% rocznie)</option>
            </Sel>
            <Sel label="Waluta" value={newCur} onChange={e => setNewCur(e.target.value)}>
              <option value="PLN">PLN — złoty</option>
              <option value="EUR">EUR — euro</option>
              <option value="USD">USD — dolar</option>
            </Sel>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: C.textSub }}>
            {newType === "CheckingAccount" ? "Domyślny limit debetowy: 200 · Saldo początkowe: 0" : "Domyślne oprocentowanie: 5% · Saldo początkowe: 0"}
          </div>
          <div style={{ marginTop: 16 }}>
            <Btn onClick={createAccount} disabled={newBusy || newOk}>{newBusy ? "Tworzenie…" : "Utwórz konto →"}</Btn>
          </div>
        </div>
      )}

      {loading && <Spinner />}
      {err && <ErrBox msg={err} retry={load} />}
      {!loading && !err && (
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, alignItems: "start" }}>
          {/* Lista kont */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {accounts.map(acc => {
              const active = selAccount?.id === acc.id;
              return (
                <div key={acc.id} onClick={() => setSelAccount(acc)} style={{ background: active ? C.surfaceHigh : C.surface, border: `1px solid ${active ? C.gold : C.border}`, borderRadius: 12, padding: "15px 16px", cursor: "pointer", transition: "all .15s", boxShadow: active ? `0 0 0 1px ${C.gold}22,0 4px 20px ${C.goldGlow}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <AccBadge type={acc.type} />
                    <span style={{ fontFamily: "monospace", color: C.textSub, fontSize: 11 }}>···· {acc.accountNumber}</span>
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 17, fontWeight: 600, color: C.text }}>{money(acc.balance, acc.currency)}</div>
                </div>
              );
            })}
            {accounts.length === 0 && <div style={{ color: C.textSub, fontSize: 13, padding: "20px 0" }}>Brak kont. Kliknij "+ Nowe konto".</div>}
          </div>

          {/* Szczegóły */}
          {selAccount ? (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "24px 26px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                    <AccBadge type={selAccount.type} />
                    <span style={{ fontFamily: "monospace", color: C.textSub, fontSize: 12 }}>···· {selAccount.accountNumber}</span>
                  </div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 34, fontWeight: 700, color: C.text }}>{money(selAccount.balance, selAccount.currency)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {selAccount.overdraftLimit != null && <>
                    <div style={{ fontSize: 11, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Limit debetowy</div>
                    <div style={{ fontFamily: "monospace", color: C.blue, fontWeight: 600, fontSize: 15 }}>{money(selAccount.overdraftLimit, selAccount.currency)}</div>
                  </>}
                  {selAccount.interestRate != null && <>
                    <div style={{ fontSize: 11, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Oprocentowanie</div>
                    <div style={{ fontFamily: "monospace", color: C.green, fontWeight: 600, fontSize: 15 }}>{selAccount.interestRate}% / rok</div>
                  </>}
                </div>
              </div>
              <div style={{ height: 1, background: C.border, marginBottom: 18 }} />
              <div style={{ fontSize: 11, color: C.textSub, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Historia transakcji</div>
              {txLoad && <Spinner />}
              {!txLoad && txns.length === 0 && <div style={{ color: C.textSub, fontSize: 13, padding: "28px 0", textAlign: "center" }}>Brak transakcji</div>}
              {!txLoad && txns.map((tx, i) => {
                const pos = tx.type === "RECEIVE" || tx.type === "DEPOSIT";
                return (
                  <div key={tx.id ?? i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: pos ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)", color: txColor[tx.type] ?? C.textSub, fontSize: 15, fontWeight: 700 }}>
                      {txIcon[tx.type] ?? "·"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: C.text, fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.description || tx.type}</div>
                      <div style={{ color: C.textSub, fontSize: 11, marginTop: 2, fontFamily: "monospace" }}>{tx.date}</div>
                    </div>
                    <div style={{ fontFamily: "monospace", fontWeight: 600, fontSize: 14, color: txColor[tx.type] ?? C.text, whiteSpace: "nowrap" }}>
                      {pos ? "+" : "−"}{money(tx.amount, selAccount.currency)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: C.textSub, fontSize: 13, padding: 40 }}>Wybierz konto z listy.</div>
          )}
        </div>
      )}
    </Shell>
  );
}

/* ── TRANSFER ─────────────────────────────────────── */

function Transfer({ customer }) {
  const [accounts, setAccounts] = useState([]);
  const [fromId, setFromId]     = useState("");
  const [toId, setToId]         = useState("");
  const [amount, setAmount]     = useState("");
  const [desc, setDesc]         = useState("");
  const [busy, setBusy]         = useState(false);
  const [loadAcc, setLA]        = useState(true);
  const [result, setResult]     = useState(null);
  const [errMsg, setErrMsg]     = useState("");

  useEffect(() => {
    api(`/api/customers/${customer.id}/accounts`)
      .then(d => { setAccounts(d ?? []); if (d?.length) setFromId(String(d[0].id)); })
      .catch(() => {}).finally(() => setLA(false));
  }, [customer.id]);

  async function send() {
    if (!fromId || !toId || !amount) return;
    setBusy(true); setResult(null);
    try {
      await api("/api/account/transaction", {
        method: "POST",
        body: JSON.stringify({ fromAccountId: Number(fromId), toAccountId: Number(toId), amount: Number(amount), description: desc }),
      });
      setResult("ok"); setToId(""); setAmount(""); setDesc("");
      const fresh = await api(`/api/customers/${customer.id}/accounts`);
      setAccounts(fresh ?? []);
    } catch (e) { setResult("err"); setErrMsg(e.message); }
    finally { setBusy(false); }
  }

  const fromAcc = accounts.find(a => String(a.id) === String(fromId));

  return (
    <Shell title="Przelew" subtitle="Wyślij środki między kontami">
      <div style={{ maxWidth: 520 }}>
        {loadAcc && <Spinner />}
        {!loadAcc && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "26px 28px" }}>
            {result === "ok"  && <div style={{ marginBottom: 14 }}><OkBox msg="Przelew zrealizowany." /></div>}
            {result === "err" && <div style={{ marginBottom: 14 }}><ErrBox msg={errMsg} /></div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <Sel label="Z konta" value={fromId} onChange={e => setFromId(e.target.value)}>
                {accounts.map(a => <option key={a.id} value={a.id}>ID:{a.id} ···· {a.accountNumber} — {money(a.balance, a.currency)}</option>)}
              </Sel>
              {fromAcc && (
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: C.textSub, fontSize: 12 }}>Dostępne saldo</span>
                  <span style={{ fontFamily: "monospace", color: C.text, fontSize: 13, fontWeight: 600 }}>{money(fromAcc.balance, fromAcc.currency)}</span>
                </div>
              )}
              <Field label="ID konta docelowego" value={toId} onChange={e => setToId(e.target.value)} placeholder="np. 3" type="number" />
              <Field label="Kwota" type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
              <Field label="Opis" value={desc} onChange={e => setDesc(e.target.value)} placeholder="np. Czynsz za marzec" />
              <Btn full onClick={send} disabled={busy || !fromId || !toId || !amount}>{busy ? "Wysyłanie…" : "Wyślij przelew →"}</Btn>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ── DEPOSIT / WITHDRAW ───────────────────────────── */

function DepositWithdraw({ customer }) {
  const [accounts, setAccounts] = useState([]);
  const [accId, setAccId]       = useState("");
  const [amount, setAmount]     = useState("");
  const [mode, setMode]         = useState("deposit");
  const [busy, setBusy]         = useState(false);
  const [loadAcc, setLA]        = useState(true);
  const [result, setResult]     = useState(null);
  const [errMsg, setErrMsg]     = useState("");

  useEffect(() => {
    api(`/api/customers/${customer.id}/accounts`)
      .then(d => { setAccounts(d ?? []); if (d?.length) setAccId(String(d[0].id)); })
      .catch(() => {}).finally(() => setLA(false));
  }, [customer.id]);

  async function submit() {
    if (!accId || !amount) return;
    setBusy(true); setResult(null);
    try {
      if (mode === "deposit") await api(`/api/account/${accId}/deposit/${amount}`, { method: "PUT" });
      else                    await api(`/api/account/${accId}/withdraw/${amount}`, { method: "PUT" });
      setResult("ok"); setAmount("");
      const fresh = await api(`/api/customers/${customer.id}/accounts`);
      setAccounts(fresh ?? []);
    } catch (e) { setResult("err"); setErrMsg(e.message); }
    finally { setBusy(false); }
  }

  const selAcc = accounts.find(a => String(a.id) === String(accId));

  return (
    <Shell title="Wpłata / Wypłata" subtitle="Bezpośrednie operacje na koncie">
      <div style={{ maxWidth: 520 }}>
        {loadAcc && <Spinner />}
        {!loadAcc && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "26px 28px" }}>
            {result === "ok"  && <div style={{ marginBottom: 14 }}><OkBox msg={mode === "deposit" ? "Wpłata zrealizowana." : "Wypłata zrealizowana."} /></div>}
            {result === "err" && <div style={{ marginBottom: 14 }}><ErrBox msg={errMsg} /></div>}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, background: C.bg, padding: 4, borderRadius: 10, border: `1px solid ${C.border}` }}>
              {[["deposit","↓ Wpłata"],["withdraw","↑ Wypłata"]].map(([m, lbl]) => (
                <button key={m} onClick={() => { setMode(m); setResult(null); }} style={{ flex: 1, border: mode === m ? `1px solid ${m === "deposit" ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}` : "1px solid transparent", borderRadius: 7, background: mode === m ? (m === "deposit" ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)") : "transparent", color: mode === m ? (m === "deposit" ? C.green : C.red) : C.textSub, fontWeight: mode === m ? 700 : 400, fontSize: 13, padding: "9px", cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>{lbl}</button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <Sel label="Konto" value={accId} onChange={e => setAccId(e.target.value)}>
                {accounts.map(a => <option key={a.id} value={a.id}>ID:{a.id} ···· {a.accountNumber} — {money(a.balance, a.currency)}</option>)}
              </Sel>
              {selAcc && (
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: C.textSub, fontSize: 12 }}>Aktualne saldo</span>
                  <span style={{ fontFamily: "monospace", color: C.text, fontSize: 13, fontWeight: 600 }}>{money(selAcc.balance, selAcc.currency)}</span>
                </div>
              )}
              <Field label="Kwota" type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
              <Btn full variant={mode === "withdraw" ? "red" : "gold"} onClick={submit} disabled={busy || !accId || !amount}>
                {busy ? "Przetwarzanie…" : mode === "deposit" ? "Wpłać →" : "Wypłać →"}
              </Btn>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ── TRANSACTIONS ─────────────────────────────────── */

function Transactions({ customer }) {
  const [txns, setTxns]       = useState([]);
  const [accounts, setAcc]    = useState([]);
  const [filter, setFilter]   = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState("");

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try {
      const accs = await api(`/api/customers/${customer.id}/accounts`);
      setAcc(accs ?? []);
      const all = await Promise.all((accs ?? []).map(a => api(`/api/account/${a.id}/transactions`).catch(() => [])));
      const seen = new Set();
      setTxns(all.flat().filter(t => { if (seen.has(t.id)) return false; seen.add(t.id); return true; }).sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [customer.id]);

  useEffect(() => { load(); }, [load]);

  const types  = ["ALL", ...new Set(txns.map(t => t.type))];
  const shown  = filter === "ALL" ? txns : txns.filter(t => t.type === filter);
  const tColor = { SEND: C.red, RECEIVE: C.green, DEPOSIT: C.green, WITHDRAW: C.red };

  function accLabel(ref) {
    if (!ref) return "—";
    const id = typeof ref === "object" ? ref.id : ref;
    const a = accounts.find(x => x.id === id);
    return a ? `···· ${a.accountNumber}` : `#${id}`;
  }

  return (
    <Shell title="Transakcje" subtitle="Pełna historia operacji">
      {loading && <Spinner />}
      {err && <ErrBox msg={err} retry={load} />}
      {!loading && !err && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
            {types.map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{ background: filter === t ? C.gold : C.surface, color: filter === t ? "#080b12" : C.textSub, border: `1px solid ${filter === t ? C.gold : C.border}`, borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: filter === t ? 700 : 400, fontFamily: "inherit", transition: "all .15s" }}>{t}</button>
            ))}
            <button onClick={load} style={{ marginLeft: "auto", background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 12px", color: C.textSub, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>↻ Odśwież</button>
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 130px 130px 120px", padding: "11px 20px", borderBottom: `1px solid ${C.border}`, fontSize: 10, color: C.textSub, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              <span>Typ</span><span>Opis / Data</span><span>Z konta</span><span>Na konto</span><span style={{ textAlign: "right" }}>Kwota</span>
            </div>
            {shown.length === 0 && <div style={{ textAlign: "center", color: C.textSub, padding: 46, fontSize: 13 }}>Brak transakcji</div>}
            {shown.map((tx, i) => (
              <div key={tx.id ?? i} style={{ display: "grid", gridTemplateColumns: "80px 1fr 130px 130px 120px", padding: "13px 20px", borderBottom: `1px solid ${C.border}`, fontSize: 13, alignItems: "center", transition: "background .1s" }}
                onMouseEnter={e => (e.currentTarget.style.background = C.surfaceHigh)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: tColor[tx.type] ?? C.textSub, textTransform: "uppercase" }}>{tx.type}</span>
                <div>
                  <div style={{ color: C.text, fontWeight: 500 }}>{tx.description || "—"}</div>
                  <div style={{ color: C.textSub, fontSize: 11, marginTop: 2, fontFamily: "monospace" }}>{tx.date}</div>
                </div>
                <span style={{ fontFamily: "monospace", color: C.textSub, fontSize: 12 }}>{accLabel(tx.fromAccount)}</span>
                <span style={{ fontFamily: "monospace", color: C.textSub, fontSize: 12 }}>{accLabel(tx.toAccount)}</span>
                <span style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 600, color: tColor[tx.type] ?? C.text }}>
                  {(tx.type === "RECEIVE" || tx.type === "DEPOSIT") ? "+" : "−"}{Number(tx.amount).toLocaleString("pl-PL", { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Shell>
  );
}

/* ── CUSTOMERS ────────────────────────────────────── */

function Customers() {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ username: "", password: "", email: "" });
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try { setList(await api("/api/customers") ?? []); }
    catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add() {
    setSaving(true);
    try { await api("/api/customers", { method: "POST", body: JSON.stringify(form) }); setShowAdd(false); setForm({ username: "", password: "", email: "" }); load(); }
    catch (e) { alert("Błąd: " + e.message); }
    finally { setSaving(false); }
  }

  async function del(id) {
    if (!confirm("Na pewno usunąć tego klienta?")) return;
    try { await api(`/api/customers/${id}`, { method: "DELETE" }); load(); }
    catch (e) { alert("Błąd: " + e.message); }
  }

  return (
    <Shell title="Klienci" subtitle="Zarządzaj użytkownikami systemu"
      action={<Btn variant={showAdd ? "ghost" : "gold"} onClick={() => setShowAdd(v => !v)}>{showAdd ? "Anuluj" : "+ Dodaj klienta"}</Btn>}>
      {showAdd && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px", marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 140 }}><Field label="Użytkownik" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></div>
          <div style={{ flex: 1, minWidth: 140 }}><Field label="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div style={{ flex: 1, minWidth: 140 }}><Field label="Hasło" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
          <Btn onClick={add} disabled={saving}>{saving ? "Zapisywanie…" : "Zapisz"}</Btn>
        </div>
      )}
      {loading && <Spinner />}
      {err && <ErrBox msg={err} retry={load} />}
      {!loading && !err && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr auto", padding: "11px 20px", borderBottom: `1px solid ${C.border}`, fontSize: 10, color: C.textSub, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            <span>ID</span><span>Użytkownik</span><span>Email</span><span>Akcja</span>
          </div>
          {list.length === 0 && <div style={{ textAlign: "center", color: C.textSub, padding: 46, fontSize: 13 }}>Brak klientów</div>}
          {list.map(c => (
            <div key={c.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr auto", padding: "14px 20px", borderBottom: `1px solid ${C.border}`, alignItems: "center", fontSize: 13, transition: "background .1s" }}
              onMouseEnter={e => (e.currentTarget.style.background = C.surfaceHigh)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <span style={{ fontFamily: "monospace", color: C.textSub, fontSize: 12 }}>#{c.id}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${C.goldGlow2},${C.border})`, display: "flex", alignItems: "center", justifyContent: "center", color: C.gold, fontWeight: 700, fontSize: 13, border: `1px solid ${C.goldDim}` }}>
                  {c.username?.[0]?.toUpperCase()}
                </div>
                <span style={{ color: C.text, fontWeight: 500 }}>{c.username}</span>
              </div>
              <span style={{ color: C.textSub }}>{c.email}</span>
              <Btn variant="red" sm onClick={() => del(c.id)}>Usuń</Btn>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

/* ── APP ROOT ─────────────────────────────────────── */

export default function App() {
  const [customer, setCustomer] = useState(() => {
    try { return JSON.parse(localStorage.getItem("customer")); } catch { return null; }
  });
  const [page, setPage]         = useState("dashboard");
  const [selAccount, setSelAcc] = useState(null);

  function logout() { setCustomer(null); localStorage.removeItem("jwtToken"); localStorage.removeItem("refreshToken"); localStorage.removeItem("customer"); setPage("dashboard"); setSelAcc(null); }

  const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');`;
  const RESET = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; }
    body { background: ${C.bg}; font-family: 'Outfit', sans-serif; color: ${C.text}; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
    select option { background: ${C.surface}; }
    input[type=number]::-webkit-inner-spin-button { opacity: 0.3; }
  `;

  if (!customer) return <><style>{FONTS + RESET}</style><AuthPage onLogin={setCustomer} /></>;

  const views = {
    dashboard:    <Dashboard       customer={customer} setPage={setPage} setSelAccount={setSelAcc} />,
    accounts:     <Accounts        customer={customer} selAccount={selAccount} setSelAccount={setSelAcc} />,
    transfer:     <Transfer        customer={customer} />,
    deposit:      <DepositWithdraw customer={customer} />,
    transactions: <Transactions    customer={customer} />,
    customers:    <Customers />,
  };

  return (
    <>
      <style>{FONTS + RESET}</style>
      <div style={{ display: "flex", height: "100%", minHeight: "100vh", background: C.bg }}>
        <Sidebar page={page} setPage={setPage} customer={customer} onLogout={logout} />
        <div style={{ flex: 1, overflowY: "auto" }}>{views[page] ?? views.dashboard}</div>
      </div>
    </>
  );
}