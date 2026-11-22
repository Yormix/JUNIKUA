import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Circle, CircleMarker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { EVENTOS} from "./data/datosIniciales";
import { useDatos } from "./hooks/useDatos";
import { API_URL, WS_URL } from "./config";

/* Si tienes una foto de bosque con niebla, ponla en /public/bosque.jpg y escribe aquí "/bosque.jpg" */
const FOTO_FONDO = "/FondoJanikua.jpg";

/* Conexión al servidor: cuando tengas FastAPI corriendo, pon aquí las direcciones.
   Si están en null, la página muestra los datos de ejemplo. */

/* ---------- Datos de ejemplo (reemplazar por API FastAPI / WebSocket) ---------- */
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
.jk{--tx:#EEF5F1;--mu:rgba(238,245,241,.68);--ln:rgba(255,255,255,.16);--gl:rgba(9,24,20,.5);--mint:#B9E3C6;--amb:#F2A04B;--agua:cubic-bezier(.22,1,.36,1);
  position:relative;min-height:100vh;padding:20px;color:var(--tx);font-family:'Space Grotesk',system-ui,sans-serif;background:#10231F;overflow:hidden}
.jk *{box-sizing:border-box;margin:0}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center bottom}
.frame{position:relative;min-height:calc(100vh - 40px);border:2px solid var(--ln);border-radius:40px;padding:26px 36px 32px;display:flex;flex-direction:column;backdrop-filter:blur(1px)}
.top{display:flex;align-items:center;justify-content:space-between;gap:16px}
.logo{display:flex;align-items:center;gap:10px;background:none;border:0;color:var(--tx);font:500 1.05rem 'Space Grotesk';letter-spacing:.14em;cursor:pointer}
.menu{display:flex;align-items:center;gap:26px}
.menu .lk{background:none;border:0;color:var(--tx);font:400 .9rem 'Space Grotesk';cursor:pointer;padding:6px 0;border-bottom:1px solid transparent;opacity:.85;transition:opacity .5s var(--agua),border-color .5s var(--agua)}
.menu .lk:hover,.menu .lk.on{opacity:1;border-color:var(--mint)}
.cta{background:#fff;color:#10231F;border:0;border-radius:10px;padding:10px 18px;font:500 .9rem 'Space Grotesk';cursor:pointer}
.cta:hover{background:var(--mint)}
.burger{display:none;background:none;border:1px solid var(--ln);color:var(--tx);border-radius:10px;padding:8px 12px;font:inherit;cursor:pointer}
button:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid var(--mint);outline-offset:2px}
.page{flex:1;display:flex;flex-direction:column;padding-top:28px}
.home{justify-content:space-between;gap:28px}
.h1{font-weight:300;font-size:clamp(2.8rem,8.2vw,7rem);line-height:1;letter-spacing:-.03em;margin-top:12px}
.h1 .l{display:block}
.h1 .l:nth-child(2){color:rgba(238,245,241,.5)}
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
.leaflet-container{z-index:0;background:#0b1715;font-family:inherit}
.toast{position:fixed;right:24px;bottom:24px;z-index:1300;display:flex;flex-direction:column;gap:8px;max-width:320px}.toast small{color:var(--mu)}
.warn{background:rgba(242,160,75,.15);color:var(--amb)}
.glow{animation:gl 3s ease-in-out infinite}@keyframes gl{50%{opacity:.55}}

/* NUEVO: movimiento fluido */
@keyframes entra{from{opacity:0;transform:translateY(18px);filter:blur(6px)}}
@keyframes respira{from{transform:scale(1)}to{transform:scale(1.06) translateY(-1%)}}

.bg{animation:respira 28s ease-in-out infinite alternate;transform-origin:center bottom}

.page>*{animation:entra 900ms var(--agua) backwards}
.page>:nth-child(2){animation-delay:100ms}
.page>:nth-child(3){animation-delay:200ms}
.page>:nth-child(4){animation-delay:300ms}
.page>:nth-child(5){animation-delay:400ms}
.page>.h1{animation:none}
.h1 .l{animation:entra 1000ms var(--agua) backwards}
.h1 .l:nth-child(2){animation-delay:120ms}
.h1 .l:nth-child(3){animation-delay:240ms}
.home .row{animation-delay:380ms}

.cta,.btnw,.btng,.evb,.glass,.logo{transition:transform .5s var(--agua),background-color .5s var(--agua),border-color .5s var(--agua),box-shadow .5s var(--agua)}
.cta:hover,.btnw:hover,.btng:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(0,0,0,.25)}
.cta:active,.btnw:active,.btng:active{transform:translateY(1px) scale(.98);transition-duration:.12s}
.evb:hover{transform:translateX(4px);border-color:var(--mint)}
.glass:hover{border-color:rgba(185,227,198,.4)}
.toast{animation:entra 700ms var(--agua) backwards}

@media (prefers-reduced-motion:reduce){
  .glow,.bg,.page>*,.h1 .l,.toast{animation:none!important}
  .cta,.btnw,.btng,.evb,.glass,.logo,.menu .lk{transition:none!important}
}
@media (max-width:860px){
  .jk{padding:10px}.frame{padding:20px;border-radius:28px;min-height:calc(100vh - 20px)}
  .burger{display:block}.menu{display:none;position:absolute;top:70px;left:16px;right:16px;z-index:1200;flex-direction:column;align-items:stretch;gap:6px;background:rgba(9,24,20,.92);border:1px solid var(--ln);border-radius:20px;padding:16px}
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
function Inicio({ ir, eventos }) {
  const e = eventos[0] || EVENTOS[0];
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

function Centrar({ p }) {
  const m = useMap();
  useEffect(() => { m.flyTo(p, 16, { duration: 0.8 }); }, [p[0], p[1]]);
  return null;
}

function Monitoreo({ eventos, nodos, live, error, cargar, simular }) {
  const [id, setId] = useState(null);
  const [cop, setCop] = useState(false);
  const s = eventos.find(e => e.id === id) || eventos[0];
  const on = nodos.filter(n => n.ok);
  const copiar = () => navigator.clipboard?.writeText(`${s.lat}, ${s.lng}`).then(() => { setCop(true); setTimeout(() => setCop(false), 1800); }).catch(() => {});
  return (
    <div className="page">
      <h2 className="h2">Monitoreo en vivo</h2>
      <div className="pill" style={{ marginBottom: 8 }}><i className={"dotv" + (live ? "" : " off")} /> {live ? "Conectado al servidor" : "Mostrando datos de ejemplo"}</div>
      {error && <div className="ok warn" role="alert">No se pudo conectar con el servidor. <button className="btng" onClick={cargar}>Reintentar</button></div>}
      {on.length < 3 && <div className="ok warn" role="alert">Solo hay {on.length} nodos en línea. Se necesitan 3 para calcular el origen.</div>}
      {!s ? <p className="lead" style={{ marginTop: 20 }}>Aún no hay eventos registrados.</p> : (
        <div className="grid">
          <div className="glass">
            <MapContainer center={[s.lat, s.lng]} zoom={16} style={{ height: 380, borderRadius: 16 }} scrollWheelZoom={false}>
              <TileLayer attribution="&copy; OpenStreetMap &copy; CARTO" url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {on.map(n => <Polyline key={"l" + n.n} positions={[[n.lat, n.lng], [s.lat, s.lng]]} pathOptions={{ color: "#B9E3C6", weight: 1, opacity: 0.4 }} />)}
              {on.map(n => <CircleMarker key={n.n} center={[n.lat, n.lng]} radius={7} pathOptions={{ color: "#B9E3C6", fillColor: "#10231F", fillOpacity: 1 }} />)}
              <Circle center={[s.lat, s.lng]} radius={s.radio} pathOptions={{ color: "#F2A04B", fillColor: "#F2A04B", fillOpacity: 0.2 }} />
              <CircleMarker center={[s.lat, s.lng]} radius={5} pathOptions={{ color: "#F2A04B", fillColor: "#F2A04B", fillOpacity: 1 }} />
              <Centrar p={[s.lat, s.lng]} />
            </MapContainer>
            <div className="tools" style={{ marginBottom: 0 }}>
              <button className="btng" onClick={copiar}>{cop ? "Copiado" : "Copiar coordenadas"}</button>
              <button className="btng" onClick={() => window.print()}>Imprimir reporte</button>
              {!API_URL && !WS_URL && <button className="btng" onClick={simular}>Simular evento</button>}
            </div>
          </div>
          <div>
            <div className="glass" style={{ marginBottom: 12 }}>
              <div className="pill">Evento seleccionado</div>
              <h3 style={{ fontWeight: 400, margin: "8px 0" }}>{s.lat}, {s.lng}</h3>
              <small style={{ color: "var(--mu)" }}>{s.fecha} · {s.hora} · ±{s.radio} m</small>
            </div>
            {eventos.slice(0, 5).map(e => <button key={e.id} className={"evb" + (s.id === e.id ? " on" : "")} onClick={() => setId(e.id)}>
              <b style={{ fontWeight: 500 }}>{e.fecha} · {e.hora}</b><small>{e.lat}, {e.lng} — ±{e.radio} m</small></button>)}
          </div>
        </div>)}
    </div>
  );
}

function Historial({ eventos, sesion, ir }) {
  const [lim, setLim] = useState(10);
  const [q, setQ] = useState("");
  const lista = eventos.filter(e => e.fecha.includes(q));
  const porDia = Object.entries(lista.reduce((a, e) => ({ ...a, [e.fecha]: (a[e.fecha] || 0) + 1 }), {})).sort();
  const max = Math.max(1, ...porDia.map(d => d[1]));
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
        {sesion ? <button className="btng" onClick={csv}>Descargar CSV</button> : <button className="btng" onClick={() => ir("acceso")}>Inicia sesión para descargar</button>}
      </div>
      <div className="glass" style={{ marginBottom: 16 }}>
        <div className="pill">Eventos por día</div>
        <svg viewBox="0 0 400 120" style={{ width: "100%", height: "auto" }} role="img" aria-label="Gráfica de eventos por día">
          {porDia.map(([d, n], i) => { const w = 400 / porDia.length, h = (n / max) * 70; return (
            <g key={d}><rect x={i * w + w * .2} y={100 - h} width={w * .6} height={h} rx="4" fill="#B9E3C6" opacity=".85" />
              <text x={i * w + w / 2} y="115" textAnchor="middle" fontSize="9" fill="#EEF5F1">{d.slice(5)}</text>
              <text x={i * w + w / 2} y={94 - h} textAnchor="middle" fontSize="10" fill="#EEF5F1">{n}</text></g>); })}
        </svg>
      </div>
      <div className="glass tw"><table><thead><tr><th>Fecha</th><th>Hora</th><th>Latitud</th><th>Longitud</th><th>Radio</th></tr></thead>
        <tbody>{lista.slice(0, lim).map(e => <tr key={e.id}><td>{e.fecha}</td><td>{e.hora}</td><td>{e.lat}</td><td>{e.lng}</td><td>±{e.radio} m</td></tr>)}
          {!lista.length && <tr><td colSpan="5">No hay eventos con esa fecha. Prueba con otra.</td></tr>}</tbody></table></div>
      {lista.length > lim && <button className="btng" style={{ marginTop: 14, alignSelf: "flex-start" }} onClick={() => setLim(lim + 10)}>Mostrar más</button>}
    </div>
  );
}

function Nodos({ nodos }) {
  const on = nodos.filter(n => n.ok).length;
  return (
    <div className="page">
      <h2 className="h2">Estado de los nodos</h2>
      <p className="lead">Se necesitan al menos 3 nodos en línea para calcular el origen. Ahora hay {on} de {nodos.length} en línea.</p>
      {on < 3 && <div className="ok warn" role="alert">Hay menos de 3 nodos en línea: no se pueden localizar eventos.</div>}
      <div className="cards">{nodos.map(n => (
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
        <button className="btnw" style={{ marginTop: 18 }} onClick={async () => { try { if (API_URL) await fetch(API_URL + "/contacto", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) }); setOk(true); } catch { setOk(false); } }}>Enviar mensaje</button>
        {ok && <div className="ok" role="status">Mensaje enviado. Te responderemos pronto.</div>}
      </div>
    </div>
  );
}

function Acceso({ sesion, entrar, salir }) {
  const [c, setC] = useState("");
  const [p, setP] = useState("");
  const [msg, setMsg] = useState("");
  const [cargando, setCg] = useState(false);
  const enviar = async () => {
    if (!c || !p) { setMsg("Escribe tu correo y contraseña."); return; }
    setCg(true); setMsg("");
    try {
      if (API_URL) {
        const r = await fetch(API_URL + "/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ correo: c, password: p }) });
        if (!r.ok) throw new Error();
        const d = await r.json();
        entrar({ correo: c, token: d.token });
      } else entrar({ correo: c, token: "demo" });
    } catch { setMsg("Correo o contraseña incorrectos, o no hay conexión."); }
    setCg(false);
  };
  if (sesion) return (
    <div className="page"><h2 className="h2">Sesión iniciada</h2>
      <p className="lead">Estás dentro como {sesion.correo}. Ya puedes descargar reportes desde el historial.</p>
      <div className="tools"><button className="btng" onClick={salir}>Cerrar sesión</button></div></div>
  );
  return (
    <div className="page">
      <h2 className="h2">Acceso para autoridades</h2>
      <p className="lead">Ingresa para descargar reportes con evidencia.</p>
      <div className="glass" style={{ maxWidth: 420, marginTop: 24 }}>
        <label htmlFor="u" style={{ marginTop: 0 }}>Correo institucional</label><input id="u" type="email" value={c} onChange={e => setC(e.target.value)} />
        <label htmlFor="p">Contraseña</label><input id="p" type="password" value={p} onChange={e => setP(e.target.value)} />
        <button className="btnw" style={{ marginTop: 18 }} onClick={enviar} disabled={cargando}>{cargando ? "Entrando…" : "Entrar"}</button>
        {msg && <div className="ok warn" role="alert">{msg}</div>}
        {!API_URL && <p style={{ color: "var(--mu)", fontSize: ".8rem", marginTop: 12 }}>Modo demostración: sin servidor, cualquier correo entra.</p>}
      </div>
    </div>
  );
}

function Privacidad() {
  return (
    <div className="page">
      <h2 className="h2">Aviso de privacidad</h2>
      <div className="glass" style={{ maxWidth: 680, marginTop: 20, lineHeight: 1.7, color: "var(--mu)" }}>
        <p>JANIKUA registra eventos acústicos con fecha, hora y coordenadas aproximadas. Estos datos no identifican a personas y se usan para generar evidencia que apoye a las autoridades ambientales.</p>
        <p style={{ marginTop: 12 }}>Los datos que envías en el formulario de contacto (nombre, correo y mensaje) se usan únicamente para responderte.</p>
        <p style={{ marginTop: 12 }}>Borrador: antes de publicar el sitio, este texto debe ser revisado por quien represente legalmente al proyecto.</p>
      </div>
    </div>
  );
}

/* ---------- App ---------- */
export default function App() {
  const leer = () => window.location.hash.slice(1) || "inicio";
  const [pag, setPag] = useState(leer);
  const datos = useDatos();
  const { eventos } = datos;
  const [sesion, setSesion] = useState(() => { try { return JSON.parse(sessionStorage.getItem("jk")); } catch { return null; } });
  const entrar = u => { try { sessionStorage.setItem("jk", JSON.stringify(u)); } catch { /* sin almacenamiento */ } setSesion(u); ir("monitoreo"); };
  const salir = () => { try { sessionStorage.removeItem("jk"); } catch { /* sin almacenamiento */ } setSesion(null); ir("inicio"); };
  const [aviso, setAviso] = useState(null);
  const prev = useRef(eventos[0]?.id);
  useEffect(() => { const id = eventos[0]?.id; if (prev.current !== id) setAviso(eventos[0]); prev.current = id; }, [eventos]);
  useEffect(() => { if (!aviso) return; const t = setTimeout(() => setAviso(null), 9000); return () => clearTimeout(t); }, [aviso]);
  useEffect(() => { const f = () => setPag(leer()); window.addEventListener("hashchange", f); return () => window.removeEventListener("hashchange", f); }, []);
  const [abierto, setAbierto] = useState(false);
  const ir = p => { window.location.hash = p; setAbierto(false); window.scrollTo({ top: 0 }); };
  const P = {
    inicio: <Inicio ir={ir} eventos={eventos} />, proyecto: <Proyecto />,
    monitoreo: <Monitoreo {...datos} />, historial: <Historial eventos={eventos} sesion={sesion} ir={ir} />,
    nodos: <Nodos nodos={datos.nodos} />, contacto: <Contacto />,
    acceso: <Acceso sesion={sesion} entrar={entrar} salir={salir} />, privacidad: <Privacidad />,
  }[pag] || <Inicio ir={ir} eventos={eventos} />;
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
            <button className="cta" onClick={() => (sesion ? salir() : ir("acceso"))}>{sesion ? "Cerrar sesión" : "Acceso autoridades"}</button>
          </nav>
        </header>
        {P}
        {pag !== "inicio" && <footer className="foot"><span>JANIKUA · Evidencia para PROAM y PROFEPA</span><button onClick={() => ir("privacidad")}>Aviso de privacidad</button></footer>}
      </div>
      {aviso && <div className="glass toast" role="alert"><b style={{ fontWeight: 500 }}>Nueva detonación detectada</b>
        <small>{aviso.fecha} {aviso.hora} · ±{aviso.radio} m</small>
        <button className="btng" onClick={() => { setAviso(null); ir("monitoreo"); }}>Ver en el mapa</button></div>}
    </div>
  );
}
