import { useState, useEffect } from "react";
import { EVENTOS, NODOS } from "../data/datosIniciales";
import { API_URL, WS_URL } from "../config";

export function useDatos() {
  const [eventos, setEv] = useState(EVENTOS);
  const [nodos, setNodos] = useState(NODOS);
  const [live, setLive] = useState(false);
  const [error, setError] = useState(false);
  const cargar = () => {
    if (!API_URL) return;
    setError(false);
    Promise.all([fetch(API_URL + "/eventos"), fetch(API_URL + "/nodos")])
      .then(rs => Promise.all(rs.map(r => { if (!r.ok) throw new Error(); return r.json(); })))
      .then(([e, n]) => { setEv(e); setNodos(n); })
      .catch(() => setError(true));
  };
  useEffect(() => {
    cargar();
    if (!WS_URL) return;
    const ws = new WebSocket(WS_URL);
    ws.onopen = () => setLive(true);
    ws.onclose = () => setLive(false);
    ws.onmessage = m => { try { setEv(p => [JSON.parse(m.data), ...p]); } catch { /* mensaje inválido */ } };
    return () => ws.close();
  }, []);
  /* Solo para probar sin servidor */
  const simular = () => {
    const b = EVENTOS[0], d = () => (Math.random() - .5) * .004, t = new Date();
    setEv(p => [{ id: Date.now(), fecha: t.toISOString().slice(0, 10), hora: t.toTimeString().slice(0, 8),
      lat: +(b.lat + d()).toFixed(4), lng: +(b.lng + d()).toFixed(4), radio: 30 + Math.floor(Math.random() * 40) }, ...p]);
  };
  return { eventos, nodos, live, error, cargar, simular };
}
