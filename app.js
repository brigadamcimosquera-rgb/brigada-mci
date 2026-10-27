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
    upload: '<path d="M12 15V3M7 8l5-5 5 5M5 21h14"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    gift: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13M12 8c-2-4-6-4-6-1.5S9 8 12 8zm0 0c2-4 6-4 6-1.5S15 8 12 8z"/>',
    box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/><path d="M3 7l9 4 9-4M12 11v10"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'
  };
  const ic = (n, s = 22, c = "currentColor", w = 2) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ICONS.book}</svg>`;
  const logoSvg = (s, shield = "#0B2D5B", cross = "#FFFFFF", line = "#6FA8FF", rim = "rgba(255,255,255,0.35)") =>
    `<svg width="${s}" height="${Math.round(s * 1.1)}" viewBox="0 0 100 110" role="img" aria-label="Logo Brigada MCI Mosquera"><path d="M50 3 L93 17 V51 C93 78 75 96 50 107 C25 96 7 78 7 51 V17 Z" fill="${shield}"/><path d="M50 10 L86 22 V51 C86 74 71 89 50 99 C29 89 14 74 14 51 V22 Z" fill="none" stroke="${rim}" stroke-width="1.6"/><rect x="42" y="22" width="16" height="62" rx="3" fill="${cross}"/><rect x="24" y="40" width="52" height="16" rx="3" fill="${cross}"/><polyline points="12,66 33,66 39,57 45,78 53,48 59,66 88,66" fill="none" stroke="${line}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  let THEME = store.get("brig_theme") || {};
  const imgLogo = s => `<img src="${THEME.logo}" alt="Logo Brigada MCI Mosquera" width="${s}" height="${Math.round(s * 1.1)}" style="object-fit:contain;flex:none">`;
  const logo = (s, ...a) => THEME.logo ? imgLogo(s) : logoSvg(s, ...a);
  const logoOnNavy = s => THEME.logo ? imgLogo(s) : logoSvg(s, "#FFFFFF", "#0B2D5B", "#1A5DC8", "rgba(11,45,91,0.25)");
  function applyTheme(ap) {
    if (ap) { THEME = { principal: ap.color_principal || "", accion: ap.color_accion || "", logo: ap.logo || "" }; store.set("brig_theme", THEME); }
    const st = document.documentElement.style;
    THEME.principal ? st.setProperty("--navy", THEME.principal) : st.removeProperty("--navy");
    THEME.accion ? st.setProperty("--blue", THEME.accion) : st.removeProperty("--blue");
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", THEME.principal || "#0B2D5B");
  }
  applyTheme();

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
      if (j.error === "Acción no válida") throw new Error("La API conectada está desactualizada (URL terminada en …" + API.slice(-14, -5) + "). Revisa config.js o publica una nueva versión.");
      throw new Error(j.error || "Ocurrió un error");
    }
    return j;
  }
  async function cargarInicio() {
    try {
      const d = await api("inicio");
      S.data = d; S.perfil = d.perfil; store.set("brig_data", d); store.set("brig_perfil", d.perfil);
      if (d.apariencia) applyTheme(d.apariencia);
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
      <a class="sos" href="#incidente"><span class="ico">${ic("alert", 28)}</span><span><span class="t" style="display:block">Registrar incidente</span><span class="s">Protocolo de atención · signos vitales</span></span><span style="margin-left:auto">${ic("chev", 22)}</span></a>
      ${cumpleHTML()}
      <div class="tiles">
        ${tile("users", "Intercesión", "Sáb y dom · " + esc(cfg().hora_intercesion), "#intercesion")}
        ${tile("book", "Protocolos", "Sismo, ROHI, cursos", "#protocolos")}
        ${coord ? tile("clip", "Recibo de turno", "Checklist de equipos", "#turno", esc(p.equipo || "Tu equipo")) : ""}
        ${coord ? tile("cal", "Asistencia de turno", "Servicios y apoyo semanal", "#asistencia", esc(p.equipo || "Tu equipo")) : ""}
        ${coord ? tile("box", "Inventario enfermería", "Enfermería 1 y 2", "#inventario", isPro() ? "Gestionar" : "Ajustar") : ""}
        ${coord ? tile("users", "Asistentes intercesión", "Quién se registró a la intercesión", "#asistentes", isPro() ? "Todos los equipos" : esc(p.equipo || "Tu equipo")) : ""}
        ${isPro() ? tile("grad", "Capacitaciones", "Asistencia, notas y evaluaciones", "#cap", "Pro") : ""}
        ${isPro() ? tile("chart", "Indicadores", "Tablero por equipo y periodo", "#indicadores", "Pro") : ""}
        ${isPro() ? tile("download", "Reportes", "Excel y PDF", "#reportes", "Pro") : ""}
        ${isPro() ? tile("gear", "Configuración", "Usuarios, listas, colores y logo", "#config", "Pro") : ""}
      </div>
      ${ses ? `<a class="card" href="#intercesion" style="text-decoration:none;color:inherit"><div class="row"><span class="lbl">Próxima intercesión</span>${reg ? '<span class="pill ok">Registrado</span>' : '<span class="pill">Google Meet</span>'}</div><div class="big">${esc(cap(fechaLarga(ses.fecha)))} · ${esc(ses.hora)}</div></a>` : ""}
      <div class="calls"><a class="call plain" href="tel:${esc(cfg().tel_rohi)}">${ic("phone", 18)}Llamar ROHI</a><a class="call red" href="tel:123">${ic("phone", 18)}Línea 123</a></div>
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
      ${salidaHTML()}
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
      <a class="btn ghost" href="#incidente">${ic("alert", 20)}Registrar la atención</a>
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
    const head = topbar("Asistentes intercesión", isPro() ? "Todos los equipos" : (S.perfil.equipo || "Tu equipo"), "#inicio", isPro() ? "General" : "Coordinador");
    if (!A) return head + `<main><div class="loading">Cargando registros…</div></main>`;
    const eqs = [...new Set(A.registros.map(r => r.equipo))].sort();
    const f = S.asisEq && eqs.indexOf(S.asisEq) >= 0 ? S.asisEq : "";
    const lista = f ? A.registros.filter(r => r.equipo === f) : A.registros;
    const porEq = {}; A.registros.forEach(r => porEq[r.equipo] = (porEq[r.equipo] || 0) + 1);
    return head + `<main style="gap:14px">
      <label class="f"><span class="lbl">Sesión</span><select class="inp" id="aFecha">${A.fechas.map(x => `<option value="${esc(x)}" ${x === A.fecha ? "selected" : ""}>${esc(cap(fechaLarga(x)))}</option>`).join("")}</select></label>
      ${isPro() && eqs.length > 1 ? `<div style="display:flex;gap:6px;flex-wrap:wrap">${["", ...eqs].map(e => `<button type="button" class="pill" data-aeq="${esc(e)}" style="height:38px;padding:0 14px;border:${e === f ? "0" : "1.5px solid var(--line)"};background:${e === f ? "var(--navy)" : "var(--white)"};color:${e === f ? "var(--white)" : "var(--navy)"};cursor:pointer">${e ? esc(e) + " · " + porEq[e] : "Todos · " + A.registros.length}</button>`).join("")}</div>` : ""}
      <div class="row"><span class="big">${lista.length} ${lista.length === 1 ? "asistente" : "asistentes"} · ${lista.filter(r => r.completa).length} completas</span>${!isPro() ? `<span class="pill">${esc(S.perfil.equipo || "")}</span>` : ""}</div>
      ${lista.length ? `<div style="display:flex;flex-direction:column;gap:8px">${lista.map(r => `<div class="card" style="gap:4px;padding:12px 14px"><div class="row"><b>${esc(r.nombre)}</b><span style="display:flex;gap:4px"><span class="pill ${r.completa ? "ok" : "warn"}">${r.completa ? "Completa" : "Solo ingreso"}</span><span class="pill">${esc(r.equipo)}</span></span></div><div style="font-size:13px;color:var(--muted)">${esc(r.ministerio)} · Líder: ${esc(r.lider_celula)}</div></div>`).join("")}</div>`
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
    if (sub === "apariencia") return vApariencia();
    const act = C.usuarios.filter(u => u.activo).length;
    const item = (href, icon, t, s) => `<a class="prow" href="${href}"><span class="ico">${ic(icon, 22)}</span><span><span class="t" style="display:block">${t}</span><span class="s">${s}</span></span><span class="go">${ic("chev", 18)}</span></a>`;
    return topbar("Configuración", "Solo coordinadores generales", "#inicio", "General") + `<main style="gap:12px">
      ${item("#config/usuarios", "users", "Usuarios", act + " activos · roles, equipos y PIN")}
      ${Object.keys(LISTA_TXT).map(k => item("#config/lista/" + k, k === "ChecklistTurno" ? "clip" : k === "Servicios" ? "cal" : k === "Equipos" ? "users" : "book", LISTA_TXT[k], C.listas[k].filter(x => x.activo).length + " activos")).join("")}
      ${item("#config/general", "edit", "Enlaces y datos generales", "Meet, formulario, ROHI, hora de intercesión")}
      ${item("#config/apariencia", "edit", "Apariencia", "Colores y logo de la app")}
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
        <label class="f"><span class="lbl">Fecha de nacimiento (para cumpleaños)</span><input class="inp" id="uNac" type="date" value="${esc(u.nacimiento || "")}"></label>
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
      ${n === "Servicios" ? `<div class="note">Asigna el <b>día</b> a cada reunión. Así, en Asistencia de turno, todas las reuniones de ese día (por ejemplo las 3 del domingo) aparecen juntas para marcarlas de una vez.</div>` : ""}
      ${L.map((x, i) => `<div class="lrow"><input class="inp" data-li="${i}" value="${esc(x.nombre)}" aria-label="Nombre">${n === "Servicios" ? `<select class="inp" data-ldia="${i}" aria-label="Día" style="flex:0 0 112px;padding-right:28px"><option value="">Cualquier día</option>${["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"].map(d => `<option value="${d}" ${x.dia === d ? "selected" : ""}>${cap(d)}</option>`).join("")}</select>` : ""}<button type="button" class="tog" data-lt="${i}" aria-pressed="${x.activo}">${x.activo ? "Activo" : "Inactivo"}</button>${n === "ChecklistTurno" ? `<button type="button" class="x" data-lu="${i}" aria-label="Subir" ${i ? "" : "disabled"}>↑</button>` : ""}<button type="button" class="x" data-ld="${i}" aria-label="Quitar">✕</button></div>`).join("")}
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
      ${fld("tel_rohi", "Teléfono ROHI", "3336033012", "tel")}
      ${fld("hora_intercesion", "Hora de inicio de la intercesión", "6:00 a.m.")}
      ${fld("fin_intercesion", "Hora de fin de la intercesión (para confirmar sesión completa)", "7:00 a.m.")}
      ${fld("correos_cumpleanos", "Correos que reciben el aviso diario de cumpleaños (separados por coma)", "coordinador@gmail.com, otro@gmail.com")}
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
        const datos = { original: f.dataset.original, nombre: $("#uNom").value.trim(), celular: $("#uCel").value.replace(/\D/g, ""), rol: $("#uRol").value, equipo: $("#uEq").value, pin: $("#uPin").value.trim(), activo: $("#uAct").value === "si", nacimiento: $("#uNac").value };
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
      $app.querySelectorAll("[data-ldia]").forEach(i => i.addEventListener("change", () => { L[+i.dataset.ldia].dia = i.value; }));
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
    if (sub === "apariencia") { bindApariencia(); return; }
    if (sub === "general") {
      $("#gBtn").addEventListener("click", async () => {
        showErr("gErr", ""); const valores = {}; $app.querySelectorAll("[data-gk]").forEach(i => valores[i.dataset.gk] = i.value.trim());
        const b = $("#gBtn"); setBusy(b, true);
        try { S.cfg = await api("guardarConfig", { datos: { valores } }); await cargarInicio(); toast("Datos guardados"); location.hash = "#config"; }
        catch (err) { showErr("gErr", err.message); setBusy(b, false); }
      });
    }
  }

  /* =================== FASE 3 (solo coordinadores Pro) =================== */
  const tz0 = n => String(n).padStart(2, "0");
  const ymd = d => d.getFullYear() + "-" + tz0(d.getMonth() + 1) + "-" + tz0(d.getDate());
  function rangoFiltro() {
    const F = S.filtro || (S.filtro = store.get("brig_filtro") || { per: "mes", desde: "", hasta: "", equipo: "" });
    const h = new Date(), hoy = ymd(h);
    if (F.per === "mes") return { desde: ymd(new Date(h.getFullYear(), h.getMonth(), 1)), hasta: hoy, equipo: F.equipo };
    if (F.per === "tri") return { desde: ymd(new Date(h.getFullYear(), h.getMonth() - 2, 1)), hasta: hoy, equipo: F.equipo };
    if (F.per === "anio") return { desde: h.getFullYear() + "-01-01", hasta: hoy, equipo: F.equipo };
    return { desde: F.desde || "", hasta: F.hasta || hoy, equipo: F.equipo };
  }
  function filtroHTML(conPeriodo) {
    const F = S.filtro || (rangoFiltro(), S.filtro), eqs = (S.data && S.data.equipos) || [];
    const pers = [["mes", "Este mes"], ["tri", "Trimestre"], ["anio", "Año"], ["custom", "Fechas"]];
    return `<div class="filtros noprint">
      ${conPeriodo === false ? "" : `<div style="display:flex;gap:6px;flex-wrap:wrap">${pers.map(([k, t]) => `<button type="button" class="chipbtn" data-per="${k}" aria-pressed="${F.per === k}">${t}</button>`).join("")}</div>
      ${F.per === "custom" ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><label class="f"><span class="lbl">Desde</span><input class="inp" type="date" id="fDesde" value="${esc(F.desde)}"></label><label class="f"><span class="lbl">Hasta</span><input class="inp" type="date" id="fHasta" value="${esc(F.hasta)}"></label></div>` : ""}`}
      <label class="f"><span class="lbl">Equipo</span><select class="inp" id="fEq"><option value="">Todos los equipos</option>${eqs.map(e => `<option ${e === F.equipo ? "selected" : ""}>${esc(e)}</option>`).join("")}</select></label>
    </div>`;
  }
  function bindFiltro(recargar) {
    const F = S.filtro, save = () => { store.set("brig_filtro", F); recargar(); };
    $app.querySelectorAll("[data-per]").forEach(b => b.addEventListener("click", () => { F.per = b.dataset.per; save(); }));
    const d = $("#fDesde"), h = $("#fHasta"), e = $("#fEq");
    if (d) d.addEventListener("change", () => { F.desde = d.value; save(); });
    if (h) h.addEventListener("change", () => { F.hasta = h.value; save(); });
    if (e) e.addEventListener("change", () => { F.equipo = e.value; save(); });
  }
  const periodoTxt = r => (r.desde ? fechaCorta(r.desde) : "Inicio") + " – " + (r.hasta ? fechaCorta(r.hasta) : "hoy") + " · " + (r.equipo || "Todos los equipos");

  /* ---------- gráficas (una sola serie, color de acción) ---------- */
  function vbars(data, unit) {
    if (!data.length) return `<div class="hint">Sin datos en este periodo.</div>`;
    const max = Math.max(1, ...data.map(d => d.v));
    return `<div class="vbars" role="img" aria-label="${esc(data.map(d => d.l + ": " + d.v + (unit || "")).join(", "))}">${data.map(d => `<div class="vb" title="${esc(d.l)}: ${d.v}${unit || ""}"><span class="vv">${d.v}${unit || ""}</span><span class="vbar" style="height:${Math.max(2, Math.round(d.v / max * 120))}px"></span><span class="vl">${esc(d.l)}</span></div>`).join("")}</div>`;
  }
  function hbars(data, extra) {
    if (!data.length) return `<div class="hint">Sin datos en este periodo.</div>`;
    const max = Math.max(1, ...data.map(d => d.v));
    return `<div style="display:flex;flex-direction:column;gap:10px">${data.map(d => `<div title="${esc(d.l)}: ${d.v}"><div class="row" style="font-size:14px"><span style="font-weight:600">${esc(d.l)}</span><b style="font-variant-numeric:tabular-nums">${d.v}${extra && d.x ? ` <span style="color:var(--muted);font-weight:400">${esc(d.x)}</span>` : ""}</b></div><div class="hb"><span style="width:${Math.round(d.v / max * 100)}%"></span></div></div>`).join("")}</div>`;
  }
  const kpi = (v, l, s) => `<div class="kpi"><span class="kv">${v}</span><span class="kl">${l}</span>${s ? `<span class="ks">${s}</span>` : ""}</div>`;

  /* ---------- indicadores ---------- */
  function vIndicadores() {
    if (!isPro()) return vInicio();
    const I = S.ind, r = rangoFiltro();
    const head = topbar("Indicadores", periodoTxt(r), "#inicio", "General");
    if (!I) return head + `<main style="gap:14px">${filtroHTML()}<div class="loading">Calculando…</div></main>`;
    const sv = I.servicios, it = I.intercesion, inc = I.incidentes, tu = I.turnos, ca = I.capacitacion;
    return head + `<main style="gap:14px">${filtroHTML()}
      <div class="kpis">
        ${kpi(sv.participacion + "%", "Participación en servicios", sv.presentes + " de " + sv.registros + " en lista")}
        ${kpi(it.promedio, "Promedio en intercesión", it.registros + " registros · " + (it.completas || 0) + " completas")}
        ${kpi(inc.total, "Incidentes registrados", (inc.conAlerta || 0) + " con alerta · " + (inc.rohi || 0) + " con ROHI")}
        ${kpi(tu.conNovedad + "/" + tu.total, "Turnos con novedad", "Recibidos en el periodo")}
        ${kpi(ca.pctCapacitados + "%", "Brigadistas capacitados", ca.realizadas + " capacitaciones")}
        ${kpi(ca.promedio == null ? "—" : ca.promedio, "Nota promedio", ca.asistencias + " asistencias")}
      </div>
      ${!r.equipo ? `<div class="card"><span class="big" style="font-size:17px">Participación por equipo</span><span class="hint">% de asistencia sobre las listas tomadas</span>${vbars(sv.porEquipo.filter(e => e.registros).map(e => ({ l: e.equipo.replace(/^Equipo\s*/i, "Eq "), v: e.pct })), "%")}</div>` : ""}
      <div class="card"><span class="big" style="font-size:17px">Asistencia a intercesión</span><span class="hint">Últimas sesiones del periodo</span>${vbars(it.ultimas.map(s => ({ l: fechaCorta(s.fecha).replace(/\.$/, ""), v: s.total })))}</div>
      <div class="card"><span class="big" style="font-size:17px">Motivos de inasistencia</span><span class="hint">Faltas en servicios del periodo</span>${hbars((I.motivos || []).map(x => ({ l: x.nombre, v: x.total })))}</div>
      <div class="card"><span class="big" style="font-size:17px">Lo que más llega mal al recibir turno</span><span class="hint">Veces marcado Revisar o Falta</span>${hbars(tu.ranking.map(x => ({ l: x.item, v: x.total, x: "(" + x.falta + " falta)" })), true)}</div>
      <div class="card"><span class="big" style="font-size:17px">Quiénes registran incidentes</span><span class="hint">Brigadista que registró la atención</span>${hbars(inc.registradores.map(x => ({ l: x.nombre, v: x.total })))}</div>
      <a class="btn ghost" href="#reportes">${ic("download", 20)}Ver y descargar reportes</a>
    </main>`;
  }
  async function cargarInd() {
    if (S.indLoading) return; S.indLoading = true;
    try { S.ind = await api("indicadores", { datos: rangoFiltro() }); } catch (e) { toast(e.message); } finally { S.indLoading = false; }
    if (/^#indicadores/.test(location.hash)) route();
  }
  function bindIndicadores() { bindFiltro(() => { S.ind = null; route(); }); if (!S.ind) cargarInd(); }

  /* ---------- reportes ---------- */
  const REPORTES = [["participacion", "cal", "Participación en servicios", "Por brigadista y por equipo, con apoyos"], ["intercesion", "users", "Intercesiones", "Por sesión, ministerio y equipo"], ["incidentes", "alert", "Registro de incidentes", "Quién registra, cuántos y por equipo"], ["turnos", "clip", "Novedades al recibir turno", "Elementos que más llegan mal"], ["capacitaciones", "grad", "Capacitaciones", "Asistencia, notas y aprobados"]];
  function vReportes() {
    if (!isPro()) return vInicio();
    const r = rangoFiltro(), R = S.rep;
    if (R && R.tipo) {
      const head = topbar(REPORTES.find(x => x[0] === R.tipo)[2], periodoTxt(r), "#reportes", "General");
      if (!R.data) return head + `<main>${filtroHTML()}<div class="loading">Generando reporte…</div></main>`;
      const D = R.data;
      return head + `<main style="gap:14px">${filtroHTML()}
        <div class="noprint" style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><button class="btn primary" id="rXls" type="button">${ic("download", 20)}Excel</button><button class="btn ghost" id="rPdf" type="button">${ic("download", 20)}PDF</button></div>
        <div class="printhead"><b>${esc(D.titulo)}</b> · ${esc(D.periodo)} · Brigada MCI Mosquera</div>
        ${D.nota ? `<div class="note">${esc(D.nota)}</div>` : ""}
        ${D.hojas.map(h => `<section class="rep"><div class="row"><span class="big" style="font-size:17px">${esc(h.nombre)}</span><span class="pill">${h.filas.length} filas</span></div>
          ${h.filas.length ? `<div class="tablewrap"><table><thead><tr>${h.columnas.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${h.filas.map(f => `<tr>${f.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : `<div class="hint">Sin datos en este periodo.</div>`}</section>`).join("")}
      </main>`;
    }
    return topbar("Reportes", periodoTxt(r), "#inicio", "General") + `<main style="gap:12px">${filtroHTML()}
      ${REPORTES.map(([k, i, t, s]) => `<button type="button" class="prow" data-rep="${k}" style="width:100%;text-align:left;cursor:pointer"><span class="ico">${ic(i, 22)}</span><span><span class="t" style="display:block">${t}</span><span class="s">${s}</span></span><span class="go">${ic("chev", 18)}</span></button>`).join("")}
    </main>`;
  }
  async function cargarRep() {
    const t = S.rep.tipo;
    try { const d = await api("reporte", { datos: Object.assign({ tipo: t }, rangoFiltro()) }); if (S.rep && S.rep.tipo === t) S.rep.data = d; } catch (e) { toast(e.message); S.rep = null; }
    if (/^#reportes/.test(location.hash)) route();
  }
  function loadScript(src) { return new Promise((res, rej) => { if (document.querySelector(`script[src="${src}"]`)) return res(); const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("No se pudo cargar la herramienta de Excel. Revisa tu conexión.")); document.head.appendChild(s); }); }
  const XLSX_SRC = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
  function bindReportes() {
    bindFiltro(() => { if (S.rep) S.rep.data = null; route(); });
    $app.querySelectorAll("[data-rep]").forEach(b => b.addEventListener("click", () => { S.rep = { tipo: b.dataset.rep, data: null }; route(); }));
    if (S.rep && S.rep.tipo && !S.rep.data) { cargarRep(); return; }
    const x = $("#rXls"); if (x) x.addEventListener("click", async () => {
      setBusy(x, true, "Preparando…");
      try {
        await loadScript(XLSX_SRC); const D = S.rep.data, wb = XLSX.utils.book_new();
        D.hojas.forEach(h => { const ws = XLSX.utils.aoa_to_sheet([h.columnas].concat(h.filas)); ws["!cols"] = h.columnas.map(c => ({ wch: Math.max(12, Math.min(40, String(c).length + 4)) })); XLSX.utils.book_append_sheet(wb, ws, h.nombre.slice(0, 31)); });
        const r = rangoFiltro(); XLSX.writeFile(wb, ("Brigada MCI - " + D.titulo + " - " + (r.desde || "inicio") + " a " + r.hasta + (r.equipo ? " - " + r.equipo : "") + ".xlsx").replace(/[\\/:*?"<>|]/g, "-"));
      } catch (e) { toast(e.message); }
      setBusy(x, false);
    });
    const p = $("#rPdf"); if (p) p.addEventListener("click", () => { toast("Elige \"Guardar como PDF\" en la ventana de impresión"); setTimeout(() => window.print(), 400); });
  }

  /* ---------- capacitaciones ---------- */
  function vCap(sub, arg) {
    if (!isPro()) return vInicio();
    if (sub === "nueva" || sub === "editar") return vCapForm(sub === "nueva" ? null : arg);
    if (sub) return vCapDetalle(sub);
    const C = S.capL, F = S.filtro || (rangoFiltro(), S.filtro);
    const head = topbar("Capacitaciones", F.equipo || "Todos los equipos", "#inicio", "General");
    if (!C) return head + `<main style="gap:14px">${filtroHTML(false)}<div class="loading">Cargando…</div></main>`;
    const tab = S.capTab || "prox", hoy = C.hoy;
    const L = C.capacitaciones.filter(c => tab === "prox" ? c.fecha >= hoy : c.fecha < hoy);
    if (tab === "prox") L.reverse();
    return head + `<main style="gap:12px">${filtroHTML(false)}
      <div class="seg" role="group"><button type="button" data-ctab="prox" aria-pressed="${tab === "prox"}">Próximas</button><button type="button" data-ctab="hechas" aria-pressed="${tab === "hechas"}">Realizadas</button></div>
      <a class="btn primary" href="#cap/nueva">${ic("plus", 20)}Nueva capacitación</a>
      ${L.map(c => { const s = c.resumen; return `<a class="card" href="#cap/${esc(c.id)}" style="text-decoration:none;color:inherit;gap:8px">
        <div class="row"><span class="big" style="font-size:17px">${esc(c.tema)}</span>${c.fecha >= hoy ? '<span class="pill">Próxima</span>' : '<span class="pill ok">Realizada</span>'}</div>
        <div class="hint" style="flex-wrap:wrap">${ic("cal", 16)}${esc(cap(fechaCorta(c.fecha)))}${c.hora ? " · " + esc(c.hora) : ""}${c.instructor ? " · Instructor: " + esc(c.instructor) : ""}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap"><span class="pill">${c.equipos ? esc(c.equipos.join(", ")) : "Todos los equipos"}</span><span class="pill">${s.asistentes} de ${s.convocados} asistieron</span>${s.promedio != null ? `<span class="pill ok">Nota ${s.promedio}</span>` : ""}${c.archivos.length ? `<span class="pill">${c.archivos.length} evaluación(es)</span>` : ""}</div></a>`; }).join("") || `<div class="card" style="color:var(--muted)">${tab === "prox" ? "No hay capacitaciones programadas." : "Aún no hay capacitaciones realizadas."}</div>`}
    </main>`;
  }
  function vCapForm(id) {
    const eqs = (S.data && S.data.equipos) || [];
    const c = id ? (S.capL && S.capL.capacitaciones.find(x => x.id === id)) || (S.capD && S.capD.capacitacion) : { tema: "", fecha: hoyLocal(), hora: "8:00 a.m.", lugar: "", instructor: "", equipos: null, nota_minima: "3.5" };
    if (!c) { location.hash = "#cap"; return ""; }
    const sel = S.capEqSel || (S.capEqSel = new Set(c.equipos || eqs));
    return topbar(id ? "Editar capacitación" : "Nueva capacitación", "", id ? "#cap/" + id : "#cap", "General") + `<main>
      <form id="fCap" data-id="${esc(id || "")}" style="display:flex;flex-direction:column;gap:14px" novalidate>
        <label class="f"><span class="lbl">Tema</span><input class="inp" id="cTema" value="${esc(c.tema)}" placeholder="Ej: Primeros auxilios básicos" required></label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><label class="f"><span class="lbl">Fecha</span><input class="inp" id="cFecha" type="date" value="${esc(c.fecha)}"></label><label class="f"><span class="lbl">Hora</span><input class="inp" id="cHora" value="${esc(c.hora)}"></label></div>
        <label class="f"><span class="lbl">Lugar</span><input class="inp" id="cLugar" value="${esc(c.lugar)}" placeholder="Ej: Salón 2"></label>
        <label class="f"><span class="lbl">Instructor</span><input class="inp" id="cInst" value="${esc(c.instructor)}"></label>
        <div class="f" style="display:flex;flex-direction:column;gap:6px"><span class="lbl">Equipos convocados</span><div style="display:flex;gap:6px;flex-wrap:wrap">${eqs.map(e => `<button type="button" class="chipbtn" data-ceq="${esc(e)}" aria-pressed="${sel.has(e)}">${esc(e)}</button>`).join("")}</div></div>
        <label class="f"><span class="lbl">Nota mínima para aprobar (0 a 5)</span><input class="inp" id="cMin" inputmode="decimal" value="${esc(c.nota_minima)}"></label>
        <p class="err" id="cErr" hidden></p>
        <button class="btn primary" id="cBtn" type="submit">${ic("check", 20)}Guardar capacitación</button>
        ${id ? `<button class="btn danger" id="cDel" type="button">${ic("trash", 20)}Eliminar capacitación</button>` : ""}
      </form></main>`;
  }
  function vCapDetalle(id) {
    const D = S.capD;
    const head = topbar(D ? D.capacitacion.tema : "Capacitación", D ? cap(fechaCorta(D.capacitacion.fecha)) : "", "#cap", "General");
    if (!D || D.capacitacion.id !== id) return head + loadingMain();
    const c = D.capacitacion, M = S.capMarks, f = S.capFiltro || "";
    const min = Number(String(c.nota_minima).replace(",", ".")) || 0;
    const L = D.roster.filter(r => !f || r.equipo === f);
    const asis = D.roster.filter(r => M[r.celular].asistio).length;
    const eqs = [...new Set(D.roster.map(r => r.equipo))].sort();
    return head + `<main style="gap:14px">
      <div class="card" style="gap:8px">
        <div class="kv"><span>Fecha</span><b>${esc(cap(fechaCorta(c.fecha)))}${c.hora ? " · " + esc(c.hora) : ""}</b></div>
        ${c.lugar ? `<div class="kv"><span>Lugar</span><b>${esc(c.lugar)}</b></div>` : ""}${c.instructor ? `<div class="kv"><span>Instructor</span><b>${esc(c.instructor)}</b></div>` : ""}
        <div class="kv"><span>Convocados</span><b>${c.equipos ? esc(c.equipos.join(", ")) : "Todos los equipos"}</b></div>
        <div class="kv"><span>Nota mínima</span><b>${esc(c.nota_minima)} / 5</b></div>
        <a class="link" href="#cap/editar/${esc(c.id)}" style="align-self:flex-start;padding:4px 0">${ic("edit", 16)}Editar datos</a>
      </div>
      <div class="row"><span class="big">Asistencia y notas</span><span class="pill ${asis ? "ok" : ""}">${asis} de ${D.roster.length} asistieron</span></div>
      ${eqs.length > 1 ? `<div style="display:flex;gap:6px;flex-wrap:wrap">${["", ...eqs].map(e => `<button type="button" class="chipbtn" data-cf="${esc(e)}" aria-pressed="${e === f}">${e ? esc(e) : "Todos"}</button>`).join("")}</div>` : ""}
      <button class="link" id="cTodos" type="button" style="align-self:flex-start;padding:4px 0">Marcar ${f ? "a todos de " + esc(f) : "a todos"} como presentes</button>
      <div style="display:flex;flex-direction:column;gap:8px">${L.map(r => { const m = M[r.celular], n = Number(String(m.nota).replace(",", ".")), tiene = String(m.nota).trim() !== "";
        return `<div class="caprow${m.asistio ? " on" : ""}"><button type="button" class="box" data-ca="${esc(r.celular)}" aria-pressed="${m.asistio}" aria-label="Asistió ${esc(r.nombre)}">${m.asistio ? ic("check", 16, "#fff", 3) : ""}</button>
          <span style="min-width:0;flex:1"><b style="display:block">${esc(r.nombre)}</b><span style="font-size:12px;color:var(--muted)">${esc(r.equipo)}${tiene && m.asistio ? (n >= min ? ' · <span style="color:var(--ok);font-weight:700">Aprobó</span>' : ' · <span style="color:var(--red);font-weight:700">No aprobó</span>') : ""}</span></span>
          <input class="inp nota" data-cn="${esc(r.celular)}" inputmode="decimal" placeholder="Nota" value="${esc(m.nota)}" aria-label="Nota de ${esc(r.nombre)}"></div>`; }).join("")}</div>
      <div class="card" style="gap:10px;border:1.5px dashed var(--blue)">
        <span class="big" style="font-size:17px">Evaluaciones</span>
        <span class="hint">Sube las evaluaciones en PDF, foto o Excel (máx. 8 MB). Quedan guardadas en Google Drive, en la carpeta "Brigada MCI - Evaluaciones".</span>
        ${c.archivos.map(a => `<a class="linkbox" href="${esc(a.url)}" target="_blank" rel="noopener" style="text-decoration:none">${ic("book", 18, "var(--blue)")}<span style="flex:1">${esc(a.nombre)}</span><span style="font-size:12px;color:var(--muted);font-weight:400">${esc(a.fecha)}</span></a>`).join("")}
        <label class="btn ghost" style="cursor:pointer">${ic("upload", 20)}Subir evaluación<input type="file" id="cFile" accept=".pdf,image/*,.xlsx,.xls,.csv,.doc,.docx" hidden></label>
        <label class="btn ghost" style="cursor:pointer">${ic("upload", 20)}Llenar notas desde Excel<input type="file" id="cXls" accept=".xlsx,.xls,.csv" hidden></label>
        <span class="hint" style="display:block">Para llenar notas, el Excel debe tener una columna <b>celular</b> (o <b>nombre</b>) y otra <b>nota</b>.</span>
      </div>
      <p class="err" id="cdErr" hidden></p>
      <button class="btn primary" id="cdBtn" type="button">${ic("check", 20)}Guardar asistencia y notas</button>
    </main>`;
  }
  async function cargarCapL() {
    if (S.capLoading) return; S.capLoading = true;
    try { S.capL = await api("capLista", { datos: { equipo: (S.filtro || {}).equipo || "" } }); } catch (e) { toast(e.message); } finally { S.capLoading = false; }
    if (/^#cap/.test(location.hash)) route();
  }
  async function cargarCapD(id) {
    if (S.capLoading) return; S.capLoading = true;
    try { S.capD = await api("capDetalle", { datos: { id } }); S.capMarks = {}; S.capD.roster.forEach(r => S.capMarks[r.celular] = { asistio: r.asistio, nota: r.nota }); }
    catch (e) { toast(e.message); location.hash = "#cap"; } finally { S.capLoading = false; }
    if (/^#cap/.test(location.hash)) route();
  }
  const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  function bindCap(sub, arg) {
    const re = () => { const y = window.scrollY; route(); window.scrollTo(0, y); };
    if (!sub) {
      bindFiltro(() => { S.capL = null; route(); });
      $app.querySelectorAll("[data-ctab]").forEach(b => b.addEventListener("click", () => { S.capTab = b.dataset.ctab; route(); }));
      if (!S.capL) cargarCapL();
      return;
    }
    if (sub === "nueva" || sub === "editar") {
      const f = $("#fCap"); if (!f) return;
      $app.querySelectorAll("[data-ceq]").forEach(b => b.addEventListener("click", () => { const s = S.capEqSel; s.has(b.dataset.ceq) ? s.delete(b.dataset.ceq) : s.add(b.dataset.ceq); b.setAttribute("aria-pressed", s.has(b.dataset.ceq)); }));
      f.addEventListener("submit", async e => {
        e.preventDefault(); showErr("cErr", "");
        const datos = { id: f.dataset.id, tema: $("#cTema").value.trim(), fecha: $("#cFecha").value, hora: $("#cHora").value.trim(), lugar: $("#cLugar").value.trim(), instructor: $("#cInst").value.trim(), equipos: [...S.capEqSel], nota_minima: $("#cMin").value.trim() || "3.5" };
        if (!datos.tema || !datos.fecha) { showErr("cErr", "Escribe el tema y la fecha."); return; }
        if (!datos.equipos.length) { showErr("cErr", "Elige al menos un equipo convocado."); return; }
        const b = $("#cBtn"); setBusy(b, true);
        try { const r = await api("capGuardar", { datos }); S.capL = null; S.capD = null; S.capEqSel = null; toast("Capacitación guardada"); location.hash = "#cap/" + r.id; }
        catch (err) { showErr("cErr", err.message); setBusy(b, false); }
      });
      const d = $("#cDel"); if (d) d.addEventListener("click", async () => {
        if (!d.dataset.armed) { d.dataset.armed = "1"; d.textContent = "Toca otra vez para eliminar (borra también las notas)"; return; }
        setBusy(d, true, "Eliminando…");
        try { await api("capEliminar", { datos: { id: f.dataset.id } }); S.capL = null; S.capD = null; toast("Capacitación eliminada"); location.hash = "#cap"; } catch (err) { showErr("cErr", err.message); setBusy(d, false); }
      });
      return;
    }
    if (!S.capD || S.capD.capacitacion.id !== sub) { cargarCapD(sub); return; }
    const D = S.capD, M = S.capMarks;
    $app.querySelectorAll("[data-cf]").forEach(b => b.addEventListener("click", () => { S.capFiltro = b.dataset.cf; re(); }));
    $app.querySelectorAll("[data-ca]").forEach(b => b.addEventListener("click", () => { const m = M[b.dataset.ca]; m.asistio = !m.asistio; re(); }));
    $app.querySelectorAll("[data-cn]").forEach(i => { i.addEventListener("input", () => { M[i.dataset.cn].nota = i.value; if (i.value.trim()) M[i.dataset.cn].asistio = true; }); i.addEventListener("change", re); });
    $("#cTodos").addEventListener("click", () => { D.roster.filter(r => !S.capFiltro || r.equipo === S.capFiltro).forEach(r => M[r.celular].asistio = true); re(); });
    $("#cFile").addEventListener("change", e => {
      const file = e.target.files[0]; if (!file) return;
      if (file.size > 8 * 1048576) { toast("El archivo supera 8 MB"); return; }
      const rd = new FileReader();
      rd.onload = async () => {
        toast("Subiendo " + file.name + "…");
        try { const r = await api("capSubirArchivo", { datos: { id: sub, nombre: file.name, mime: file.type, base64: String(rd.result).split(",")[1] } }); D.capacitacion.archivos = r.archivos; toast("Evaluación guardada en Drive"); re(); }
        catch (err) { toast(err.message); }
      };
      rd.readAsDataURL(file);
    });
    $("#cXls").addEventListener("change", async e => {
      const file = e.target.files[0]; if (!file) return;
      try {
        await loadScript(XLSX_SRC);
        const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
        if (!rows.length) throw new Error("El archivo está vacío");
        const keys = Object.keys(rows[0]), k = t => keys.find(x => norm(x).includes(t));
        const kc = k("celular") || k("telefono") || k("cel"), kn = k("nombre"), kq = k("nota") || k("calificacion") || k("puntaje");
        if (!kq || (!kc && !kn)) throw new Error("No encontré las columnas: necesito \"nota\" y \"celular\" o \"nombre\"");
        let hechos = 0;
        rows.forEach(row => {
          const nota = String(row[kq]).replace(",", ".").trim(); if (nota === "") return;
          const cel = kc ? String(row[kc]).replace(/\D/g, "") : "";
          const r = D.roster.find(x => (cel && x.celular === cel) || (kn && norm(x.nombre) === norm(row[kn])));
          if (r) { M[r.celular].nota = nota; M[r.celular].asistio = true; hechos++; }
        });
        toast(hechos + " notas cargadas. Revisa y pulsa Guardar."); re();
      } catch (err) { toast(err.message); }
    });
    $("#cdBtn").addEventListener("click", async () => {
      showErr("cdErr", "");
      const malas = D.roster.filter(r => { const v = String(M[r.celular].nota).replace(",", ".").trim(); return v !== "" && (isNaN(+v) || +v < 0 || +v > 5); });
      if (malas.length) { showErr("cdErr", "Revisa la nota de " + malas.map(r => r.nombre).join(", ") + " (usa 0 a 5)."); return; }
      const b = $("#cdBtn"); setBusy(b, true);
      try { const r = await api("capGuardarAsistencia", { datos: { id: sub, filas: D.roster.map(x => ({ celular: x.celular, asistio: M[x.celular].asistio, nota: M[x.celular].nota })) } }); S.capL = null; toast("Guardado · " + r.asistentes + " asistentes"); setBusy(b, false); }
      catch (err) { showErr("cdErr", err.message); setBusy(b, false); }
    });
  }

  /* ---------- apariencia ---------- */
  const DEF = { principal: "#0B2D5B", accion: "#1A5DC8" };
  function lum(hex) { const c = hex.replace("#", "").match(/../g).map(x => parseInt(x, 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  const contraste = hex => Math.round((1.05) / (lum(hex) + 0.05) * 10) / 10;
  function vApariencia() {
    const A = S.apEdit || (S.apEdit = { principal: THEME.principal || DEF.principal, accion: THEME.accion || DEF.accion, logo: THEME.logo || "" });
    const sw = (k, list) => list.map(c => `<button type="button" class="swatch" data-sw="${k}" data-c="${c}" style="background:${c}" aria-pressed="${A[k].toLowerCase() === c.toLowerCase()}" aria-label="Color ${c}"></button>`).join("");
    const cp = contraste(A.principal), ca = contraste(A.accion);
    const prevLogo = A.logo ? `<img src="${A.logo}" alt="" style="width:30px;height:33px;object-fit:contain">` : logoSvg(30);
    return topbar("Apariencia", "Colores y logo de la app", "#config", "General") + `<main style="gap:14px">
      <div class="card" style="gap:12px"><span class="big">Logo</span>
        <div style="display:flex;gap:16px;align-items:center"><div style="width:96px;height:96px;flex:none;border-radius:20px;background:var(--sky);display:flex;align-items:center;justify-content:center">${A.logo ? `<img src="${A.logo}" alt="Logo actual" style="width:64px;height:70px;object-fit:contain">` : logoSvg(60)}</div>
        <div class="hint" style="display:block">PNG con fondo transparente, cuadrado. La app lo reduce automáticamente.</div></div>
        <label class="btn ghost" style="cursor:pointer">${ic("upload", 20)}Cambiar logo<input type="file" id="aLogo" accept="image/png,image/jpeg,image/webp" hidden></label>
        ${A.logo ? `<button class="link" id="aLogoReset" type="button">Restaurar logo original</button>` : ""}
      </div>
      <div class="card" style="gap:14px"><span class="big">Colores</span>
        <div class="f" style="display:flex;flex-direction:column;gap:8px"><span class="lbl">Color principal (encabezados)</span><div class="swrow">${sw("principal", ["#0B2D5B", "#123F7A", "#0E4B6E", "#2A2F6B", "#1F2933"])}<input type="color" data-cc="principal" value="${A.principal}" aria-label="Color principal personalizado"></div>
          <span class="hint">${cp >= 4.5 ? ic("check", 16, "var(--ok)") + "Texto blanco se lee bien" : "⚠ Texto blanco con poco contraste (" + cp + ":1). Elige un tono más oscuro."}</span></div>
        <div class="f" style="display:flex;flex-direction:column;gap:8px"><span class="lbl">Color de acción (botones)</span><div class="swrow">${sw("accion", ["#1A5DC8", "#2F6FDB", "#0A6E9E", "#3B4FD1", "#1B7A4B"])}<input type="color" data-cc="accion" value="${A.accion}" aria-label="Color de acción personalizado"></div>
          <span class="hint">${ca >= 4.5 ? ic("check", 16, "var(--ok)") + "Texto blanco se lee bien" : "⚠ Texto blanco con poco contraste (" + ca + ":1). Elige un tono más oscuro."}</span></div>
      </div>
      <div class="card" style="gap:10px"><span class="lbl">Vista previa</span>
        <div style="border-radius:14px;overflow:hidden;border:1px solid var(--line)"><div style="background:${A.principal};color:#fff;padding:14px 16px;display:flex;gap:10px;align-items:center">${prevLogo}<span style="font-family:var(--f-disp);font-weight:800;letter-spacing:.06em">BRIGADA MCI</span></div>
        <div style="padding:14px;background:var(--ground)"><span class="btn" style="background:${A.accion};color:#fff">${ic("alert", 20)}Registrar incidente</span></div></div>
      </div>
      <p class="err" id="aErr" hidden></p>
      <button class="btn primary" id="aBtn" type="button">${ic("check", 20)}Guardar apariencia</button>
      <button class="link" id="aReset" type="button">Volver a los colores y logo originales</button>
      <div class="hint">El ícono de la app en la pantalla del celular no cambia; se actualiza solo dentro de la app.</div>
    </main>`;
  }
  function reducirLogo(file) {
    return new Promise((res, rej) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        let size = 192, out = "";
        for (let i = 0; i < 4; i++) {
          const k = Math.min(1, size / Math.max(img.width, img.height)), c = document.createElement("canvas");
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          out = c.toDataURL("image/png"); if (out.length > 46000) { const w = c.toDataURL("image/webp", 0.9); if (w.startsWith("data:image/webp") && w.length < out.length) out = w; }
          if (out.length <= 46000) break; size = Math.round(size * 0.75);
        }
        URL.revokeObjectURL(url); out.length <= 46000 ? res(out) : rej(new Error("El logo es muy pesado. Usa una imagen más simple."));
      };
      img.onerror = () => rej(new Error("No pude leer la imagen")); img.src = url;
    });
  }
  function bindApariencia() {
    const A = S.apEdit, re = () => { const y = window.scrollY; route(); window.scrollTo(0, y); };
    $app.querySelectorAll("[data-sw]").forEach(b => b.addEventListener("click", () => { A[b.dataset.sw] = b.dataset.c; re(); }));
    $app.querySelectorAll("[data-cc]").forEach(i => i.addEventListener("change", () => { A[i.dataset.cc] = i.value; re(); }));
    $("#aLogo").addEventListener("change", async e => { const f = e.target.files[0]; if (!f) return; try { A.logo = await reducirLogo(f); re(); } catch (err) { toast(err.message); } });
    const lr = $("#aLogoReset"); if (lr) lr.addEventListener("click", () => { A.logo = ""; re(); });
    const save = async (vals, b) => {
      showErr("aErr", ""); setBusy(b, true);
      try { const r = await api("guardarApariencia", { datos: vals }); applyTheme(r.apariencia); S.apEdit = null; toast("Apariencia guardada"); location.hash = "#config"; }
      catch (err) { showErr("aErr", err.message); setBusy(b, false); }
    };
    $("#aBtn").addEventListener("click", () => save({ color_principal: A.principal.toLowerCase() === DEF.principal.toLowerCase() ? "" : A.principal, color_accion: A.accion.toLowerCase() === DEF.accion.toLowerCase() ? "" : A.accion, logo: A.logo }, $("#aBtn")));
    $("#aReset").addEventListener("click", () => save({ color_principal: "", color_accion: "", logo: "" }, $("#aReset")));
  }

  /* =================== MEJORAS v4 =================== */
  const ahoraLocalDT = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
  const NIVEL_TXT = { critico: "Crítico", alto: "Alto", medio: "Atención" };

  /* ---------- 1. registro de incidentes en la app ---------- */
  // Valores de referencia para ADULTOS: AHA 2017 (presión), OMS (oximetría), fiebre ≥ 38 °C. Igual que en el servidor.
  function evaluarSignos(s, edad) {
    const out = [], adulto = !(Number(edad) > 0 && Number(edad) < 18);
    const n = v => { v = String(v == null ? "" : v).replace(",", ".").trim(); return v === "" || isNaN(+v) ? null : +v; };
    const sis = n(s.pa_sis), dia = n(s.pa_dia), spo = n(s.spo2), fc = n(s.fc), t = n(s.temp);
    if (s.tension && sis != null && dia != null && adulto) {
      if (sis >= 180 || dia >= 120) out.push({ nivel: "critico", texto: `Crisis hipertensiva (${sis}/${dia})` });
      else if (sis < 90 || dia < 60) out.push({ nivel: "alto", texto: `Presión baja / hipotensión (${sis}/${dia})` });
      else if (sis >= 140 || dia >= 90) out.push({ nivel: "alto", texto: `Hipertensión grado 2 (${sis}/${dia})` });
      else if (sis >= 130 || dia >= 80) out.push({ nivel: "medio", texto: `Hipertensión grado 1 (${sis}/${dia})` });
      else if (sis >= 120) out.push({ nivel: "medio", texto: `Presión elevada (${sis}/${dia})` });
    }
    if (s.oximetria && spo != null) { if (spo < 90) out.push({ nivel: "critico", texto: `Saturación muy baja (${spo}%)` }); else if (spo < 95) out.push({ nivel: "medio", texto: `Saturación baja (${spo}%)` }); }
    if (s.oximetria && fc != null && adulto) { if (fc < 50 || fc > 120) out.push({ nivel: "alto", texto: `${fc < 50 ? "Pulso muy bajo" : "Pulso muy alto"} (${fc} lpm)` }); else if (fc < 60 || fc > 100) out.push({ nivel: "medio", texto: `${fc < 60 ? "Pulso bajo" : "Pulso alto"} (${fc} lpm)` }); }
    if (s.temperatura && t != null) {
      if (t < 35) out.push({ nivel: "critico", texto: `Hipotermia (${t} °C)` }); else if (t >= 39.5) out.push({ nivel: "critico", texto: `Fiebre alta (${t} °C)` });
      else if (t >= 38) out.push({ nivel: "alto", texto: `Fiebre (${t} °C)` }); else if (t >= 37.5) out.push({ nivel: "medio", texto: `Febrícula (${t} °C)` }); else if (t < 36) out.push({ nivel: "medio", texto: `Temperatura baja (${t} °C)` });
    }
    return out;
  }
  const INC0 = () => ({ fecha_atencion: ahoraLocalDT(), nombre: "", documento: "", edad: "", contacto: "", ministerio: "", acompanante: "", contacto_acompanante: "", lider_celula: "", lider_no_aplica: false, signos: { tension: false, oximetria: false, temperatura: false, pa_sis: "", pa_dia: "", spo2: "", fc: "", temp: "" }, procedimiento: "", llamo_rohi: null, rohi_detalle: "" });
  function alertasHTML(al, edad) {
    const menor = Number(edad) > 0 && Number(edad) < 18;
    if (!al.length) return menor ? `<div class="note">Menor de 18 años: la presión y el pulso no se evalúan automáticamente porque los rangos cambian con la edad. Valora con criterio.</div>` : "";
    const crit = al.some(a => a.nivel === "critico");
    return `<div class="alertbox ${crit ? "crit" : ""}" role="alert"><b>${crit ? "Valores críticos" : "Valores fuera de lo normal"}</b>
      ${al.map(a => `<div class="al al-${a.nivel}"><span class="pill ${a.nivel === "critico" ? "bad" : a.nivel === "alto" ? "bad" : "warn"}">${NIVEL_TXT[a.nivel]}</span>${esc(a.texto)}</div>`).join("")}
      ${crit ? `<div style="font-size:14px">Considera llamar de inmediato a ROHI o al 123.</div><div class="calls"><a class="call plain" href="tel:${esc(cfg().tel_rohi)}">${ic("phone", 18)}ROHI</a><a class="call red" href="tel:123">${ic("phone", 18)}123</a></div>` : ""}
      ${menor ? `<div style="font-size:13px">Menor de 18 años: solo se evalúan saturación y temperatura.</div>` : ""}
      <div style="font-size:12px;opacity:.8">Guía de referencia para adultos. No reemplaza la valoración médica.</div></div>`;
  }
  function vIncidente() {
    if (S.incOk) {
      const r = S.incOk;
      return topbar("Incidente registrado", "", "#inicio") + `<main>
        <div class="done"><span class="ring">${ic("check", 38, "var(--ok)", 2.6)}</span><h2>Atención registrada</h2><div style="color:var(--muted)">Registró ${esc(r.brigadista)} · ${esc(r.equipo)}</div></div>
        ${r.alertas.length ? alertasHTML(r.alertas, "") : `<div class="note">Sin alertas en los signos vitales registrados.</div>`}
        <button class="btn primary" id="iNuevo" type="button">${ic("plus", 20)}Registrar otra atención</button>
        <a class="btn ghost" href="#inicio">Volver al inicio</a></main>`;
    }
    const D = S.inc || (S.inc = store.get("brig_inc_borrador") || INC0()), g = D.signos;
    const mins = ((S.data && S.data.ministerios) || []).concat(["Ninguno / visitante"]);
    const al = evaluarSignos(g, D.edad);
    const chk = (k, t) => `<button type="button" class="chipbtn" data-sg="${k}" aria-pressed="${!!g[k]}">${g[k] ? "✓ " : ""}${t}</button>`;
    const fld = (k, l, o) => `<label class="f"><span class="lbl">${l}</span><input class="inp" data-inc="${k}" value="${esc(D[k])}" ${o || ""}></label>`;
    const sv = (k, l, ph) => `<label class="f"><span class="lbl">${l}</span><input class="inp" data-sv="${k}" inputmode="decimal" value="${esc(g[k])}" placeholder="${ph}"></label>`;
    return topbar("Registrar incidente", "Protocolo de atención", "#inicio") + `<main style="gap:14px">
      ${isCoord() ? `<a class="link" href="#incidentes" style="align-self:flex-start;padding:2px 0">${ic("book", 16)}Ver incidentes ${isPro() ? "registrados" : "de mi equipo"}</a>` : ""}
      <div class="card" style="gap:12px"><span class="big" style="font-size:17px">Persona atendida</span>
        ${fld("fecha_atencion", "Fecha y hora de atención", 'type="datetime-local"')}
        ${fld("nombre", "Nombre completo", 'autocomplete="off"')}
        <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:10px">${fld("documento", "Documento", 'inputmode="numeric"')}${fld("edad", "Edad", 'inputmode="numeric" maxlength="3"')}</div>
        ${fld("contacto", "Número de contacto", 'type="tel" inputmode="numeric"')}
        <label class="f"><span class="lbl">Ministerio al que pertenece</span><select class="inp" data-inc="ministerio"><option value="">Selecciona</option>${opts(mins, D.ministerio)}</select></label>
        ${fld("acompanante", "Nombre del acompañante", 'autocomplete="off"')}
        ${fld("contacto_acompanante", "Contacto del acompañante", 'type="tel" inputmode="numeric"')}
        <label class="f"><span class="lbl">Líder de célula</span><input class="inp" data-inc="lider_celula" value="${esc(D.lider_no_aplica ? "" : D.lider_celula)}" ${D.lider_no_aplica ? "disabled placeholder=\"No aplica\"" : ""}></label>
        <button type="button" class="chipbtn" id="iNoAplica" aria-pressed="${D.lider_no_aplica}" style="align-self:flex-start">${D.lider_no_aplica ? "✓ " : ""}No aplica (es nuevo)</button>
      </div>
      <div class="card" style="gap:12px"><span class="big" style="font-size:17px">Signos vitales · primer respondiente</span>
        <span class="hint">Marca los signos que tomaste.</span>
        <div style="display:flex;gap:6px;flex-wrap:wrap">${chk("tension", "Tensión")}${chk("oximetria", "Oximetría")}${chk("temperatura", "Temperatura")}</div>
        ${g.tension ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${sv("pa_sis", "Sistólica (mmHg)", "120")}${sv("pa_dia", "Diastólica (mmHg)", "80")}</div>` : ""}
        ${g.oximetria ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${sv("spo2", "Saturación SpO₂ (%)", "98")}${sv("fc", "Pulso (lpm)", "75")}</div>` : ""}
        ${g.temperatura ? sv("temp", "Temperatura (°C)", "36.5") : ""}
        <div id="iAlertas">${alertasHTML(al, D.edad)}</div>
      </div>
      <div class="card" style="gap:12px"><span class="big" style="font-size:17px">Atención</span>
        <label class="f"><span class="lbl">Procedimiento realizado e insumos</span><textarea class="inp" data-inc="procedimiento" rows="4" style="min-height:110px" placeholder="Describe la atención realizada y qué utilizaste">${esc(D.procedimiento)}</textarea></label>
        <div class="f" style="display:flex;flex-direction:column;gap:6px"><span class="lbl">¿Se llamó a ROHI?</span><div class="seg"><button type="button" data-rohi="si" aria-pressed="${D.llamo_rohi === true}">Sí</button><button type="button" data-rohi="no" aria-pressed="${D.llamo_rohi === false}">No</button></div></div>
        ${D.llamo_rohi ? `<label class="f"><span class="lbl">Detalle de la llamada (hora, traslado, indicaciones)</span><input class="inp" data-inc="rohi_detalle" value="${esc(D.rohi_detalle)}"></label>` : ""}
      </div>
      <div class="hint">${ic("user", 16)}Registra: <b>${esc(S.perfil.nombre)}</b> · ${esc(S.perfil.equipo || "")} (automático)</div>
      <p class="err" id="iErrInc" hidden></p>
      <button class="btn primary" id="iGuardar" type="button">${ic("check", 20)}Guardar registro</button>
      <button class="link" id="iLimpiar" type="button">Limpiar formulario</button>
    </main>`;
  }
  function bindIncidente() {
    const nuevo = $("#iNuevo"); if (nuevo) { nuevo.addEventListener("click", () => { S.incOk = null; S.inc = INC0(); route(); }); return; }
    const D = S.inc, g = D.signos, guardarBorrador = () => store.set("brig_inc_borrador", D);
    const re = () => { const y = window.scrollY; route(); window.scrollTo(0, y); };
    const refrescaAlertas = () => { const b = $("#iAlertas"); if (b) b.innerHTML = alertasHTML(evaluarSignos(g, D.edad), D.edad); };
    $app.querySelectorAll("[data-inc]").forEach(i => i.addEventListener("input", () => { D[i.dataset.inc] = i.value; guardarBorrador(); if (i.dataset.inc === "edad") refrescaAlertas(); }));
    $app.querySelectorAll("select[data-inc]").forEach(i => i.addEventListener("change", () => { D[i.dataset.inc] = i.value; guardarBorrador(); }));
    $app.querySelectorAll("[data-sv]").forEach(i => i.addEventListener("input", () => { g[i.dataset.sv] = i.value; guardarBorrador(); refrescaAlertas(); }));
    $app.querySelectorAll("[data-sg]").forEach(b => b.addEventListener("click", () => { g[b.dataset.sg] = !g[b.dataset.sg]; guardarBorrador(); re(); }));
    $app.querySelectorAll("[data-rohi]").forEach(b => b.addEventListener("click", () => { D.llamo_rohi = b.dataset.rohi === "si"; guardarBorrador(); re(); }));
    $("#iNoAplica").addEventListener("click", () => { D.lider_no_aplica = !D.lider_no_aplica; if (D.lider_no_aplica) D.lider_celula = ""; guardarBorrador(); re(); });
    $("#iLimpiar").addEventListener("click", () => { S.inc = INC0(); store.set("brig_inc_borrador", null); route(); });
    $("#iGuardar").addEventListener("click", async () => {
      showErr("iErrInc", "");
      const falta = !D.fecha_atencion ? "la fecha y hora" : !D.nombre.trim() ? "el nombre completo" : !String(D.edad).trim() ? "la edad" : !D.ministerio ? "el ministerio" : (!D.lider_no_aplica && !D.lider_celula.trim()) ? "el líder de célula (o marca No aplica)" : !D.procedimiento.trim() ? "el procedimiento realizado" : D.llamo_rohi === null ? "indicar si se llamó a ROHI" : "";
      if (falta) { showErr("iErrInc", "Falta " + falta + "."); return; }
      const b = $("#iGuardar"); setBusy(b, true);
      try { const r = await api("registrarIncidente", { datos: D }); store.set("brig_inc_borrador", null); S.inc = null; S.incOk = r; route(); toast("Incidente registrado"); }
      catch (e) { showErr("iErrInc", e.message); setBusy(b, false); }
    });
  }
  function vIncidentes() {
    if (!isCoord()) return vInicio();
    const L = S.incL, r = rangoFiltro();
    const head = topbar("Incidentes registrados", isPro() ? periodoTxt(r) : (S.perfil.equipo || ""), "#incidente", isPro() ? "General" : "Coordinador");
    const filtro = isPro() ? filtroHTML() : filtroHTML().replace(/<label class="f"><span class="lbl">Equipo[\s\S]*?<\/label>/, "");
    if (!L) return head + `<main style="gap:14px">${filtro}<div class="loading">Cargando…</div></main>`;
    return head + `<main style="gap:10px">${filtro}
      <div class="row"><span class="big">${L.length} ${L.length === 1 ? "atención" : "atenciones"}</span><span class="pill">${L.filter(x => x.alertas).length} con alerta</span></div>
      ${L.map(x => `<details class="card inc"><summary><div class="row"><b>${esc(x.nombre)}${x.edad ? " · " + esc(x.edad) + " años" : ""}</b>${x.alertas ? '<span class="pill bad">Alerta</span>' : ""}</div>
        <div class="hint" style="display:block">${esc(new Date(x.fecha).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }))} · ${esc(x.equipo)} · Registró ${esc(x.brigadista)}${x.llamo_rohi ? " · <b>Se llamó a ROHI</b>" : ""}</div></summary>
        <div style="display:flex;flex-direction:column;gap:6px;font-size:14px;padding-top:8px">
          ${x.alertas ? `<div class="note" style="background:var(--red-soft);color:var(--red)">${esc(x.alertas)}</div>` : ""}
          ${[["Presión", x.pa && x.pa + " mmHg"], ["SpO₂", x.spo2 && x.spo2 + "%"], ["Pulso", x.fc && x.fc + " lpm"], ["Temperatura", x.temp && x.temp + " °C"], ["Ministerio", x.ministerio], ["Líder", x.lider], ["Contacto", x.contacto], ["Acompañante", x.acompanante && x.acompanante + (x.contacto_acompanante ? " · " + x.contacto_acompanante : "")], ["Documento", x.documento]].filter(k => k[1]).map(k => `<div class="kv"><span>${k[0]}</span><b>${esc(k[1])}</b></div>`).join("")}
          <div><span class="lbl">Procedimiento</span><div>${esc(x.procedimiento)}</div></div></div></details>`).join("") || `<div class="card" style="color:var(--muted)">No hay incidentes en este periodo.</div>`}
    </main>`;
  }
  async function cargarIncL() {
    if (S.incLoading) return; S.incLoading = true;
    try { S.incL = (await api("listaIncidentes", { datos: rangoFiltro() })).incidentes; } catch (e) { toast(e.message); location.hash = "#incidente"; } finally { S.incLoading = false; }
    if (/^#incidentes/.test(location.hash)) route();
  }
  function bindIncidentes() { bindFiltro(() => { S.incL = null; route(); }); if (!S.incL) cargarIncL(); }

  /* ---------- 2. asistencia del día (varias reuniones + motivo) ---------- */
  const corto = s => String(s).replace(/^(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\s*[·\-:]?\s*/i, "") || s;
  function vAsistencia() {
    if (!isCoord()) return vInicio();
    const A = S.asisSrv;
    const head = topbar("Asistencia de turno", "Servicios y apoyo semanal", "#inicio", isPro() ? "General" : "Coordinador");
    if (!A) return head + loadingMain("Cargando brigadistas…");
    const M = S.asisMarks, SV = A.servicios, edit = !A.guardado || S.asisEdit;
    const apoyoInfo = c => A.candidatosApoyo.find(x => x.celular === c) || { nombre: c, equipo: "" };
    const libres = A.candidatosApoyo.filter(c => !M.apoyos.has(c.celular));
    const pres = serv => A.roster.filter(r => M.m[r.celular] && M.m[r.celular][serv]).length;
    const fila = (r, apoyo) => {
      const mk = M.m[r.celular] || {}, faltas = SV.filter(s => !mk[s]).length;
      return `<div class="arow${faltas === 0 ? " full" : ""}"><div class="row"><span style="font-weight:700">${esc(r.nombre)}${r.rol && r.rol !== "brigadista" ? ' <span class="tagc">Coord.</span>' : ""}${apoyo ? ` <span class="tagc" style="background:var(--warn-soft);color:var(--warn)">Apoyo · ${esc(r.equipo)}</span>` : ""}</span>${apoyo && edit ? `<button type="button" class="x" data-rmap="${esc(r.celular)}" aria-label="Quitar apoyo" style="width:34px;height:34px">✕</button>` : ""}</div>
        <div class="svs">${SV.map(s => `<button type="button" class="sv" data-pc="${esc(r.celular)}" data-sv="${esc(s)}" aria-pressed="${!!mk[s]}" ${edit ? "" : "disabled"}>${mk[s] ? "✓ " : ""}${esc(corto(s))}</button>`).join("")}</div>
        ${!apoyo && faltas ? (edit ? `<select class="inp motivo" data-mot="${esc(r.celular)}" aria-label="Motivo de inasistencia de ${esc(r.nombre)}"><option value="">${faltas === SV.length ? "No asistió · motivo" : "Faltó a " + faltas + " · motivo"}</option>${A.motivosLista.map(m => `<option ${M.mot[r.celular] === m ? "selected" : ""}>${m}</option>`).join("")}</select>` : `<div class="hint">${faltas === SV.length ? "No asistió" : "Faltó a " + faltas}${M.mot[r.celular] ? " · " + esc(M.mot[r.celular]) : " · sin motivo"}</div>`) : ""}</div>`;
    };
    return head + `<main style="gap:14px">
      <div style="display:grid;grid-template-columns:${A.modo === "uno" ? "1fr 1fr" : "1fr"};gap:12px">
        <label class="f"><span class="lbl">Fecha</span><input class="inp" id="sFecha" type="date" value="${esc(A.fecha)}"></label>
        ${A.modo === "uno" ? `<label class="f"><span class="lbl">Servicio</span><select class="inp" id="sServ">${opts(A.todosServicios, SV[0])}</select></label>` : ""}
      </div>
      <div class="row"><span class="big">${esc(A.equipo)}</span><span class="pill">${A.modo === "dia" ? cap(A.dia) + " · " + SV.length + " reuniones" : esc(SV[0])}</span></div>
      ${A.modo === "dia" ? `<div style="display:flex;gap:6px;flex-wrap:wrap">${SV.map(s => `<span class="pill ${pres(s) ? "ok" : ""}">${esc(corto(s))}: ${pres(s)}/${A.roster.length}</span>`).join("")}</div>` : `<div><span class="pill ${pres(SV[0]) ? "ok" : ""}">${pres(SV[0])} de ${A.roster.length} presentes</span></div>`}
      ${A.guardado ? `<div class="done-banner">${ic("check", 22, "var(--ok)", 2.6)}<div><b>Asistencia ya confirmada por ${esc(A.guardado)}</b><div>${esc(cap(fechaCorta(A.fecha)))}${A.guardadoEn ? " · " + esc(new Date(A.guardadoEn).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" })) : ""}</div></div></div>` : ""}
      ${edit && A.roster.length ? `<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="chipbtn" id="sTodos" type="button">✓ Todos a todo</button>${SV.length > 1 ? SV.map(s => `<button class="chipbtn" type="button" data-col="${esc(s)}">✓ ${esc(corto(s))}</button>`).join("") : ""}</div><div class="hint">Toca cada reunión para marcar asistencia. Si alguien falta, elige el motivo.</div>` : ""}
      <div style="display:flex;flex-direction:column;gap:8px">${A.roster.map(r => fila(r, false)).join("") || `<div class="card" style="color:var(--muted)">No hay brigadistas activos en ${esc(A.equipo)}.</div>`}</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px"><span class="big">Apoyo semanal</span>
        ${[...M.apoyos].map(c => fila(Object.assign({ celular: c }, apoyoInfo(c)), true)).join("") || `<span class="hint">Brigadistas de otros equipos que apoyan este día.</span>`}
        ${edit && libres.length ? `<div style="display:flex;gap:8px"><select class="inp" id="sApoyo"><option value="">Agregar brigadista de otro equipo</option>${libres.map(c => `<option value="${esc(c.celular)}">${esc(c.nombre)} · ${esc(c.equipo)}</option>`).join("")}</select><button class="iconbtn" id="sAddAp" type="button" aria-label="Agregar apoyo" style="background:var(--blue);width:50px;height:50px">${ic("plus", 20)}</button></div>` : ""}
      </div>
      <p class="err" id="sErr" hidden></p>
      ${edit ? `<button class="btn primary" id="sBtn" type="button">${ic("check", 20)}${A.guardado ? "Guardar corrección" : "Confirmar asistencia"}</button>` : `<button class="btn ghost" id="sEditar" type="button">${ic("edit", 20)}Corregir la lista</button>`}
    </main>`;
  }
  async function cargarAsisSrv(q) {
    S.asisLoading = true; S.asisSrv = null; route();
    try { S.asisSrv = await api("asistenciaDatos", { datos: q || {} }); } catch (e) { S.asisLoading = false; toast(e.message); location.hash = "#inicio"; return; }
    S.asisLoading = false;
    const A = S.asisSrv, m = {};
    Object.keys(A.marcas).forEach(c => { m[c] = Object.assign({}, A.marcas[c]); });
    S.asisMarks = { m, mot: Object.assign({}, A.motivos), apoyos: new Set(A.apoyos) }; S.asisEdit = false;
    if (/^#asistencia/.test(location.hash)) route();
  }
  function bindAsistencia() {
    if (!S.asisSrv) { if (!S.asisLoading) cargarAsisSrv(S.asisQ); return; }
    const A = S.asisSrv, M = S.asisMarks;
    const re = () => { const y = window.scrollY; route(); window.scrollTo(0, y); };
    const setM = (c, s, v) => { (M.m[c] = M.m[c] || {})[s] = v; };
    const q = () => ({ fecha: $("#sFecha").value, servicio: $("#sServ") ? $("#sServ").value : "" });
    $("#sFecha").addEventListener("change", () => { S.asisQ = q(); cargarAsisSrv(S.asisQ); });
    const sv = $("#sServ"); if (sv) sv.addEventListener("change", () => { S.asisQ = q(); cargarAsisSrv(S.asisQ); });
    $app.querySelectorAll("[data-pc]").forEach(b => b.addEventListener("click", () => { const c = b.dataset.pc, s = b.dataset.sv; setM(c, s, !(M.m[c] && M.m[c][s])); re(); }));
    $app.querySelectorAll("[data-mot]").forEach(i => i.addEventListener("change", () => { M.mot[i.dataset.mot] = i.value; }));
    const t = $("#sTodos"); if (t) t.addEventListener("click", () => { A.roster.forEach(r => A.servicios.forEach(s => setM(r.celular, s, true))); re(); });
    $app.querySelectorAll("[data-col]").forEach(b => b.addEventListener("click", () => { const s = b.dataset.col, all = A.roster.every(r => M.m[r.celular] && M.m[r.celular][s]); A.roster.forEach(r => setM(r.celular, s, !all)); re(); }));
    $app.querySelectorAll("[data-rmap]").forEach(b => b.addEventListener("click", () => { M.apoyos.delete(b.dataset.rmap); delete M.m[b.dataset.rmap]; re(); }));
    const ad = $("#sAddAp"); if (ad) ad.addEventListener("click", () => { const v = $("#sApoyo").value; if (!v) { toast("Elige un brigadista"); return; } M.apoyos.add(v); A.servicios.forEach(s => setM(v, s, true)); re(); });
    const ed = $("#sEditar"); if (ed) ed.addEventListener("click", () => { S.asisEdit = true; re(); });
    const sb = $("#sBtn"); if (!sb) return;
    sb.addEventListener("click", async () => {
      showErr("sErr", ""); setBusy(sb, true);
      try {
        const r = await api("guardarAsistencia", { datos: { equipo: A.equipo, fecha: A.fecha, servicios: A.servicios, marcas: M.m, motivos: M.mot, apoyos: [...M.apoyos] } });
        toast("Asistencia guardada · " + r.presentes + " marcas de asistencia"); S.asisQ = { fecha: A.fecha, servicio: A.modo === "uno" ? A.servicios[0] : "" }; cargarAsisSrv(S.asisQ);
      } catch (e) { showErr("sErr", e.message); setBusy(sb, false); }
    });
  }

  /* ---------- 3. cumpleaños + tarjeta ---------- */
  function cumpleHTML() {
    const C = S.data && S.data.cumpleanos; if (!C || (!C.hoy.length && !C.semana.length)) return "";
    const md = x => { const [m, d] = x.md.split("-").map(Number); return new Date(2000, m - 1, d).toLocaleDateString("es-CO", { day: "numeric", month: "short" }); };
    return `<div class="card cumple"><div class="row"><span class="big" style="font-size:17px">${ic("gift", 20, "var(--blue)")} Cumpleaños</span>${C.hoy.length ? `<span class="pill ok">${C.hoy.length} hoy</span>` : ""}</div>
      ${C.hoy.map((x, i) => `<div class="row"><span><b>${esc(x.nombre)}</b> <span style="color:var(--muted);font-size:13px">· ${esc(x.equipo)}</span></span><button type="button" class="chipbtn" data-tarjeta="${i}">Tarjeta</button></div>`).join("")}
      ${C.semana.length ? `<div class="hint" style="display:block">Próximos: ${C.semana.map(x => esc(x.nombre.split(" ")[0]) + " (" + md(x) + ")").join(", ")}</div>` : ""}</div>`;
  }
  function svgDataUrl(s) { return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ')); }
  function cargarImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
  async function tarjeta(p) {
    const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
    const css = getComputedStyle(document.documentElement), navy = css.getPropertyValue("--navy").trim() || "#0B2D5B", blue = css.getPropertyValue("--blue").trim() || "#1A5DC8";
    try { await Promise.all([document.fonts.load("800 90px Archivo"), document.fonts.load("700 40px 'Nunito Sans'")]); } catch (e) {}
    x.fillStyle = navy; x.fillRect(0, 0, W, H);
    const pal = ["#6FA8FF", "#FFFFFF", blue, "#BFD3F2"];
    for (let i = 0; i < 90; i++) { x.globalAlpha = 0.25 + Math.random() * 0.5; x.fillStyle = pal[i % pal.length]; const r = 4 + Math.random() * 9; x.beginPath(); x.arc(Math.random() * W, Math.random() * H * 0.55, r, 0, Math.PI * 2); x.fill(); }
    x.globalAlpha = 1; x.fillStyle = "#FFFFFF"; x.beginPath(); x.roundRect ? x.roundRect(70, 700, W - 140, 560, 40) : x.rect(70, 700, W - 140, 560); x.fill();
    try { const img = await cargarImg(THEME.logo || svgDataUrl(logoSvg(220))); const h = 260, w = img.width ? h * img.width / img.height : h / 1.1; x.drawImage(img, (W - w) / 2, 110, w, h); } catch (e) {}
    x.textAlign = "center"; x.fillStyle = "#FFFFFF"; x.font = "800 96px Archivo, Arial"; x.fillText("¡Feliz", W / 2, 500); x.fillText("cumpleaños!", W / 2, 610);
    x.fillStyle = navy; let fs = 84; const nom = p.nombre.toUpperCase(); x.font = `800 ${fs}px Archivo, Arial`; while (x.measureText(nom).width > W - 220 && fs > 40) { fs -= 4; x.font = `800 ${fs}px Archivo, Arial`; }
    x.fillText(nom, W / 2, 820); x.fillStyle = blue; x.font = "700 40px 'Nunito Sans', Arial"; x.fillText(p.equipo, W / 2, 885);
    x.fillStyle = "#33415A"; x.font = "400 38px 'Nunito Sans', Arial";
    ["Toda la Brigada de Emergencia te celebra.", "Gracias por servir con amor.", "¡Dios bendiga este nuevo año de vida!"].forEach((l, i) => x.fillText(l, W / 2, 985 + i * 58));
    x.fillStyle = navy; x.font = "800 34px Archivo, Arial"; x.fillText("BRIGADA MCI MOSQUERA", W / 2, 1190);
    return new Promise(res => c.toBlob(b => res(b), "image/png"));
  }
  async function abrirTarjeta(i) {
    const p = S.data.cumpleanos.hoy[i]; if (!p) return;
    toast("Creando tarjeta…"); const blob = await tarjeta(p), url = URL.createObjectURL(blob), nombre = "Cumpleaños " + p.nombre + ".png";
    const el = document.createElement("div"); el.className = "overlay"; el.id = "cardSheet";
    el.innerHTML = `<div class="install" role="dialog" aria-modal="true" aria-label="Tarjeta de cumpleaños"><span class="grab"></span><img src="${url}" alt="Tarjeta de cumpleaños de ${esc(p.nombre)}" style="width:100%;max-height:60vh;object-fit:contain;border-radius:14px">
      <button class="btn primary" id="tShare" type="button">${ic("share", 20)}Compartir</button><a class="btn ghost" href="${url}" download="${esc(nombre)}">${ic("download", 20)}Descargar imagen</a><button class="link" id="tClose" type="button">Cerrar</button></div>`;
    document.body.appendChild(el);
    const close = () => { el.remove(); URL.revokeObjectURL(url); };
    el.addEventListener("click", e => { if (e.target === el) close(); }); el.querySelector("#tClose").addEventListener("click", close);
    el.querySelector("#tShare").addEventListener("click", async () => {
      const f = new File([blob], nombre, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f], title: "¡Feliz cumpleaños, " + p.nombre + "!", text: "¡Feliz cumpleaños, " + p.nombre + "! Brigada MCI Mosquera" }); } catch (e) {} }
      else toast("Tu navegador no permite compartir directo: usa Descargar y envíala por WhatsApp");
    });
  }

  /* ---------- 4. inventario de enfermería ---------- */
  const ALERTA_TXT = { agotado: ["bad", "Agotado"], bajo: ["warn", "Bajo mínimo"], vencido: ["bad", "Vencido"], porvencer: ["warn", "Vence pronto"] };
  function vInventario(sub) {
    if (!isCoord()) return vInicio();
    const V = S.inv;
    const head = topbar("Inventario de enfermería", "Elementos médicos", sub ? "#inventario" : "#inicio", isPro() ? "General" : "Coordinador");
    if (!V) return head + loadingMain();
    if (sub) return vInvItem(sub);
    const ub = S.invUb || V.ubicaciones[0], q = norm(S.invQ || "");
    const L = V.items.filter(i => i.ubicacion === ub && (!q || norm(i.elemento + " " + i.categoria).includes(q)));
    const cnt = k => V.items.filter(i => i.ubicacion === ub && i.alertas.includes(k)).length;
    return head + `<main style="gap:12px">
      <div class="seg" role="group">${V.ubicaciones.map(u => `<button type="button" data-ub="${esc(u)}" aria-pressed="${u === ub}" style="font-size:13px">${esc(u)}</button>`).join("")}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">${cnt("agotado") ? `<span class="pill bad">${cnt("agotado")} agotados</span>` : ""}${cnt("bajo") ? `<span class="pill warn">${cnt("bajo")} bajo mínimo</span>` : ""}${cnt("vencido") ? `<span class="pill bad">${cnt("vencido")} vencidos</span>` : ""}${cnt("porvencer") ? `<span class="pill warn">${cnt("porvencer")} vencen en 30 días</span>` : ""}${!["agotado", "bajo", "vencido", "porvencer"].some(cnt) ? '<span class="pill ok">Todo en orden</span>' : ""}</div>
      <input class="inp" id="invQ" type="search" placeholder="Buscar elemento" value="${esc(S.invQ || "")}">
      ${V.puedeEditar ? `<a class="btn primary" href="#inventario/nuevo">${ic("plus", 20)}Agregar elemento</a>` : ""}
      ${L.map(i => `<div class="invrow"><a href="#inventario/${esc(i.id)}" style="flex:1;min-width:0;text-decoration:none;color:inherit"><b style="display:block">${esc(i.elemento)}</b>
        <span style="font-size:12px;color:var(--muted)">${esc(i.categoria || "")}${i.minimo ? " · mín. " + esc(i.minimo) : ""}${i.vence ? " · vence " + esc(i.vence) : ""}</span>
        <span style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${i.alertas.map(a => `<span class="pill ${ALERTA_TXT[a][0]}">${ALERTA_TXT[a][1]}</span>`).join("")}</span></a>
        <div class="stepper"><button type="button" data-adj="${esc(i.id)}" data-c="-1" aria-label="Restar uno a ${esc(i.elemento)}">−</button><span><b>${esc(i.cantidad)}</b><small>${esc(i.unidad || "und")}</small></span><button type="button" data-adj="${esc(i.id)}" data-c="1" aria-label="Sumar uno a ${esc(i.elemento)}">+</button></div></div>`).join("") || `<div class="card" style="color:var(--muted)">${V.items.some(i => i.ubicacion === ub) ? "Ningún elemento coincide." : "Aún no hay elementos en " + esc(ub) + "." + (V.puedeEditar ? " Agrégalos con el botón de arriba." : " Un coordinador Pro debe agregarlos.")}</div>`}
      <div class="hint" style="display:block">− registra uso o consumo y + registra reposición. Cada cambio queda guardado con tu nombre en la hoja InventarioMov.</div>
    </main>`;
  }
  function vInvItem(id) {
    const V = S.inv, nuevo = id === "nuevo", i = nuevo ? { id: "", ubicacion: S.invUb || V.ubicaciones[0], elemento: "", categoria: "", cantidad: "0", unidad: "", minimo: "", vence: "", lote: "", alertas: [] } : V.items.find(x => x.id === id);
    if (!i) return `<main><div class="card">El elemento ya no existe.</div></main>`;
    const head = topbar(nuevo ? "Nuevo elemento" : i.elemento, i.ubicacion, "#inventario", isPro() ? "General" : "Coordinador");
    const ajuste = nuevo ? "" : `<div class="card" style="gap:12px"><span class="big" style="font-size:17px">Ajustar cantidad</span><div class="kv"><span>Cantidad actual</span><b>${esc(i.cantidad)} ${esc(i.unidad || "")}</b></div>
      <div style="display:grid;grid-template-columns:1fr 1.4fr;gap:10px"><label class="f"><span class="lbl">Cambio (+ o −)</span><input class="inp" id="jC" inputmode="decimal" placeholder="-2 o 10"></label>
      <label class="f"><span class="lbl">Motivo</span><select class="inp" id="jM"><option>Uso / consumo</option><option>Reposición</option><option>Vencido / descarte</option><option>Préstamo</option><option>Corrección de conteo</option></select></label></div>
      <button class="btn ghost" id="jBtn" type="button">${ic("check", 20)}Aplicar ajuste</button></div>`;
    if (!V.puedeEditar) return head + `<main style="gap:14px">${ajuste}<p class="err" id="jErr" hidden></p></main>`;
    return head + `<main style="gap:14px">${ajuste}
      <form id="fInv" class="card" style="gap:12px" novalidate><span class="big" style="font-size:17px">${nuevo ? "Datos del elemento" : "Editar datos"}</span>
        <label class="f"><span class="lbl">Enfermería</span><select class="inp" id="vUb">${opts(V.ubicaciones, i.ubicacion)}</select></label>
        <label class="f"><span class="lbl">Elemento</span><input class="inp" id="vEl" value="${esc(i.elemento)}" placeholder="Ej: Gasas estériles"></label>
        <label class="f"><span class="lbl">Categoría</span><input class="inp" id="vCat" value="${esc(i.categoria)}" placeholder="Ej: Curación, Medicamento, Equipo"></label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><label class="f"><span class="lbl">Cantidad</span><input class="inp" id="vCan" inputmode="decimal" value="${esc(i.cantidad)}"></label><label class="f"><span class="lbl">Unidad</span><input class="inp" id="vUn" value="${esc(i.unidad)}" placeholder="und, cajas…"></label></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><label class="f"><span class="lbl">Mínimo</span><input class="inp" id="vMin" inputmode="decimal" value="${esc(i.minimo)}"></label><label class="f"><span class="lbl">Vence</span><input class="inp" id="vVen" type="date" value="${esc(i.vence)}"></label></div>
        <label class="f"><span class="lbl">Lote (opcional)</span><input class="inp" id="vLot" value="${esc(i.lote)}"></label>
        <button class="btn primary" id="vBtn" type="submit">${ic("check", 20)}Guardar</button>
        ${nuevo ? "" : `<button class="btn danger" id="vDel" type="button">${ic("trash", 20)}Eliminar elemento</button>`}
      </form><p class="err" id="jErr" hidden></p></main>`;
  }
  async function cargarInv() {
    if (S.invLoading) return; S.invLoading = true;
    try { S.inv = await api("invLista"); } catch (e) { toast(e.message); location.hash = "#inicio"; } finally { S.invLoading = false; }
    if (/^#inventario/.test(location.hash)) route();
  }
  function bindInventario(sub) {
    if (!S.inv) { cargarInv(); return; }
    const re = () => { const y = window.scrollY; route(); window.scrollTo(0, y); };
    if (!sub) {
      $app.querySelectorAll("[data-ub]").forEach(b => b.addEventListener("click", () => { S.invUb = b.dataset.ub; route(); }));
      const qi = $("#invQ"); qi.addEventListener("input", () => { S.invQ = qi.value; const p = qi.selectionStart; route(); const n = $("#invQ"); n.focus(); n.setSelectionRange(p, p); });
      $app.querySelectorAll("[data-adj]").forEach(b => b.addEventListener("click", async () => {
        b.disabled = true;
        try { S.inv = await api("invAjustar", { datos: { id: b.dataset.adj, cambio: +b.dataset.c } }); re(); } catch (e) { toast(e.message); b.disabled = false; }
      }));
      return;
    }
    const jb = $("#jBtn"); if (jb) jb.addEventListener("click", async () => {
      showErr("jErr", ""); const c = +String($("#jC").value).replace(",", ".");
      if (!c) { showErr("jErr", "Escribe cuánto sumar (10) o restar (-2)."); return; }
      setBusy(jb, true);
      try { S.inv = await api("invAjustar", { datos: { id: sub, cambio: c, motivo: $("#jM").value } }); toast("Ajuste aplicado"); location.hash = "#inventario"; } catch (e) { showErr("jErr", e.message); setBusy(jb, false); }
    });
    const f = $("#fInv"); if (f) f.addEventListener("submit", async e => {
      e.preventDefault(); showErr("jErr", "");
      const datos = { id: sub === "nuevo" ? "" : sub, ubicacion: $("#vUb").value, elemento: $("#vEl").value.trim(), categoria: $("#vCat").value.trim(), cantidad: $("#vCan").value, unidad: $("#vUn").value.trim(), minimo: $("#vMin").value, vence: $("#vVen").value, lote: $("#vLot").value.trim() };
      if (!datos.elemento) { showErr("jErr", "Escribe el nombre del elemento."); return; }
      const b = $("#vBtn"); setBusy(b, true);
      try { S.inv = await api("invGuardar", { datos }); S.invUb = datos.ubicacion; toast("Elemento guardado"); location.hash = "#inventario"; } catch (err) { showErr("jErr", err.message); setBusy(b, false); }
    });
    const d = $("#vDel"); if (d) d.addEventListener("click", async () => {
      if (!d.dataset.armed) { d.dataset.armed = "1"; d.textContent = "Toca otra vez para eliminar"; return; }
      setBusy(d, true, "Eliminando…");
      try { S.inv = await api("invEliminar", { datos: { id: sub } }); toast("Elemento eliminado"); location.hash = "#inventario"; } catch (err) { showErr("jErr", err.message); setBusy(d, false); }
    });
  }

  /* ---------- 5. intercesión: confirmar sesión completa ---------- */
  const minDe = h => { const m = String(h || "").toLowerCase().match(/(\d{1,2})(?::(\d{2}))?\s*(a|p)?/); if (!m) return null; let x = +m[1] % 12; if (m[3] === "p") x += 12; if (!m[3] && +m[1] === 12) x = 12; return x * 60 + +(m[2] || 0); };
  function salidaHTML() {
    const d = S.data || {}, r = d.registroSesion || {}, ses = d.sesion || {}, fin = cfg().fin_intercesion || "7:00 a.m.";
    if (r.completa) return `<div class="done-banner">${ic("check", 22, "var(--ok)", 2.6)}<div><b>Sesión completa confirmada</b><div>Gracias por estar hasta el final.</div></div></div>`;
    const fm = minDe(fin), now = new Date(), nm = now.getHours() * 60 + now.getMinutes();
    const hoy = ses.fecha === hoyLocal(), abierta = hoy && (fm == null || (nm >= fm - 15 && nm <= fm + 90));
    return `<div class="card" style="gap:8px"><span class="big" style="font-size:17px">¿Estuviste hasta el final?</span>
      <span class="hint" style="display:block">Al terminar la reunión, confirma aquí para registrar tu asistencia completa. Disponible desde 15 minutos antes de las ${esc(fin)}.</span>
      <button class="btn ${abierta ? "primary" : "ghost"}" id="bSalida" type="button" ${abierta ? "" : "disabled"}>${ic("check", 20)}${abierta ? "Confirmar sesión completa" : (hoy && fm != null && nm > fm + 90 ? "Tiempo de confirmación cerrado" : "Aún no disponible")}</button></div>`;
  }
  async function confirmarSalida(b) {
    setBusy(b, true, "Confirmando…");
    try { await api("intercesionSalida"); S.data.registroSesion.completa = true; store.set("brig_data", S.data); toast("Sesión completa registrada"); route(); }
    catch (e) { toast(e.message); setBusy(b, false); }
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
    if (!(v === "config" && arg === "apariencia")) S.apEdit = null;
    if (v !== "indicadores") S.ind = null;
    if (v !== "incidente") S.incOk = null;
    if (v !== "incidentes") S.incL = null;
    if (v !== "inventario") { S.inv = null; S.invQ = ""; }
    if (v !== "reportes") S.rep = null;
    if (v !== "cap") { S.capL = null; S.capD = null; S.capFiltro = ""; }
    if (!(v === "cap" && (arg === "nueva" || arg === "editar"))) S.capEqSel = null;
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
      case "indicadores": html = vIndicadores(); break;
      case "incidente": html = vIncidente(); break;
      case "incidentes": html = vIncidentes(); break;
      case "inventario": html = vInventario(arg); break;
      case "reportes": html = vReportes(); break;
      case "cap": html = vCap(arg, h.split("/")[2]); break;
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
    if (v === "indicadores" && isPro()) bindIndicadores();
    if (v === "incidente") bindIncidente();
    if (v === "incidentes" && isCoord()) bindIncidentes();
    if (v === "inventario" && isCoord()) bindInventario(h0.split("/")[1]);
    if (v === "inicio" || !v) $app.querySelectorAll("[data-tarjeta]").forEach(b => b.addEventListener("click", () => abrirTarjeta(+b.dataset.tarjeta)));
    if (v === "intercesion") { const bs = document.getElementById("bSalida"); if (bs) bs.addEventListener("click", () => confirmarSalida(bs)); }
    if (v === "reportes" && isPro()) bindReportes();
    if (v === "cap" && isPro()) bindCap(h0.split("/")[1], h0.split("/")[2]);
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
    if (!S.token) api("apariencia").then(r => { applyTheme(r.apariencia); if (/ingreso|^$/.test(location.hash.replace("#", ""))) route(); }).catch(() => {});
    if (S.token) {
      if (!S.data) $app.innerHTML = `<div class="loading">${logo(60)}<p>Cargando…</p></div>`;
      else route();
      await cargarInicio();
    }
    route();
    if (S.token) setTimeout(maybeOfferInstall, 1500);
  }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && S.token) cargarInicio().then(ok => { if (ok && !/editar|intercesion|turno|asistencia|config|cap|reportes|indicadores|incidente|inventario/.test(location.hash)) route(); }); });
  if ("serviceWorker" in navigator) {
    const tenia = !!navigator.serviceWorker.controller;
    let recargado = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (tenia && !recargado) { recargado = true; location.reload(); } });
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(r => r.update()).catch(() => {}));
  }
  start();
})();
