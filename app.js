/* Brigada MCI Mosquera · PWA · Fase 1 */
(function () {
  "use strict";
  const API = String((window.BRIGADA_CONFIG || {}).API_URL || "").trim();
  const $app = document.getElementById("app");
  const $toast = document.getElementById("toast");

  /* ---------- utilidades ---------- */
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function toast(m) { $toast.textContent = m; $toast.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => $toast.hidden = true, 2800); }
  const fmtTel = t => String(t || "").replace(/\D/g, "").replace(/^(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3");
  const fechaLarga = iso => { if (!iso) return ""; const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" }); };
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  const ICONS = {
    alert: '<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4"/><path d="M12 17h.01"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 15c3 0 5.5 1.5 5.5 4.5"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
    phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
    clip: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="m9 13 2 2 4-4"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
    check: '<path d="m5 12 5 5 9-10"/>', back: '<path d="M15 5l-7 7 7 7"/>', chev: '<path d="m9 5 7 7-7 7"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', wave: '<path d="M2 12h3l2-6 3 12 3-9 2 3h7"/>',
    fire: '<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-6 1 1 2 2 3 2 0-2 0-4 0-6z"/>',
    heart: '<path d="M12 20s-8-5-8-11a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6-8 11-8 11z"/>',
    exit: '<path d="M14 4h5v16h-5"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
    grad: '<path d="M2 9l10-5 10 5-10 5-10-5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
    child: '<circle cx="12" cy="6" r="3"/><path d="M12 9v7M8 12h8M9 21l3-5 3 5"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    share: '<path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5v10h14V11h-1"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'
  };
  const ic = (n, s = 22, c = "currentColor", w = 2) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ICONS.book}</svg>`;
  const logo = (s, shield = "#0B2D5B", cross = "#FFFFFF", line = "#6FA8FF", rim = "rgba(255,255,255,0.35)") =>
    `<svg width="${s}" height="${Math.round(s * 1.1)}" viewBox="0 0 100 110" role="img" aria-label="Logo Brigada MCI Mosquera"><path d="M50 3 L93 17 V51 C93 78 75 96 50 107 C25 96 7 78 7 51 V17 Z" fill="${shield}"/><path d="M50 10 L86 22 V51 C86 74 71 89 50 99 C29 89 14 74 14 51 V22 Z" fill="none" stroke="${rim}" stroke-width="1.6"/><rect x="42" y="22" width="16" height="62" rx="3" fill="${cross}"/><rect x="24" y="40" width="52" height="16" rx="3" fill="${cross}"/><polyline points="12,66 33,66 39,57 45,78 53,48 59,66 88,66" fill="none" stroke="${line}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const logoOnNavy = s => logo(s, "#FFFFFF", "#0B2D5B", "#1A5DC8", "rgba(11,45,91,0.25)");

  /* ---------- estado ---------- */
  let S = { token: store.get("brig_token"), perfil: store.get("brig_perfil"), data: store.get("brig_data"), rolLogin: "brigadista", equipoSel: null, busy: false };
  const isCoord = () => !!S.perfil && (S.perfil.rol === "coordinador" || S.perfil.rol === "pro");
  const isPro = () => !!S.perfil && S.perfil.rol === "pro";
  const rolTxt = p => p && p.rol === "pro" ? "Coordinador general" : p && p.rol === "coordinador" ? "Coordinador de equipo" : "Brigadista";

  /* ---------- API ---------- */
  async function api(accion, extra) {
    if (!API || /PEGA_AQUI/.test(API)) throw new Error("Falta configurar la dirección de la API en config.js");
    let r;
    try {
      r = await fetch(API, { method: "POST", body: JSON.stringify(Object.assign({ accion, token: S.token }, extra || {})) });
    } catch (e) { throw new Error("Sin conexión. Revisa tu internet e intenta de nuevo."); }
    const j = await r.json().catch(() => ({ ok: false, error: "Respuesta inválida del servidor" }));
    if (!j.ok) {
      if (j.error === "SESION") { salir(true); throw new Error("Tu sesión terminó. Ingresa de nuevo."); }
      throw new Error(j.error || "Ocurrió un error");
    }
    return j;
  }
  async function cargarInicio() {
    try {
      const d = await api("inicio");
      S.data = d; S.perfil = d.perfil; store.set("brig_data", d); store.set("brig_perfil", d.perfil);
      document.body.classList.remove("is-offline");
      return true;
    } catch (e) {
      if (!S.token) return false;
      if (S.data) { document.body.classList.add("is-offline"); return true; }
      toast(e.message); return false;
    }
  }
  function salir(silent) {
    S.token = null; S.perfil = null; S.data = null;
    ["brig_token", "brig_perfil", "brig_data"].forEach(k => store.set(k, null));
    location.hash = "#ingreso"; if (!silent) toast("Sesión cerrada");
  }

  /* ---------- vistas ---------- */
  const offlineBar = () => `<div class="offline" ${document.body.classList.contains("is-offline") ? "" : "hidden"}>Sin conexión · mostrando la última información guardada</div>`;
  const topbar = (t, sub, back = "#inicio", chip = "") => `<header class="top">${back ? `<a class="iconbtn" href="${back}" aria-label="Volver">${ic("back", 22)}</a>` : ""}<div><h1>${esc(t)}</h1>${sub ? `<div class="sub">${esc(sub)}</div>` : ""}</div>${chip ? `<span class="chip">${esc(chip)}</span>` : ""}</header>${offlineBar()}`;
  const cfg = () => (S.data && S.data.config) || { form_incidentes: "https://forms.gle/S5f38mtMyWimzgNP6", tel_rohi: "3336033012", hora_intercesion: "6:00 a.m." };

  function vLogin() {
    const r = S.rolLogin;
    return `<section class="hero">${logo(92)}<div><div class="t1">BRIGADA DE EMERGENCIA</div><div class="t2">MCI MOSQUERA</div></div></section>
    <form class="sheet" id="fLogin" novalidate>
      <div class="f"><span class="lbl">Ingresar como</span>
        <div class="seg" role="group" aria-label="Rol"><button type="button" data-rol="brigadista" aria-pressed="${r === "brigadista"}">Brigadista</button><button type="button" data-rol="coordinador" aria-pressed="${r === "coordinador"}">Coordinador</button></div></div>
      <label class="f"><span class="lbl">Número de celular</span><input class="inp" id="lCel" type="tel" inputmode="numeric" autocomplete="tel" placeholder="310 000 0000" value="${esc(store.get("brig_cel") || "")}" required></label>
      <label class="f"><span class="lbl">PIN</span><input class="inp" id="lPin" type="password" inputmode="numeric" autocomplete="current-password" placeholder="••••" required></label>
      <p class="err" id="lErr" hidden></p>
      <button class="btn primary" id="lBtn" type="submit">${ic("lock", 20)}Ingresar</button>
      <div class="hint" style="justify-content:center">¿Olvidaste tu PIN? Pídelo a tu coordinador de equipo.</div>
    </form>
    <div style="padding:20px 16px 28px;display:flex;flex-direction:column;gap:10px">
      <a class="btn ghost" href="${esc(cfg().form_incidentes)}" target="_blank" rel="noopener">${ic("alert", 20)}Registrar incidente sin ingresar</a>
      <div class="calls"><a class="call red" href="tel:123">${ic("phone", 18)}Línea 123</a><a class="call plain" href="tel:${esc(cfg().tel_rohi)}">${ic("phone", 18)}ROHI</a></div>
    </div>`;
  }

  function tile(icon, t, s, href, badge, soon) {
    return `<a class="tile${soon ? " soon" : ""}" href="${href}" ${soon ? 'aria-disabled="true" tabindex="-1"' : ""}><span class="ico">${ic(icon, 22)}</span><span class="t">${t}</span><span class="s">${s}</span>${badge ? `<span class="badge">${badge}</span>` : ""}</a>`;
  }
  function vInicio() {
    const p = S.perfil || {}, d = S.data || {}, ses = d.sesion;
    const coord = isCoord();
    const reg = d.registroSesion;
    return `<section class="hello"><div class="brandrow">${logo(34)}<div><div class="n">BRIGADA MCI</div><div class="m">MOSQUERA</div></div>
      <button class="iconbtn" id="bSalir" style="margin-left:auto" aria-label="Cerrar sesión">${ic("exit", 20)}</button></div>
      <div><div style="font-size:14px;color:var(--soft-on-navy)">Hola,</div><div class="name">${esc((p.nombre || "").split(" ")[0] || "Brigadista")}</div><div class="role">${rolTxt(p)}${p.equipo && !isPro() ? " · " + esc(p.equipo) : isPro() ? " · Todos los equipos" : " · " + esc(p.equipo || "")}</div></div></section>
    ${offlineBar()}
    <main>
      <a class="sos" href="${esc(cfg().form_incidentes)}" target="_blank" rel="noopener"><span class="ico">${ic("alert", 28)}</span><span><span class="t" style="display:block">Registrar incidente</span><span class="s">Protocolo de atención · formulario</span></span><span style="margin-left:auto">${ic("chev", 22)}</span></a>
      <div class="tiles">
        ${tile("users", "Intercesión", "Sáb y dom · " + esc(cfg().hora_intercesion), "#intercesion")}
        ${tile("book", "Protocolos", "Sismo, ROHI, cursos", "#protocolos")}
        ${coord ? tile("users", "Asistentes", "Quién se registró a la intercesión", "#asistentes", isPro() ? "Todos los equipos" : esc(p.equipo || "Tu equipo")) : ""}
        ${coord ? tile("clip", "Recibo de turno", "Checklist de equipos", "#turno", "Coordinador") : ""}
        ${coord ? tile("cal", "Asistencia", "Servicios y apoyo semanal", "#asistencia", "Coordinador") : ""}
        ${tile("grad", "Capacitaciones", "Próximamente · Fase 3", "#", "", true)}
        ${coord ? tile("chart", "Indicadores", "Próximamente · Fase 3", "#", "Coordinador", true) : ""}
      </div>
      ${ses ? `<a class="card" href="#intercesion" style="text-decoration:none;color:inherit"><div class="row"><span class="lbl">Próxima intercesión</span>${reg ? '<span class="pill ok">Registrado</span>' : '<span class="pill">Google Meet</span>'}</div><div class="big">${esc(cap(fechaLarga(ses.fecha)))} · ${esc(ses.hora)}</div></a>` : ""}
      <div class="calls"><a class="call plain" href="tel:${esc(cfg().tel_rohi)}">${ic("phone", 18)}Llamar ROHI</a><a class="call red" href="tel:123">${ic("phone", 18)}Línea 123</a></div>
      ${isPro() ? `<a class="link" href="#config">${ic("edit", 18)}Configuración de la brigada</a>` : ""}
      <button class="link" id="bInstalar" type="button" ${esStandalone() ? "hidden" : ""}>${ic("download", 18)}Instalar la app en este celular</button>
    </main>`;
  }

  function vIntercesion() {
    const d = S.data || {}, p = S.perfil || {}, ses = d.sesion || {}, reg = d.registroSesion;
    if (reg) return vIntercesionOk();
    const eqs = d.equipos || [], mins = d.ministerios || [];
    const eqSel = S.equipoSel || (eqs.indexOf(p.equipo) >= 0 ? p.equipo : "");
    return `${topbar("Intercesión de brigada", "Sábados y domingos · " + (ses.hora || "6:00 a.m."))}
    <main>
      <div class="card"><div style="display:flex;gap:12px;align-items:center"><span style="width:44px;height:44px;border-radius:12px;background:var(--sky);display:flex;align-items:center;justify-content:center;color:var(--blue)">${ic("video", 22)}</span><div><div class="big" style="font-size:17px">${esc(cap(fechaLarga(ses.fecha)))}</div><div style="font-size:14px;color:var(--muted)">${esc(ses.hora || "")} · Reunión por Google Meet</div></div></div></div>
      <form id="fInter" style="display:flex;flex-direction:column;gap:14px" novalidate>
        <label class="f"><span class="lbl">Nombre del brigadista</span><input class="inp" id="iNom" value="${esc(p.nombre || "")}" autocomplete="name" required></label>
        <label class="f"><span class="lbl">Ministerio al que pertenece</span><select class="inp" id="iMin" required><option value="">Selecciona tu ministerio</option>${mins.map(m => `<option ${store.get("brig_min") === m ? "selected" : ""}>${esc(m)}</option>`).join("")}</select></label>
        <label class="f"><span class="lbl">Líder de célula</span><input class="inp" id="iLid" value="${esc(store.get("brig_lider") || "")}" placeholder="Nombre de tu líder" required></label>
        <div class="f" style="display:flex;flex-direction:column;gap:6px"><span class="lbl">Equipo de brigada</span>
          <div class="teams" role="group" aria-label="Equipo de brigada" style="grid-template-columns:repeat(${Math.min(Math.max(eqs.length, 1), 5)},1fr)">${eqs.map(e => `<button type="button" data-eq="${esc(e)}" aria-pressed="${e === eqSel}" aria-label="${esc(e)}">${esc(e.replace(/^Equipo\s*/i, ""))}</button>`).join("")}</div></div>
        <p class="err" id="iErr" hidden></p>
        <button class="btn primary" id="iBtn" type="submit">${ic("check", 20)}Registrarme y ver el enlace</button>
        <div class="hint">${ic("lock", 16)}El enlace de la reunión aparece después de registrarte.</div>
      </form>
    </main>`;
  }
  function vIntercesionOk() {
    const d = S.data || {}, ses = d.sesion || {}, r = d.registroSesion || {};
    return `${topbar("Intercesión de brigada", "Registro confirmado")}
    <main>
      <div class="done"><span class="ring">${ic("check", 38, "var(--ok)", 2.6)}</span><h2>¡Listo, estás registrado!</h2><div style="color:var(--muted)">${esc(cap(fechaLarga(ses.fecha)))} · ${esc(ses.hora || "")}</div></div>
      <div class="card"><div class="kv"><span>Brigadista</span><b>${esc(r.nombre)}</b></div><div class="kv"><span>Ministerio</span><b>${esc(r.ministerio)}</b></div><div class="kv"><span>Líder de célula</span><b>${esc(r.lider_celula)}</b></div><div class="kv"><span>Equipo</span><b>${esc(r.equipo)}</b></div></div>
      <a class="btn primary" href="${esc(r.meet)}" target="_blank" rel="noopener">${ic("video", 20)}Unirse a la reunión</a>
      <div class="linkbox"><span>${esc(String(r.meet || "").replace(/^https?:\/\//, ""))}</span><button type="button" id="bCopyMeet" aria-label="Copiar enlace">${ic("copy", 18, "var(--blue)")}</button></div>
      <button class="link" id="bCorregir" type="button">${ic("edit", 16)}Corregir mis datos</button>
      <a class="btn ghost" href="#inicio">Volver al inicio</a>
    </main>`;
  }

  const protos = () => (S.data && S.data.protocolos) || [];
  function vProtocolos() {
    const ps = protos(), rohi = ps.find(p => /rohi/i.test(p.titulo)), rest = ps.filter(p => p !== rohi);
    return `${topbar("Protocolos", "Guías rápidas de la brigada")}
    <main style="gap:12px">
      ${rohi ? `<a class="rohi" href="#protocolo/${esc(rohi.id)}"><span class="h">${ic("phone", 22, "var(--ecg)")}${esc(rohi.titulo)}</span><span class="num">${esc(fmtTel(rohi.telefono || cfg().tel_rohi))}</span><span class="s">Toca para ver qué te preguntarán al llamar</span></a>` : ""}
      ${rest.map(p => `<a class="prow" href="#protocolo/${esc(p.id)}"><span class="ico">${ic(p.icono, 22)}</span><span><span class="t" style="display:block">${esc(p.titulo)}</span><span class="s">${esc(p.resumen)}</span></span><span class="go">${ic("chev", 18)}</span></a>`).join("")}
      ${!ps.length ? `<div class="card" style="color:var(--muted)">Aún no hay protocolos. ${isPro() ? "Agrega el primero." : "La coordinación los publicará pronto."}</div>` : ""}
      ${isPro() ? `<a class="link" href="#editar/nuevo">${ic("plus", 18)}Agregar protocolo</a>` : ""}
    </main>`;
  }
  function vProtocolo(id) {
    const p = protos().find(x => x.id === id);
    if (!p) return `${topbar("Protocolo", "", "#protocolos")}<main><div class="card">Este protocolo ya no existe.</div></main>`;
    const pasos = String(p.pasos || "").split("\n").filter(Boolean);
    const fecha = p.actualizado ? new Date(p.actualizado).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : "";
    return `${topbar(p.titulo, "Protocolo" + (isPro() ? " · editable" : ""), "#protocolos")}
    <main style="gap:14px">
      ${p.telefono ? `<a class="btn navy" href="tel:${esc(p.telefono)}">${ic("phone", 20)}Llamar · ${esc(fmtTel(p.telefono))}</a>` : ""}
      <div class="row"><span class="big" style="font-size:19px">${p.telefono ? "Lo que te preguntarán" : "Paso a paso"}</span>${isPro() ? `<a class="edit" href="#editar/${esc(p.id)}">${ic("edit", 16)}Editar</a>` : ""}</div>
      <ol class="steps">${pasos.map((s, i) => `<li><span class="n">${i + 1}</span><span>${esc(s)}</span></li>`).join("")}</ol>
      ${p.nota ? `<div class="note">${esc(p.nota)}</div>` : ""}
      <div class="hint">Última edición: ${esc(p.actualizado_por || "—")}${fecha ? " · " + esc(fecha) : ""}</div>
      <a class="btn ghost" href="${esc(cfg().form_incidentes)}" target="_blank" rel="noopener">${ic("alert", 20)}Registrar la atención en el formulario</a>
    </main>`;
  }
  const ICON_OPTS = [["phone", "Teléfono"], ["wave", "Sismo"], ["fire", "Incendio"], ["heart", "Médica"], ["exit", "Evacuación"], ["child", "Niño"], ["grad", "Cursos"], ["book", "General"], ["alert", "Alerta"]];
  function vEditar(id) {
    if (!isPro()) return vProtocolos();
    const p = id === "nuevo" ? { id: "", titulo: "", icono: "book", resumen: "", telefono: "", pasos: "", nota: "", orden: String(protos().length + 1) } : protos().find(x => x.id === id);
    if (!p) return vProtocolos();
    return `${topbar(id === "nuevo" ? "Nuevo protocolo" : "Editar protocolo", "Solo coordinadores generales", id === "nuevo" ? "#protocolos" : "#protocolo/" + id, "General")}
    <main>
      <form id="fProto" style="display:flex;flex-direction:column;gap:14px" data-id="${esc(p.id)}" novalidate>
        <label class="f"><span class="lbl">Título</span><input class="inp" id="pTit" value="${esc(p.titulo)}" required></label>
        <label class="f"><span class="lbl">Descripción corta</span><input class="inp" id="pRes" value="${esc(p.resumen)}" placeholder="Ej: Agáchate, cúbrete, sujétate"></label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <label class="f"><span class="lbl">Ícono</span><select class="inp" id="pIco">${ICON_OPTS.map(([v, t]) => `<option value="${v}" ${v === p.icono ? "selected" : ""}>${t}</option>`).join("")}</select></label>
          <label class="f"><span class="lbl">Orden</span><input class="inp" id="pOrd" type="number" min="1" value="${esc(p.orden)}"></label>
        </div>
        <label class="f"><span class="lbl">Teléfono (opcional)</span><input class="inp" id="pTel" type="tel" inputmode="numeric" value="${esc(p.telefono)}" placeholder="Muestra un botón para llamar"></label>
        <label class="f"><span class="lbl">Pasos · uno por línea</span><textarea class="inp" id="pPas" rows="9">${esc(p.pasos)}</textarea></label>
        <label class="f"><span class="lbl">Nota importante (opcional)</span><input class="inp" id="pNot" value="${esc(p.nota)}"></label>
        <p class="err" id="pErr" hidden></p>
        <button class="btn primary" id="pBtn" type="submit">${ic("check", 20)}Guardar protocolo</button>
        ${p.id ? `<button class="btn danger" id="pDel" type="button">${ic("trash", 20)}Eliminar protocolo</button>` : ""}
      </form>
    </main>`;
  }

  function vAsistentes() {
    if (!isCoord()) return vInicio();
    const A = S.asis;
    const head = topbar("Asistentes a intercesión", isPro() ? "Todos los equipos" : (S.perfil.equipo || "Tu equipo"), "#inicio", isPro() ? "General" : "Coordinador");
    if (!A) return head + `<main><div class="loading">Cargando registros…</div></main>`;
    const eqs = [...new Set(A.registros.map(r => r.equipo))].sort();
    const f = S.asisEq && eqs.indexOf(S.asisEq) >= 0 ? S.asisEq : "";
    const lista = f ? A.registros.filter(r => r.equipo === f) : A.registros;
    const porEq = {}; A.registros.forEach(r => porEq[r.equipo] = (porEq[r.equipo] || 0) + 1);
    return head + `<main style="gap:14px">
      <label class="f"><span class="lbl">Sesión</span><select class="inp" id="aFecha">${A.fechas.map(x => `<option value="${esc(x)}" ${x === A.fecha ? "selected" : ""}>${esc(cap(fechaLarga(x)))}</option>`).join("")}</select></label>
      ${isPro() && eqs.length > 1 ? `<div style="display:flex;gap:6px;flex-wrap:wrap">${["", ...eqs].map(e => `<button type="button" class="pill" data-aeq="${esc(e)}" style="height:38px;padding:0 14px;border:${e === f ? "0" : "1.5px solid var(--line)"};background:${e === f ? "var(--navy)" : "var(--white)"};color:${e === f ? "var(--white)" : "var(--navy)"};cursor:pointer">${e ? esc(e) + " · " + porEq[e] : "Todos · " + A.registros.length}</button>`).join("")}</div>` : ""}
      <div class="row"><span class="big">${lista.length} ${lista.length === 1 ? "asistente" : "asistentes"}</span>${!isPro() ? `<span class="pill">${esc(S.perfil.equipo || "")}</span>` : ""}</div>
      ${lista.length ? `<div style="display:flex;flex-direction:column;gap:8px">${lista.map(r => `<div class="card" style="gap:4px;padding:12px 14px"><div class="row"><b>${esc(r.nombre)}</b><span class="pill">${esc(r.equipo)}</span></div><div style="font-size:13px;color:var(--muted)">${esc(r.ministerio)} · Líder: ${esc(r.lider_celula)}</div></div>`).join("")}</div>`
        : `<div class="card" style="color:var(--muted)">Nadie ${isPro() ? "" : "de tu equipo "}se ha registrado a esta sesión todavía.</div>`}
      ${!isPro() ? `<div class="hint">${ic("lock", 16)}Como coordinador de equipo solo ves a ${esc(S.perfil.equipo || "tu equipo")}.</div>` : ""}
    </main>`;
  }
  async function cargarAsistentes(fecha) {
    try { S.asis = await api("asistentesIntercesion", { fecha: fecha || "" }); } catch (e) { S.asis = null; toast(e.message); location.hash = "#inicio"; return; }
    if (/^#asistentes/.test(location.hash)) route();
  }

  /* =================== FASE 2 =================== */
  const ROL_TXT = { brigadista: "Brigadista", coordinador: "Coordinador de equipo", pro: "Coordinador general" };
  const hoyLocal = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const fechaCorta = iso => { if (!iso) return ""; const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" }); };
  const $ = sel => document.querySelector(sel);
  const loadingMain = t => `<main><div class="loading">${esc(t || "Cargando…")}</div></main>`;
  const opts = (arr, sel) => arr.map(x => `<option ${x === sel ? "selected" : ""}>${esc(x)}</option>`).join("");

  /* ---------- recibo de turno ---------- */
  function vTurno() {
    if (!isCoord()) return vInicio();
    const T = S.turno;
    const head = topbar("Recibo de turno", "Checklist de revisión", "#inicio", isPro() ? "General" : "Coordinador");
    if (!T) return head + loadingMain("Cargando checklist…");
    const F = S.turnoForm || (S.turnoForm = { equipo: T.equipos.indexOf(S.perfil.equipo) >= 0 ? S.perfil.equipo : T.equipos[0], servicio: T.servicios[0], fecha: T.hoy, entrega: "", items: {}, obs: "" });
    const hechos = T.items.filter(i => F.items[i]).length, malos = T.items.filter(i => F.items[i] && F.items[i] !== "bien").length;
    const segs = it => [["bien", "Bien"], ["revisar", "Revisar"], ["falta", "Falta"]].map(([k, t]) => `<button type="button" class="st st-${k}" data-it="${esc(it)}" data-st="${k}" aria-pressed="${F.items[it] === k}">${t}</button>`).join("");
    return head + `<main style="gap:14px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <label class="f"><span class="lbl">Equipo</span><select class="inp" id="tEq" ${T.equipos.length < 2 ? "disabled" : ""}>${opts(T.equipos, F.equipo)}</select></label>
        <label class="f"><span class="lbl">Fecha</span><input class="inp" id="tFecha" type="date" value="${esc(F.fecha)}"></label>
      </div>
      <label class="f"><span class="lbl">Servicio</span><select class="inp" id="tServ">${opts(T.servicios, F.servicio)}</select></label>
      <label class="f"><span class="lbl">Entrega el turno</span><select class="inp" id="tEnt"><option value="">Nadie · primer turno del día</option>${opts(T.coordinadores, F.entrega)}</select></label>
      <div class="card" style="gap:4px">
        <div class="row"><span class="big">Checklist</span><span class="pill ${hechos === T.items.length ? (malos ? "warn" : "ok") : ""}" id="tCount">${hechos} de ${T.items.length} revisados${malos ? " · " + malos + " con novedad" : ""}</span></div>
        ${T.items.map(it => `<div class="chk"><span class="chk-n">${esc(it)}</span><div class="sts" role="group" aria-label="${esc(it)}">${segs(it)}</div></div>`).join("")}
      </div>
      <label class="f"><span class="lbl">Observaciones${malos ? " · obligatorio" : ""}</span><textarea class="inp" id="tObs" rows="3" style="min-height:90px" placeholder="Ej: botiquín 2 sin gasas, termómetro sin batería">${esc(F.obs)}</textarea></label>
      <div class="hint">Recibe: <b>${esc(S.perfil.nombre)}</b> · la hora se guarda al confirmar</div>
      <p class="err" id="tErr" hidden></p>
      <button class="btn primary" id="tBtn" type="button">${ic("check", 20)}Confirmar recibo de turno</button>
      <div class="row" style="margin-top:8px"><span class="big">Últimos turnos</span>${!isPro() ? `<span class="pill">${esc(S.perfil.equipo || "")}</span>` : ""}</div>
      ${T.recientes.length ? T.recientes.map(t => `<div class="card" style="gap:6px;padding:12px 14px"><div class="row"><b>${esc(cap(fechaCorta(t.fecha)))} · ${esc(t.servicio)}</b>${t.novedades.length ? `<span class="pill warn">${t.novedades.length} novedad${t.novedades.length > 1 ? "es" : ""}</span>` : '<span class="pill ok">Sin novedad</span>'}</div>
        <div style="font-size:13px;color:var(--muted)">${esc(t.equipo)} · Recibió ${esc(t.recibe)}${t.entrega ? " · Entregó " + esc(t.entrega) : ""}</div>
        ${t.novedades.length ? `<div style="display:flex;gap:6px;flex-wrap:wrap">${t.novedades.map(n => `<span class="pill ${n.estado === "falta" ? "bad" : "warn"}">${esc(n.item)}: ${n.estado === "falta" ? "Falta" : "Revisar"}</span>`).join("")}</div>` : ""}
        ${t.observaciones ? `<div style="font-size:14px">${esc(t.observaciones)}</div>` : ""}</div>`).join("") : `<div class="card" style="color:var(--muted)">Aún no hay turnos registrados.</div>`}
    </main>`;
  }
  async function cargarTurno() {
    if (S.turnoLoading) return; S.turnoLoading = true;
    try { S.turno = await api("turnoDatos"); } catch (e) { toast(e.message); location.hash = "#inicio"; return; } finally { S.turnoLoading = false; }
    if (/^#turno/.test(location.hash)) route();
  }
  function bindTurno() {
    if (!S.turno) { cargarTurno(); return; }
    const F = S.turnoForm;
    const sync = () => { F.equipo = $("#tEq").value; F.fecha = $("#tFecha").value; F.servicio = $("#tServ").value; F.entrega = $("#tEnt").value; F.obs = $("#tObs").value; };
    ["#tEq", "#tFecha", "#tServ", "#tEnt"].forEach(id => $(id).addEventListener("change", sync));
    $("#tObs").addEventListener("input", sync);
    $app.querySelectorAll("[data-st]").forEach(b => b.addEventListener("click", () => { sync(); F.items[b.dataset.it] = b.dataset.st; const y = window.scrollY; route(); window.scrollTo(0, y); }));
    $("#tBtn").addEventListener("click", async () => {
      sync(); showErr("tErr", "");
      const falta = S.turno.items.filter(i => !F.items[i]);
      if (falta.length) { showErr("tErr", "Falta revisar: " + falta.join(", ")); return; }
      const b = $("#tBtn"); setBusy(b, true);
      try {
        const r = await api("guardarTurno", { datos: { equipo: F.equipo, fecha: F.fecha, servicio: F.servicio, entrega: F.entrega, items: F.items, observaciones: F.obs } });
        toast(r.novedades ? "Turno recibido con " + r.novedades + " novedad(es)" : "Turno recibido sin novedades");
        S.turnoForm = null; S.turno = null; route();
      } catch (e) { showErr("tErr", e.message); setBusy(b, false); }
    });
  }

  /* ---------- asistencia a servicios ---------- */
  function vAsistencia() {
    if (!isCoord()) return vInicio();
    const A = S.asisSrv;
    const head = topbar("Asistencia", "Servicios y apoyo semanal", "#inicio", isPro() ? "General" : "Coordinador");
    if (!A) return head + loadingMain("Cargando brigadistas…");
    const M = S.asisMarks;
    const pres = A.roster.filter(r => M.pres.has(r.celular)).length;
    const apoyoInfo = c => A.candidatosApoyo.find(x => x.celular === c) || { nombre: c, equipo: "" };
    const libres = A.candidatosApoyo.filter(c => !M.apoyos.has(c.celular));
    return head + `<main style="gap:14px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <label class="f"><span class="lbl">Servicio</span><select class="inp" id="sServ">${opts(A.servicios, A.servicio)}</select></label>
        <label class="f"><span class="lbl">Fecha</span><input class="inp" id="sFecha" type="date" value="${esc(A.fecha)}"></label>
      </div>
      ${A.equipos.length > 1 ? `<div style="display:flex;gap:6px;flex-wrap:wrap">${A.equipos.map(e => `<button type="button" class="chipbtn" data-seq="${esc(e)}" aria-pressed="${e === A.equipo}">${esc(e)}</button>`).join("")}</div>` : ""}
      <div class="row"><span class="big">${esc(A.equipo)}</span><span class="pill ${pres ? "ok" : ""}">${pres} de ${A.roster.length} presentes</span></div>
      ${A.guardado ? `<div class="hint">${ic("check", 16, "var(--ok)")}Ya registrada por ${esc(A.guardado)}. Si guardas, se actualiza.</div>` : ""}
      ${A.roster.length ? `<button class="link" id="sTodos" type="button" style="align-self:flex-start;padding:4px 0">${pres === A.roster.length ? "Desmarcar todos" : "Marcar todos"}</button>
      <div style="display:flex;flex-direction:column;gap:8px">${A.roster.map(r => `<button type="button" class="person" data-pc="${esc(r.celular)}" aria-pressed="${M.pres.has(r.celular)}"><span class="box">${M.pres.has(r.celular) ? ic("check", 16, "#fff", 3) : ""}</span><span>${esc(r.nombre)}</span></button>`).join("")}</div>`
        : `<div class="card" style="color:var(--muted)">No hay brigadistas activos en ${esc(A.equipo)}. ${isPro() ? "Agrégalos en Configuración → Usuarios." : "Pide a un coordinador general que los registre."}</div>`}
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:6px">
        <span class="big">Apoyo semanal</span>
        <span class="hint">Brigadistas de otros equipos que apoyan este servicio.</span>
        ${[...M.apoyos].map(c => { const a = apoyoInfo(c); return `<div class="person" aria-pressed="true" style="cursor:default"><span class="box">${ic("check", 16, "#fff", 3)}</span><span>${esc(a.nombre)} <span style="color:var(--muted);font-weight:400">· ${esc(a.equipo)}</span></span><button type="button" class="x" data-rmap="${esc(c)}" aria-label="Quitar apoyo">✕</button></div>`; }).join("")}
        ${libres.length ? `<div style="display:flex;gap:8px"><select class="inp" id="sApoyo"><option value="">Elegir brigadista de otro equipo</option>${libres.map(c => `<option value="${esc(c.celular)}">${esc(c.nombre)} · ${esc(c.equipo)}</option>`).join("")}</select><button class="iconbtn" id="sAddAp" type="button" aria-label="Agregar apoyo" style="background:var(--blue);width:50px;height:50px">${ic("plus", 20)}</button></div>` : ""}
      </div>
      <p class="err" id="sErr" hidden></p>
      <button class="btn primary" id="sBtn" type="button">${ic("check", 20)}Guardar asistencia</button>
    </main>`;
  }
  async function cargarAsisSrv(q) {
    S.asisLoading = true; S.asisSrv = null; route();
    try { S.asisSrv = await api("asistenciaDatos", { datos: q || {} }); } catch (e) { S.asisLoading = false; toast(e.message); location.hash = "#inicio"; return; }
    S.asisLoading = false;
    S.asisMarks = { pres: new Set(S.asisSrv.presentes), apoyos: new Set(S.asisSrv.apoyos) };
    if (/^#asistencia/.test(location.hash)) route();
  }
  function bindAsistencia() {
    if (!S.asisSrv) { if (!S.asisLoading) cargarAsisSrv(S.asisQ); return; }
    const A = S.asisSrv, M = S.asisMarks;
    const re = () => { const y = window.scrollY; route(); window.scrollTo(0, y); };
    const q = () => ({ servicio: $("#sServ").value, fecha: $("#sFecha").value, equipo: A.equipo });
    $("#sServ").addEventListener("change", () => { S.asisQ = q(); cargarAsisSrv(S.asisQ); });
    $("#sFecha").addEventListener("change", () => { S.asisQ = q(); cargarAsisSrv(S.asisQ); });
    $app.querySelectorAll("[data-seq]").forEach(b => b.addEventListener("click", () => { S.asisQ = Object.assign(q(), { equipo: b.dataset.seq }); cargarAsisSrv(S.asisQ); }));
    $app.querySelectorAll("[data-pc]").forEach(b => b.addEventListener("click", () => { const c = b.dataset.pc; M.pres.has(c) ? M.pres.delete(c) : M.pres.add(c); re(); }));
    const t = $("#sTodos"); if (t) t.addEventListener("click", () => { const all = A.roster.every(r => M.pres.has(r.celular)); A.roster.forEach(r => all ? M.pres.delete(r.celular) : M.pres.add(r.celular)); re(); });
    $app.querySelectorAll("[data-rmap]").forEach(b => b.addEventListener("click", () => { M.apoyos.delete(b.dataset.rmap); re(); }));
    const ad = $("#sAddAp"); if (ad) ad.addEventListener("click", () => { const v = $("#sApoyo").value; if (!v) { toast("Elige un brigadista"); return; } M.apoyos.add(v); re(); });
    $("#sBtn").addEventListener("click", async () => {
      showErr("sErr", ""); const b = $("#sBtn"); setBusy(b, true);
      try {
        const r = await api("guardarAsistencia", { datos: Object.assign(q(), { presentes: [...M.pres], apoyos: [...M.apoyos] }) });
        toast("Asistencia guardada · " + r.presentes + " presentes"); S.asisQ = q(); cargarAsisSrv(S.asisQ);
      } catch (e) { showErr("sErr", e.message); setBusy(b, false); }
    });
  }

  /* ---------- configuración (solo Pro) ---------- */
  const LISTA_TXT = { Ministerios: "Ministerios", Equipos: "Equipos de brigada", Servicios: "Servicios", ChecklistTurno: "Checklist de recibo de turno" };
  function vConfig(sub, arg) {
    if (!isPro()) return vInicio();
    const C = S.cfg;
    if (!C) return topbar("Configuración", "Solo coordinadores generales", "#inicio", "General") + loadingMain();
    if (sub === "usuarios") return vCfgUsuarios();
    if (sub === "usuario") return vCfgUsuario(arg);
    if (sub === "lista") return vCfgLista(arg);
    if (sub === "general") return vCfgGeneral();
    const act = C.usuarios.filter(u => u.activo).length;
    const item = (href, icon, t, s) => `<a class="prow" href="${href}"><span class="ico">${ic(icon, 22)}</span><span><span class="t" style="display:block">${t}</span><span class="s">${s}</span></span><span class="go">${ic("chev", 18)}</span></a>`;
    return topbar("Configuración", "Solo coordinadores generales", "#inicio", "General") + `<main style="gap:12px">
      ${item("#config/usuarios", "users", "Usuarios", act + " activos · roles, equipos y PIN")}
      ${Object.keys(LISTA_TXT).map(k => item("#config/lista/" + k, k === "ChecklistTurno" ? "clip" : k === "Servicios" ? "cal" : k === "Equipos" ? "users" : "book", LISTA_TXT[k], C.listas[k].filter(x => x.activo).length + " activos")).join("")}
      ${item("#config/general", "edit", "Enlaces y datos generales", "Meet, formulario, ROHI, hora de intercesión")}
      <div class="prow" style="opacity:.55"><span class="ico">${ic("edit", 22)}</span><span><span class="t" style="display:block">Apariencia · colores y logo</span><span class="s">Próximamente · Fase 3</span></span></div>
    </main>`;
  }
  function vCfgUsuarios() {
    const C = S.cfg, q = (S.uq || "").toLowerCase(), f = S.uf || "";
    const eqs = C.listas.Equipos.map(e => e.nombre);
    const L = C.usuarios.filter(u => (!f || u.equipo === f) && (!q || (u.nombre + " " + u.celular).toLowerCase().includes(q)));
    return topbar("Usuarios", C.usuarios.length + " registrados", "#config", "General") + `<main style="gap:12px">
      <a class="btn primary" href="#config/usuario/nuevo">${ic("plus", 20)}Agregar usuario</a>
      <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:8px"><input class="inp" id="uQ" type="search" placeholder="Buscar nombre o celular" value="${esc(S.uq || "")}"><select class="inp" id="uF"><option value="">Todos</option>${opts(eqs, f)}</select></div>
      ${L.map(u => `<a class="prow" href="#config/usuario/${esc(u.celular)}" style="${u.activo ? "" : "opacity:.5"}"><span class="ico">${ic(u.rol === "brigadista" ? "user" : "users", 20)}</span><span style="min-width:0"><span class="t" style="display:block">${esc(u.nombre)}</span><span class="s">${esc(u.celular)} · ${esc(u.equipo)}${u.activo ? "" : " · inactivo"}</span></span><span class="pill" style="margin-left:auto">${esc(ROL_TXT[u.rol])}</span></a>`).join("") || `<div class="card" style="color:var(--muted)">No hay usuarios con ese filtro.</div>`}
    </main>`;
  }
  function vCfgUsuario(cel) {
    const C = S.cfg, nuevo = cel === "nuevo";
    const u = nuevo ? { celular: "", nombre: "", rol: "brigadista", equipo: C.listas.Equipos.find(e => e.activo)?.nombre || "", activo: true } : C.usuarios.find(x => x.celular === cel);
    if (!u) return vCfgUsuarios();
    const eqs = C.listas.Equipos.filter(e => e.activo || e.nombre === u.equipo).map(e => e.nombre);
    const yo = u.celular === S.perfil.celular;
    return topbar(nuevo ? "Nuevo usuario" : "Editar usuario", nuevo ? "" : u.nombre, "#config/usuarios", "General") + `<main>
      <form id="fUser" data-original="${esc(u.celular)}" style="display:flex;flex-direction:column;gap:14px" novalidate>
        <label class="f"><span class="lbl">Nombre completo</span><input class="inp" id="uNom" value="${esc(u.nombre)}" required></label>
        <label class="f"><span class="lbl">Celular (con este ingresa)</span><input class="inp" id="uCel" type="tel" inputmode="numeric" value="${esc(u.celular)}" required></label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <label class="f"><span class="lbl">Rol</span><select class="inp" id="uRol" ${yo ? "disabled" : ""}>${Object.keys(ROL_TXT).map(k => `<option value="${k}" ${k === u.rol ? "selected" : ""}>${ROL_TXT[k]}</option>`).join("")}</select></label>
          <label class="f"><span class="lbl">Equipo</span><select class="inp" id="uEq">${opts(eqs, u.equipo)}</select></label>
        </div>
        <label class="f"><span class="lbl">${nuevo ? "PIN (4 a 6 números)" : "Nuevo PIN (déjalo vacío para no cambiarlo)"}</span><input class="inp" id="uPin" type="text" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="${nuevo ? "Ej: 4827" : "••••"}"></label>
        <label class="f"><span class="lbl">Estado</span><select class="inp" id="uAct" ${yo ? "disabled" : ""}><option value="si" ${u.activo ? "selected" : ""}>Activo · puede ingresar</option><option value="no" ${!u.activo ? "selected" : ""}>Inactivo · sin acceso</option></select></label>
        ${yo ? `<div class="hint">${ic("lock", 16)}No puedes cambiar tu propio rol ni desactivarte.</div>` : ""}
        <div class="note">Comparte el PIN con la persona en privado. Si un coordinador de equipo cambia de equipo, verá solo los registros del equipo nuevo.</div>
        <p class="err" id="uErr" hidden></p>
        <button class="btn primary" id="uBtn" type="submit">${ic("check", 20)}${nuevo ? "Crear usuario" : "Guardar cambios"}</button>
      </form>
    </main>`;
  }
  function vCfgLista(n) {
    const C = S.cfg; if (!C.listas[n]) return vConfig();
    const L = S.listaEdit && S.listaEdit.n === n ? S.listaEdit.items : (S.listaEdit = { n, items: C.listas[n].map(x => Object.assign({}, x)) }).items;
    const warn = n === "Equipos" ? "Cambiar el nombre de un equipo no actualiza a los usuarios ni los registros anteriores. Para dejar de usarlo, desactívalo." : "Para dejar de usar un elemento, desactívalo en lugar de borrarlo: así los registros anteriores conservan su nombre.";
    return topbar(LISTA_TXT[n], "Lista editable", "#config", "General") + `<main style="gap:10px">
      <div class="note">${warn}</div>
      ${L.map((x, i) => `<div class="lrow"><input class="inp" data-li="${i}" value="${esc(x.nombre)}" aria-label="Nombre"><button type="button" class="tog" data-lt="${i}" aria-pressed="${x.activo}">${x.activo ? "Activo" : "Inactivo"}</button>${n === "ChecklistTurno" ? `<button type="button" class="x" data-lu="${i}" aria-label="Subir" ${i ? "" : "disabled"}>↑</button>` : ""}<button type="button" class="x" data-ld="${i}" aria-label="Quitar">✕</button></div>`).join("")}
      <button class="link" id="lAdd" type="button" style="align-self:flex-start">${ic("plus", 18)}Agregar</button>
      <p class="err" id="lErr" hidden></p>
      <button class="btn primary" id="lBtn" type="button">${ic("check", 20)}Guardar lista</button>
    </main>`;
  }
  function vCfgGeneral() {
    const G = S.cfg.general;
    const fld = (k, l, ph, type) => `<label class="f"><span class="lbl">${l}</span><input class="inp" data-gk="${k}" type="${type || "text"}" value="${esc(G[k])}" placeholder="${esc(ph || "")}"></label>`;
    return topbar("Enlaces y datos generales", "", "#config", "General") + `<main style="gap:14px">
      ${fld("meet_intercesion", "Enlace de Meet de la intercesión", "https://meet.google.com/…", "url")}
      ${fld("form_incidentes", "Formulario de registro de incidentes", "https://forms.gle/…", "url")}
      ${fld("tel_rohi", "Teléfono ROHI", "3336033012", "tel")}
      ${fld("hora_intercesion", "Hora de la intercesión", "6:00 a.m.")}
      ${fld("nombre_app", "Nombre de la app", "Brigada MCI Mosquera")}
      <p class="err" id="gErr" hidden></p>
      <button class="btn primary" id="gBtn" type="button">${ic("check", 20)}Guardar</button>
    </main>`;
  }
  async function cargarCfg() {
    try { S.cfg = await api("configDatos"); } catch (e) { toast(e.message); location.hash = "#inicio"; return; }
    if (/^#config/.test(location.hash)) route();
  }
  function bindConfig(sub, arg) {
    if (!S.cfg) { if (!S.cfgLoading) { S.cfgLoading = true; cargarCfg().finally(() => S.cfgLoading = false); } return; }
    if (sub === "usuarios") {
      const qi = $("#uQ"); qi.addEventListener("input", () => { S.uq = qi.value; const p = qi.selectionStart; route(); const n = $("#uQ"); n.focus(); n.setSelectionRange(p, p); });
      $("#uF").addEventListener("change", e => { S.uf = e.target.value; route(); });
    }
    if (sub === "usuario") {
      const f = $("#fUser"); if (!f) return;
      f.addEventListener("submit", async e => {
        e.preventDefault(); showErr("uErr", "");
        const datos = { original: f.dataset.original, nombre: $("#uNom").value.trim(), celular: $("#uCel").value.replace(/\D/g, ""), rol: $("#uRol").value, equipo: $("#uEq").value, pin: $("#uPin").value.trim(), activo: $("#uAct").value === "si" };
        if (!datos.nombre || datos.celular.length < 7) { showErr("uErr", "Revisa el nombre y el celular."); return; }
        if (!datos.original && !datos.pin) { showErr("uErr", "Asigna un PIN al nuevo usuario."); return; }
        if (datos.pin && !/^\d{4,6}$/.test(datos.pin)) { showErr("uErr", "El PIN debe tener de 4 a 6 números."); return; }
        const b = $("#uBtn"); setBusy(b, true);
        try { S.cfg = await api("guardarUsuario", { datos }); toast(datos.original ? "Usuario actualizado" : "Usuario creado"); location.hash = "#config/usuarios"; }
        catch (err) { showErr("uErr", err.message); setBusy(b, false); }
      });
    }
    if (sub === "lista") {
      const L = S.listaEdit.items, re = () => { const y = window.scrollY; route(); window.scrollTo(0, y); };
      $app.querySelectorAll("[data-li]").forEach(i => i.addEventListener("input", () => { L[+i.dataset.li].nombre = i.value; }));
      $app.querySelectorAll("[data-lt]").forEach(b => b.addEventListener("click", () => { const x = L[+b.dataset.lt]; x.activo = !x.activo; re(); }));
      $app.querySelectorAll("[data-ld]").forEach(b => b.addEventListener("click", () => { L.splice(+b.dataset.ld, 1); re(); }));
      $app.querySelectorAll("[data-lu]").forEach(b => b.addEventListener("click", () => { const i = +b.dataset.lu; if (i) { [L[i - 1], L[i]] = [L[i], L[i - 1]]; re(); } }));
      $("#lAdd").addEventListener("click", () => { L.push({ nombre: "", activo: true }); re(); const ins = $app.querySelectorAll("[data-li]"); ins[ins.length - 1].focus(); });
      $("#lBtn").addEventListener("click", async () => {
        showErr("lErr", ""); const b = $("#lBtn"); setBusy(b, true);
        try { S.cfg = await api("guardarLista", { datos: { lista: arg, items: L.filter(x => x.nombre.trim()) } }); S.listaEdit = null; cargarInicio(); toast("Lista guardada"); location.hash = "#config"; }
        catch (err) { showErr("lErr", err.message); setBusy(b, false); }
      });
    }
    if (sub === "general") {
      $("#gBtn").addEventListener("click", async () => {
        showErr("gErr", ""); const valores = {}; $app.querySelectorAll("[data-gk]").forEach(i => valores[i.dataset.gk] = i.value.trim());
        const b = $("#gBtn"); setBusy(b, true);
        try { S.cfg = await api("guardarConfig", { datos: { valores } }); await cargarInicio(); toast("Datos guardados"); location.hash = "#config"; }
        catch (err) { showErr("gErr", err.message); setBusy(b, false); }
      });
    }
  }

  /* ---------- instalación (PWA) ---------- */
  let deferred = null;
  const esIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  function esStandalone() { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; }
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; maybeOfferInstall(); });
  window.addEventListener("appinstalled", () => { deferred = null; closeInstall(); toast("App instalada"); });
  function maybeOfferInstall() {
    if (esStandalone() || !S.token || store.get("brig_install_later") > Date.now()) return;
    if (deferred || esIOS()) openInstall();
  }
  function openInstall() {
    if (document.getElementById("installSheet")) return;
    const ios = esIOS() && !deferred;
    const el = document.createElement("div");
    el.className = "overlay"; el.id = "installSheet";
    el.innerHTML = `<div class="install" role="dialog" aria-modal="true" aria-labelledby="insT"><span class="grab"></span>
      <div style="display:flex;gap:14px;align-items:center"><div class="appicon">${logoOnNavy(40)}</div><div><div id="insT" style="font-family:var(--f-disp);font-weight:800;font-size:20px;color:var(--navy)">Instala Brigada MCI</div><div style="font-size:14px;color:var(--muted)">Acceso directo en tu pantalla de inicio, sin tienda de apps.</div></div></div>
      ${ios ? `<div class="ios"><b style="color:var(--navy)">En iPhone (Safari):</b><div style="display:flex;gap:10px;align-items:center">${ic("share", 20, "var(--blue)")}<span>1. Toca <b>Compartir</b> en la barra de Safari</span></div><div style="display:flex;gap:10px;align-items:center">${ic("plus", 20, "var(--blue)")}<span>2. Elige <b>Agregar a inicio</b></span></div></div>`
        : deferred ? `<button class="btn primary" id="insGo" type="button">${ic("download", 20)}Instalar en este celular</button>`
        : `<div class="ios">En Chrome: abre el menú <b>⋮</b> y elige <b>Instalar aplicación</b> o <b>Agregar a pantalla principal</b>.</div>`}
      <button class="link" id="insLater" type="button">Ahora no</button></div>`;
    document.body.appendChild(el);
    el.addEventListener("click", e => { if (e.target === el) later(); });
    const go = el.querySelector("#insGo");
    if (go) go.addEventListener("click", async () => { deferred.prompt(); const r = await deferred.userChoice.catch(() => ({})); deferred = null; closeInstall(); if (r.outcome !== "accepted") later(); });
    el.querySelector("#insLater").addEventListener("click", later);
    function later() { store.set("brig_install_later", Date.now() + 3 * 864e5); closeInstall(); }
  }
  function closeInstall() { const el = document.getElementById("installSheet"); if (el) el.remove(); }

  /* ---------- router ---------- */
  function route() {
    const h = location.hash.replace(/^#/, "") || (S.token ? "inicio" : "ingreso");
    if (!S.token && h !== "ingreso") { location.replace("#ingreso"); return; }
    if (S.token && h === "ingreso") { location.replace("#inicio"); return; }
    const [v, arg] = h.split("/");
    if (v !== "asistentes") { S.asis = null; S.asisEq = ""; S.asisFecha = ""; }
    if (v !== "turno") { S.turno = null; S.turnoForm = null; }
    if (v !== "asistencia") { S.asisSrv = null; S.asisQ = null; }
    if (v !== "config") { S.cfg = null; S.uq = ""; S.uf = ""; }
    if (!(v === "config" && arg === "lista")) S.listaEdit = null;
    let html;
    switch (v) {
      case "ingreso": html = vLogin(); break;
      case "intercesion": html = vIntercesion(); break;
      case "protocolos": html = vProtocolos(); break;
      case "protocolo": html = vProtocolo(arg); break;
      case "editar": html = vEditar(arg); break;
      case "asistentes": html = vAsistentes(); break;
      case "turno": html = vTurno(); break;
      case "asistencia": html = vAsistencia(); break;
      case "config": html = vConfig(arg, h.split("/")[2]); break;
      default: html = vInicio();
    }
    $app.innerHTML = html;
    window.scrollTo(0, 0);
    bind(v, h);
  }
  window.addEventListener("hashchange", route);

  function setBusy(btn, on, txt) { if (!btn) return; btn.disabled = on; if (on) { btn.dataset.t = btn.innerHTML; btn.textContent = txt || "Guardando…"; } else if (btn.dataset.t) btn.innerHTML = btn.dataset.t; }
  function showErr(id, m) { const e = document.getElementById(id); if (e) { e.textContent = m; e.hidden = !m; } }

  function bind(v, h0) {
    if (v === "ingreso") {
      $app.querySelectorAll("[data-rol]").forEach(b => b.addEventListener("click", () => { S.rolLogin = b.dataset.rol; $app.querySelectorAll("[data-rol]").forEach(x => x.setAttribute("aria-pressed", x === b)); }));
      document.getElementById("fLogin").addEventListener("submit", async e => {
        e.preventDefault(); showErr("lErr", "");
        const cel = document.getElementById("lCel").value.replace(/\D/g, ""), pin = document.getElementById("lPin").value.trim();
        if (cel.length < 7 || !pin) { showErr("lErr", "Escribe tu número de celular y tu PIN."); return; }
        const b = document.getElementById("lBtn"); setBusy(b, true, "Verificando…");
        try {
          const r = await api("login", { celular: cel, pin, rol: S.rolLogin });
          S.token = r.token; S.perfil = r.perfil; store.set("brig_token", r.token); store.set("brig_perfil", r.perfil); store.set("brig_cel", cel);
          await cargarInicio(); location.hash = "#inicio"; setTimeout(maybeOfferInstall, 1200);
        } catch (err) { showErr("lErr", err.message); setBusy(b, false); }
      });
    }
    if (v === "inicio" || !v) {
      const s = document.getElementById("bSalir"); if (s) s.addEventListener("click", () => salir());
      const i = document.getElementById("bInstalar"); if (i) i.addEventListener("click", () => { store.set("brig_install_later", null); openInstall(); });
    }
    if (v === "intercesion") {
      $app.querySelectorAll("[data-eq]").forEach(b => b.addEventListener("click", () => { S.equipoSel = b.dataset.eq; $app.querySelectorAll("[data-eq]").forEach(x => x.setAttribute("aria-pressed", x === b)); }));
      const f = document.getElementById("fInter");
      if (f) f.addEventListener("submit", async e => {
        e.preventDefault(); showErr("iErr", "");
        const eqBtn = $app.querySelector('[data-eq][aria-pressed="true"]');
        const datos = { nombre: document.getElementById("iNom").value.trim(), ministerio: document.getElementById("iMin").value, lider_celula: document.getElementById("iLid").value.trim(), equipo: eqBtn ? eqBtn.dataset.eq : "" };
        const falta = !datos.nombre ? "tu nombre" : !datos.ministerio ? "tu ministerio" : !datos.lider_celula ? "tu líder de célula" : !datos.equipo ? "tu equipo de brigada" : "";
        if (falta) { showErr("iErr", "Falta " + falta + "."); return; }
        const b = document.getElementById("iBtn"); setBusy(b, true, "Registrando…");
        try {
          const r = await api("intercesion", { datos });
          store.set("brig_min", datos.ministerio); store.set("brig_lider", datos.lider_celula);
          S.data = Object.assign({}, S.data, { sesion: r.sesion, registroSesion: r.registro }); store.set("brig_data", S.data);
          route(); toast("Registro confirmado");
        } catch (err) { showErr("iErr", err.message); setBusy(b, false); }
      });
      const c = document.getElementById("bCopyMeet");
      if (c) c.addEventListener("click", () => { const m = (S.data.registroSesion || {}).meet; (navigator.clipboard ? navigator.clipboard.writeText(m) : Promise.reject()).then(() => toast("Enlace copiado")).catch(() => toast(m)); });
      const k = document.getElementById("bCorregir");
      if (k) k.addEventListener("click", () => { const r = S.data.registroSesion; S.equipoSel = r.equipo; store.set("brig_min", r.ministerio); store.set("brig_lider", r.lider_celula); S.data = Object.assign({}, S.data, { registroSesion: null }); route(); document.getElementById("iNom").value = r.nombre; });
    }
    if (v === "turno") bindTurno();
    if (v === "asistencia") bindAsistencia();
    if (v === "config") bindConfig(h0.split("/")[1], h0.split("/")[2]);
    if (v === "asistentes") {
      if (!S.asis) { cargarAsistentes(S.asisFecha); return; }
      const sel = document.getElementById("aFecha"); if (sel) sel.addEventListener("change", () => { S.asisFecha = sel.value; S.asis = null; route(); });
      $app.querySelectorAll("[data-aeq]").forEach(b => b.addEventListener("click", () => { S.asisEq = b.dataset.aeq; route(); }));
    }
    if (v === "editar") {
      const f = document.getElementById("fProto"); if (!f) return;
      f.addEventListener("submit", async e => {
        e.preventDefault(); showErr("pErr", "");
        const datos = { id: f.dataset.id, titulo: document.getElementById("pTit").value.trim(), resumen: document.getElementById("pRes").value.trim(), icono: document.getElementById("pIco").value, orden: document.getElementById("pOrd").value, telefono: document.getElementById("pTel").value, pasos: document.getElementById("pPas").value, nota: document.getElementById("pNot").value.trim() };
        if (!datos.titulo) { showErr("pErr", "Escribe un título."); return; }
        const b = document.getElementById("pBtn"); setBusy(b, true);
        try {
          const r = await api("guardarProtocolo", { datos });
          S.data.protocolos = r.protocolos; store.set("brig_data", S.data);
          const nuevo = r.protocolos.find(p => p.titulo === datos.titulo && (!datos.id || p.id === datos.id));
          toast("Protocolo guardado"); location.hash = nuevo ? "#protocolo/" + nuevo.id : "#protocolos";
        } catch (err) { showErr("pErr", err.message); setBusy(b, false); }
      });
      const d = document.getElementById("pDel");
      if (d) d.addEventListener("click", async () => {
        if (!d.dataset.armed) { d.dataset.armed = "1"; d.textContent = "Toca otra vez para eliminar"; setTimeout(() => { if (d.isConnected) { delete d.dataset.armed; d.innerHTML = ic("trash", 20) + "Eliminar protocolo"; } }, 4000); return; }
        setBusy(d, true, "Eliminando…");
        try { const r = await api("eliminarProtocolo", { id: f.dataset.id }); S.data.protocolos = r.protocolos; store.set("brig_data", S.data); toast("Protocolo eliminado"); location.hash = "#protocolos"; }
        catch (err) { showErr("pErr", err.message); setBusy(d, false); }
      });
    }
  }

  /* ---------- arranque ---------- */
  async function start() {
    if (S.token) {
      if (!S.data) $app.innerHTML = `<div class="loading">${logo(60)}<p>Cargando…</p></div>`;
      else route();
      await cargarInicio();
    }
    route();
    if (S.token) setTimeout(maybeOfferInstall, 1500);
  }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && S.token) cargarInicio().then(ok => { if (ok && !/editar|intercesion|turno|asistencia|config/.test(location.hash)) route(); }); });
  if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  start();
})();
