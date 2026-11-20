import { useState } from "react";

/* Si tienes una foto de bosque con niebla, ponla en /public/bosque.jpg y escribe aquí "/bosque.jpg" */
const FOTO_FONDO = "/bosque.jpg";

/* ---------- Datos de ejemplo (reemplazar por API FastAPI / WebSocket) ---------- */
const EVENTOS = [
  { id: 1, fecha: "2026-11-08", hora: "05:42:17", lat: 19.4312, lng: -99.1331, radio: 38, mx: 210, my: 130 },
  { id: 2, fecha: "2026-11-08", hora: "05:49:03", lat: 19.4287, lng: -99.1402, radio: 52, mx: 120, my: 170 },
  { id: 3, fecha: "2026-11-07", hora: "04:58:41", lat: 19.4355, lng: -99.1276, radio: 44, mx: 270, my: 100 },
  { id: 4, fecha: "2026-11-05", hora: "06:12:55", lat: 19.4301, lng: -99.1349, radio: 61, mx: 180, my: 190 },
  { id: 5, fecha: "2026-11-02", hora: "05:03:09", lat: 19.4338, lng: -99.1312, radio: 35, mx: 235, my: 150 },
];
const NODOS = [
  { n: "Nodo 1", est: "En línea", bat: 92, gps: "Fijo", ok: true, x: 70, y: 230 },
  { n: "Nodo 2", est: "En línea", bat: 78, gps: "Fijo", ok: true, x: 330, y: 220 },
  { n: "Nodo 3", est: "En línea", bat: 64, gps: "Fijo", ok: true, x: 200, y: 50 },
  { n: "Nodo 4", est: "Sin señal", bat: 18, gps: "Buscando", ok: false, x: 340, y: 60 },
];
const PASOS = [
  ["Nodos ESP32", "Mínimo 3 nodos escuchan el entorno y marcan el instante exacto de cada detonación."],
  ["Broker MQTT", "Los eventos viajan en tiempo real hacia el servidor."],
  ["Servidor FastAPI", "Calcula el origen con TDOA, la diferencia de tiempo de llegada entre nodos."],
  ["Base de datos", "Cada evento se guarda con fecha, hora, coordenadas y radio de incertidumbre."],
  ["Página web", "Mapa, alertas e historial para consultar y exportar la evidencia."],
];
const TECNO = [
  ["Frontend", "React, Leaflet (mapas), Recharts (gráficas), WebSocket"],
  ["Backend", "Python con FastAPI, SciPy (cálculo TDOA)"],
  ["Transporte de datos", "Broker MQTT (Mosquitto)"],
  ["Base de datos", "PostgreSQL o SQLite"],
  ["Nodos de campo", "ESP32, micrófono INMP441 (I2S), GPS NEO-6M con PPS, sensor BME280"],
];
const NAV = [["inicio", "Inicio"], ["proyecto", "Proyecto"], ["monitoreo", "Monitoreo"], ["historial", "Historial"], ["nodos", "Nodos"], ["contacto", "Contacto"]];

/* ---------- Estilos ---------- */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500&display=swap');
.jk{--tx:#EEF5F1;--mu:rgba(238,245,241,.68);--ln:rgba(255,255,255,.16);--gl:rgba(9,24,20,.5);--mint:#B9E3C6;--amb:#F2A04B;
  position:relative;min-height:100vh;padding:20px;color:var(--tx);font-family:'Space Grotesk',system-ui,sans-serif;background:#10231F;overflow:hidden}
.jk *{box-sizing:border-box;margin:0}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center bottom}
.frame{position:relative;min-height:calc(100vh - 40px);border:2px solid var(--ln);border-radius:40px;padding:26px 36px 32px;display:flex;flex-direction:column;backdrop-filter:blur(1px)}
.top{display:flex;align-items:center;justify-content:space-between;gap:16px}
.logo{display:flex;align-items:center;gap:10px;background:none;border:0;color:var(--tx);font:500 1.05rem 'Space Grotesk';letter-spacing:.14em;cursor:pointer}
.menu{display:flex;align-items:center;gap:26px}
.menu .lk{background:none;border:0;color:var(--tx);font:400 .9rem 'Space Grotesk';cursor:pointer;padding:6px 0;border-bottom:1px solid transparent;opacity:.85}
.menu .lk:hover,.menu .lk.on{opacity:1;border-color:var(--mint)}
.cta{background:#fff;color:#10231F;border:0;border-radius:10px;padding:10px 18px;font:500 .9rem 'Space Grotesk';cursor:pointer}
.cta:hover{background:var(--mint)}
.burger{display:none;background:none;border:1px solid var(--ln);color:var(--tx);border-radius:10px;padding:8px 12px;font:inherit;cursor:pointer}
button:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid var(--mint);outline-offset:2px}
.page{flex:1;display:flex;flex-direction:column;padding-top:28px}
.home{justify-content:space-between;gap:28px}
.h1{font-weight:300;font-size:clamp(2.8rem,8.2vw,7rem);line-height:1;letter-spacing:-.03em;margin-top:12px}
.h1 span{display:block;color:rgba(238,245,241,.5)}
.row{display:flex;justify-content:space-between;align-items:flex-end;gap:28px;flex-wrap:wrap}
.intro{max-width:300px;color:var(--mu);font-size:.9rem;line-height:1.6}
.stat{margin-left:24px}.stat b{font-weight:400;font-size:1.4rem}.stat small{display:block;color:var(--mu);font-size:.8rem}
.glass{background:var(--gl);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid var(--ln);border-radius:24px;padding:22px}
.ev-card{width:min(360px,100%)}
.ev-card h3{font-weight:400;font-size:1.25rem;line-height:1.25;margin-bottom:14px}
.pill{display:inline-flex;align-items:center;gap:8px;font-size:.8rem;color:var(--mu)}
.dotv{width:8px;height:8px;border-radius:50%;background:#5FD38A;box-shadow:0 0 0 4px rgba(95,211,138,.2)}
.dotv.off{background:var(--amb);box-shadow:0 0 0 4px rgba(242,160,75,.2)}
.two{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}
.box{background:rgba(255,255,255,.07);border:1px solid var(--ln);border-radius:12px;padding:10px 12px}
.box small{display:block;color:var(--mu);font-size:.72rem}.box span{font-size:.9rem}
.btnw{width:100%;background:#fff;color:#10231F;border:0;border-radius:10px;padding:12px;font:500 .95rem 'Space Grotesk';cursor:pointer;margin-top:6px}
.btnw:hover{background:var(--mint)}
.btng{background:transparent;color:var(--tx);border:1px solid var(--ln);border-radius:10px;padding:10px 16px;font:400 .9rem 'Space Grotesk';cursor:pointer}
.btng:hover{background:rgba(255,255,255,.1)}
.h2{font-weight:300;font-size:clamp(1.9rem,4vw,3rem);letter-spacing:-.02em;margin-bottom:10px}
.lead{color:var(--mu);max-width:60ch;line-height:1.65}
.grid{display:grid;grid-template-columns:1.3fr 1fr;gap:18px;margin-top:24px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:24px}
.map{width:100%;height:auto;border-radius:16px;background:rgba(5,15,12,.55)}
.evb{width:100%;text-align:left;background:rgba(255,255,255,.05);border:1px solid var(--ln);border-radius:14px;padding:12px 14px;margin-bottom:10px;color:var(--tx);font:inherit;cursor:pointer}
.evb.on{border-color:var(--mint);background:rgba(185,227,198,.12)}
.evb small{display:block;color:var(--mu)}
.steps{list-style:none;padding:0;margin-top:24px}
.steps li{display:grid;grid-template-columns:38px 1fr;gap:16px;padding-bottom:20px;position:relative}
.steps li:not(:last-child)::before{content:"";position:absolute;left:18px;top:38px;bottom:0;width:1px;background:var(--ln)}
.num{width:38px;height:38px;border-radius:50%;border:1px solid var(--mint);color:var(--mint);display:grid;place-items:center}
.steps h3{font-weight:500;font-size:1rem}.steps p{color:var(--mu);font-size:.9rem}
dl{display:grid;grid-template-columns:max-content 1fr}
dt,dd{padding:12px 0;border-bottom:1px solid var(--ln);font-size:.92rem}dt{padding-right:28px;color:var(--mint)}dd{color:var(--mu)}
.tools{display:flex;gap:12px;flex-wrap:wrap;margin:22px 0 14px}
input,textarea{width:100%;font:inherit;color:var(--tx);background:rgba(255,255,255,.07);border:1px solid var(--ln);border-radius:12px;padding:12px 14px}
input::placeholder,textarea::placeholder{color:var(--mu)}
.tools input{max-width:260px}
label{display:block;font-size:.85rem;color:var(--mu);margin:14px 0 6px}
textarea{min-height:110px;resize:vertical}
.tw{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:.9rem;min-width:520px}
th{text-align:left;font-weight:400;color:var(--mu);padding:12px;border-bottom:1px solid var(--ln)}td{padding:12px;border-bottom:1px solid var(--ln)}
.bar{height:6px;border-radius:6px;background:rgba(255,255,255,.12);overflow:hidden;margin-top:6px}.bar i{display:block;height:100%;background:var(--mint)}
.ok{margin-top:14px;padding:12px 14px;border-radius:12px;background:rgba(185,227,198,.15);color:var(--mint)}
.foot{margin-top:36px;padding-top:18px;border-top:1px solid var(--ln);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;color:var(--mu);font-size:.8rem}
.foot button{background:none;border:0;color:var(--mu);font:inherit;cursor:pointer;text-decoration:underline}
.glow{animation:gl 3s ease-in-out infinite}@keyframes gl{50%{opacity:.55}}
@media (prefers-reduced-motion:reduce){.glow{animation:none}}
@media (max-width:860px){
  .jk{padding:10px}.frame{padding:20px;border-radius:28px;min-height:calc(100vh - 20px)}
  .burger{display:block}.menu{display:none;position:absolute;top:70px;left:16px;right:16px;z-index:5;flex-direction:column;align-items:stretch;gap:6px;background:rgba(9,24,20,.92);border:1px solid var(--ln);border-radius:20px;padding:16px}
  .menu.open{display:flex}.grid{grid-template-columns:1fr}.stat{margin-left:0;margin-top:14px}
}`;

/* ---------- Escena: bosque con niebla y un nodo con luz ámbar ---------- */
const Pino = ({ x, y, h, o, f }) => {
  const w = h * 0.17;
  return <path fill={f} opacity={o} d={`M${x} ${y - h}L${x + w} ${y - h * .62}L${x + w * .55} ${y - h * .62}L${x + w * 1.4} ${y - h * .3}L${x + w * .7} ${y - h * .3}L${x + w * 1.7} ${y}L${x - w * 1.7} ${y}L${x - w * .7} ${y - h * .3}L${x - w * 1.4} ${y - h * .3}L${x - w * .55} ${y - h * .62}L${x - w} ${y - h * .62}Z`} />;
};
function Escena() {
  if (FOTO_FONDO) return <img className="bg" src={FOTO_FONDO} alt="" />;
  const atras = [60, 190, 330, 470, 640, 790, 930, 1060, 1150];
  const medio = [10, 150, 300, 720, 880, 1010, 1130];
  const frente = [-20, 120, 1040, 1180];
  return (
    <svg className="bg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6B9CA0" /><stop offset=".55" stopColor="#3F7176" /><stop offset="1" stopColor="#173236" /></linearGradient>
        <linearGradient id="suelo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1E3B33" /><stop offset="1" stopColor="#0C1A17" /></linearGradient>
        <radialGradient id="luz"><stop offset="0" stopColor="#F2A04B" stopOpacity=".95" /><stop offset="1" stopColor="#F2A04B" stopOpacity="0" /></radialGradient>
        <filter id="n"><feGaussianBlur stdDeviation="26" /></filter>
      </defs>
      <rect width="1200" height="800" fill="url(#cielo)" />
      {atras.map((x, i) => <Pino key={"a" + i} x={x} y={560} h={260 + (i % 3) * 50} f="#5F8E91" o=".5" />)}
      <ellipse cx="600" cy="520" rx="720" ry="70" fill="#CFE5E3" opacity=".3" filter="url(#n)" />
      {medio.map((x, i) => <Pino key={"m" + i} x={x} y={620} h={380 + (i % 2) * 90} f="#264B4E" o=".85" />)}
      <ellipse cx="500" cy="640" rx="700" ry="60" fill="#CFE5E3" opacity=".22" filter="url(#n)" />
      <rect y="620" width="1200" height="180" fill="url(#suelo)" />
      <circle className="glow" cx="470" cy="598" r="90" fill="url(#luz)" />
      <g>
        <line x1="470" y1="545" x2="470" y2="680" stroke="#0B1715" strokeWidth="5" />
        <rect x="452" y="570" width="36" height="30" rx="5" fill="#0B1715" />
        <circle cx="470" cy="585" r="7" fill="#F2A04B" />
        <path d="M455 548 q15 -18 30 0" stroke="#0B1715" strokeWidth="3" fill="none" />
      </g>
      {frente.map((x, i) => <Pino key={"f" + i} x={x} y={820} h={620} f="#0B1715" o=".95" />)}
      <rect width="1200" height="800" fill="#06110F" opacity=".25" />
    </svg>
  );
}

const Logo = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
    <circle cx="13" cy="13" r="4" fill="#B9E3C6" /><circle cx="13" cy="13" r="8" fill="none" stroke="#B9E3C6" strokeWidth="1.5" opacity=".7" /><circle cx="13" cy="13" r="12" fill="none" stroke="#B9E3C6" strokeWidth="1" opacity=".35" />
  </svg>
);

/* ---------- Páginas ---------- */
function Inicio({ ir }) {
  const e = EVENTOS[0];
  return (
    <div className="page home">
      <h1 className="h1">Escuchamos<span>el bosque</span>para protegerlo</h1>
      <div className="row">
        <div style={{ display: "flex", alignItems: "flex-end", flexWrap: "wrap" }}>
          <p className="intro">Red de nodos acústicos que detecta detonaciones, calcula su origen y entrega evidencia georreferenciada a las autoridades ambientales.</p>
          <div className="stat"><b>±{e.radio} m</b><small>radio de incertidumbre<br />del último evento</small></div>
        </div>
        <div className="glass ev-card">
          <div className="pill"><i className="dotv" /> Último evento detectado</div>
          <h3 style={{ marginTop: 10 }}>{e.lat.toFixed(4)}, {e.lng.toFixed(4)}</h3>
          <div className="two">
            <div className="box"><small>Fecha</small><span>{e.fecha}</span></div>
            <div className="box"><small>Hora</small><span>{e.hora}</span></div>
          </div>
          <div className="box"><small>Radio de incertidumbre</small><span>±{e.radio} metros</span></div>
          <button className="btnw" style={{ marginTop: 12 }} onClick={() => ir("monitoreo")}>Ver en el mapa</button>
        </div>
      </div>
    </div>
  );
}

function Proyecto() {
  return (
    <div className="page">
      <h2 className="h2">El proyecto</h2>
      <p className="lead">JANIKUA es una aplicación web que funciona como centro de monitoreo de una red de nodos acústicos. Recibe en tiempo real los eventos de detonación, calcula el origen mediante TDOA y lo muestra en un mapa. El objetivo es generar evidencia que apoye a PROAM y PROFEPA, porque ubicar el origen exacto es el principal obstáculo para sancionar su uso.</p>
      <div className="grid">
        <ol className="steps">{PASOS.map(([t, d], i) => <li key={t}><span className="num">{i + 1}</span><div><h3>{t}</h3><p>{d}</p></div></li>)}</ol>
        <div className="glass"><h3 style={{ fontWeight: 400, marginBottom: 8 }}>Tecnologías</h3>
          <dl>{TECNO.map(([k, v]) => [<dt key={k}>{k}</dt>, <dd key={k + "v"}>{v}</dd>])}</dl></div>
      </div>
    </div>
  );
}

function Monitoreo() {
  const [s, setS] = useState(EVENTOS[0]);
  return (
    <div className="page">
      <h2 className="h2">Monitoreo en vivo</h2>
      <p className="lead">Eventos recientes y su origen estimado. Elige uno para verlo en el mapa.</p>
      <div className="grid">
        <div className="glass">
          <svg className="map" viewBox="0 0 400 280" role="img" aria-label="Mapa de ejemplo con nodos y origen estimado">
            <g stroke="rgba(255,255,255,.07)">{[56, 112, 168, 224].map(v => <line key={"h" + v} x1="0" y1={v} x2="400" y2={v} />)}{[80, 160, 240, 320].map(v => <line key={"v" + v} x1={v} y1="0" x2={v} y2="280" />)}</g>
            {NODOS.filter(n => n.ok).map(n => <g key={n.n}><line x1={n.x} y1={n.y} x2={s.mx} y2={s.my} stroke="rgba(185,227,198,.3)" /><circle cx={n.x} cy={n.y} r="6" fill="#10231F" stroke="#B9E3C6" strokeWidth="2" /></g>)}
            <circle cx={s.mx} cy={s.my} r={s.radio * .6} fill="rgba(242,160,75,.2)" stroke="#F2A04B" />
            <circle cx={s.mx} cy={s.my} r="4" fill="#F2A04B" />
          </svg>
          <p style={{ color: "var(--mu)", fontSize: ".8rem", marginTop: 10 }}>Mapa de referencia. Sustituir por Leaflet con datos reales.</p>
        </div>
        <div>
          {EVENTOS.slice(0, 4).map(e => <button key={e.id} className={"evb" + (s.id === e.id ? " on" : "")} onClick={() => setS(e)}>
            <b style={{ fontWeight: 500 }}>{e.fecha} · {e.hora}</b><small>{e.lat.toFixed(4)}, {e.lng.toFixed(4)} — ±{e.radio} m</small></button>)}
        </div>
      </div>
    </div>
  );
}

function Historial() {
  const [q, setQ] = useState("");
  const lista = EVENTOS.filter(e => e.fecha.includes(q));
  const csv = () => {
    const t = "fecha,hora,latitud,longitud,radio_m\n" + lista.map(e => [e.fecha, e.hora, e.lat, e.lng, e.radio].join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([t], { type: "text/csv" }));
    a.download = "janikua_eventos.csv"; a.click();
  };
  return (
    <div className="page">
      <h2 className="h2">Historial de eventos</h2>
      <p className="lead">Consulta y exporta la evidencia registrada. Filtra por fecha, por ejemplo 2026-11.</p>
      <div className="tools">
        <input placeholder="Filtrar por fecha" aria-label="Filtrar por fecha" value={q} onChange={e => setQ(e.target.value)} />
        <button className="btng" onClick={csv}>Descargar CSV</button>
      </div>
      <div className="glass tw"><table><thead><tr><th>Fecha</th><th>Hora</th><th>Latitud</th><th>Longitud</th><th>Radio</th></tr></thead>
        <tbody>{lista.map(e => <tr key={e.id}><td>{e.fecha}</td><td>{e.hora}</td><td>{e.lat}</td><td>{e.lng}</td><td>±{e.radio} m</td></tr>)}
          {!lista.length && <tr><td colSpan="5">No hay eventos con esa fecha. Prueba con otra.</td></tr>}</tbody></table></div>
    </div>
  );
}

function Nodos() {
  return (
    <div className="page">
      <h2 className="h2">Estado de los nodos</h2>
      <p className="lead">Se necesitan al menos 3 nodos en línea para calcular el origen de un evento.</p>
      <div className="cards">{NODOS.map(n => (
        <div className="glass" key={n.n}>
          <div className="pill"><i className={"dotv" + (n.ok ? "" : " off")} /> {n.est}</div>
          <h3 style={{ fontWeight: 400, margin: "8px 0" }}>{n.n}</h3>
          <small style={{ color: "var(--mu)" }}>GPS: {n.gps} · Batería {n.bat}%</small>
          <div className="bar"><i style={{ width: n.bat + "%", background: n.bat < 25 ? "var(--amb)" : undefined }} /></div>
        </div>))}</div>
    </div>
  );
}

function Contacto() {
  const [f, setF] = useState({ n: "", c: "", m: "" });
  const [ok, setOk] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  return (
    <div className="page">
      <h2 className="h2">Contacto</h2>
      <p className="lead">Escríbenos para colaborar, sumar un nodo o resolver dudas.</p>
      <div className="glass" style={{ maxWidth: 520, marginTop: 24 }}>
        <label htmlFor="n" style={{ marginTop: 0 }}>Nombre</label><input id="n" value={f.n} onChange={set("n")} />
        <label htmlFor="c">Correo</label><input id="c" type="email" value={f.c} onChange={set("c")} />
        <label htmlFor="m">Mensaje</label><textarea id="m" value={f.m} onChange={set("m")} />
        <button className="btnw" style={{ marginTop: 18 }} onClick={() => setOk(true)}>Enviar mensaje</button>
        {ok && <div className="ok" role="status">Mensaje enviado. Te responderemos pronto.</div>}
      </div>
    </div>
  );
}

function Acceso() {
  const [e, setE] = useState(false);
  return (
    <div className="page">
      <h2 className="h2">Acceso para autoridades</h2>
      <p className="lead">Ingresa para descargar reportes con evidencia y administrar los nodos.</p>
      <div className="glass" style={{ maxWidth: 420, marginTop: 24 }}>
        <label htmlFor="u" style={{ marginTop: 0 }}>Correo institucional</label><input id="u" type="email" />
        <label htmlFor="p">Contraseña</label><input id="p" type="password" />
        <button className="btnw" style={{ marginTop: 18 }} onClick={() => setE(true)}>Entrar</button>
        {e && <div className="ok" role="status">Pendiente: conectar con el servidor de autenticación.</div>}
      </div>
    </div>
  );
}

/* ---------- App ---------- */
export default function App() {
  const [pag, setPag] = useState("inicio");
  const [abierto, setAbierto] = useState(false);
  const ir = p => { setPag(p); setAbierto(false); window.scrollTo({ top: 0 }); };
  const P = { inicio: <Inicio ir={ir} />, proyecto: <Proyecto />, monitoreo: <Monitoreo />, historial: <Historial />, nodos: <Nodos />, contacto: <Contacto />, acceso: <Acceso /> }[pag];
  return (
    <div className="jk">
      <style>{css}</style>
      <Escena />
      <div className="frame">
        <header className="top">
          <button className="logo" onClick={() => ir("inicio")}><Logo /> JANIKUA</button>
          <button className="burger" onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>Menú</button>
          <nav className={"menu" + (abierto ? " open" : "")} aria-label="Principal">
            {NAV.map(([k, l]) => <button key={k} className={"lk" + (pag === k ? " on" : "")} onClick={() => ir(k)}>{l}</button>)}
            <button className="cta" onClick={() => ir("acceso")}>Acceso autoridades</button>
          </nav>
        </header>
        {P}
        {pag !== "inicio" && <footer className="foot"><span>JANIKUA · Evidencia para PROAM y PROFEPA</span><button onClick={() => ir("contacto")}>Aviso de privacidad</button></footer>}
      </div>
    </div>
  );
}