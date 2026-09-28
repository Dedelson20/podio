// Pódio — lógica do app. Conteúdo base em data/esportes.js; correções em data/atualizacoes.json
// no formato { "<id do esporte>": { patch: {...campos}, log: [{at, by, changes, sources}], updatedAt } }.
const DATA = window.PODIO_DATA || [];
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem("podio-" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("podio-" + k, JSON.stringify(v)); } catch (e) {} }
};

let filter = store.get("filter", "all"), query = "", current = null, overrides = {};
let favs = new Set(store.get("favs", []));
const ALLOWED = ["desc", "events", "records", "athletes", "promises", "gear", "practice", "rules"];

const merged = d => {
  const o = overrides[d.id]; if (!o || !o.patch) return d;
  const out = { ...d };
  for (const k of ALLOWED) if (o.patch[k] != null) out[k] = o.patch[k];
  return out;
};
const hasBra = d => [...(d.athletes || []), ...(d.promises || [])].some(a => String(a).split("|")[1] === "BRA");
const fmt = iso => { try { return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }); } catch (e) { return iso; } };

function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 2200);
}

function tally() {
  const s = DATA.filter(d => d.s === "verao").length, w = DATA.filter(d => d.s === "inverno").length, n = DATA.filter(d => d.isNew).length;
  $("#tally").innerHTML = `<div><b>${DATA.length}</b><span>esportes</span></div><div class="s"><b>${s}</b><span>verão</span></div><div class="w"><b>${w}</b><span>inverno</span></div><div class="n"><b>${n}</b><span>novos 2028</span></div>`;
}

function visible() {
  const q = query.trim().toLowerCase();
  return DATA.map(merged).filter(d => {
    if (filter === "verao" && d.s !== "verao") return false;
    if (filter === "inverno" && d.s !== "inverno") return false;
    if (filter === "novo" && !d.isNew) return false;
    if (filter === "bra" && !hasBra(d)) return false;
    if (filter === "fav" && !favs.has(d.id)) return false;
    if (filter === "upd" && !overrides[d.id]) return false;
    if (!q) return true;
    return [d.name, d.desc, ...d.events, ...d.athletes, ...d.promises].join(" ").toLowerCase().includes(q);
  });
}

function renderList() {
  document.querySelectorAll("#filters .chip").forEach(b => b.setAttribute("aria-pressed", b.dataset.f === filter));
  const items = visible();
  const emptyMsg = filter === "fav" ? "Nenhum favorito ainda. Toque em “Favoritar” em um esporte." : "Nenhum esporte encontrado.";
  $("#list").innerHTML = items.length ? items.map(d => `<li class="${d.s === "inverno" ? "winter" : ""}"><button data-id="${d.id}" aria-current="${d.id === current}"><span class="bar"></span><span><span class="name">${esc(d.name)}</span><span class="meta">${d.s === "inverno" ? "Inverno" : "Verão"} · desde ${esc(d.since)} ${d.isNew ? '<span class="flag-new">LA 2028</span>' : ""} ${overrides[d.id] ? '<span class="flag-upd" title="Atualizado"></span>' : ""}</span></span>${favs.has(d.id) ? '<span class="star" aria-label="Favorito">★</span>' : ""}</button></li>`).join("") : `<li class="empty">${emptyMsg}</li>`;
}

const people = arr => `<ul class="people">${arr.map(a => { const [n, c, t] = String(a).split("|"); return `<li><span class="noc ${c === "BRA" ? "bra" : ""}">${esc(c || "—")}</span><span><strong>${esc(n)}</strong> <span class="d">${esc(t || "")}</span></span></li>`; }).join("")}</ul>`;
const srcLinks = list => (Array.isArray(list) ? list : []).filter(u => /^https:\/\//.test(u)).map(u => { let h = u; try { h = new URL(u).hostname.replace(/^www\./, ""); } catch (e) {} return `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(h)}</a>`; }).join(", ");

function renderMain() {
  const base = DATA.find(d => d.id === current) || DATA[0]; current = base.id;
  const d = merged(base), ov = overrides[d.id], fav = favs.has(d.id);
  const records = `<dl class="records">${d.records.map(r => { const [k, v] = String(r).split("|"); return `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`; }).join("")}</dl>`;
  const status = [d.s === "inverno" ? "Jogos de Inverno" : "Jogos de Verão", d.isNew ? "Retorna ou estreia em LA 2028" : "", d.id === "breaking" ? "Fora de LA 2028" : ""].filter(Boolean);
  const log = ov && Array.isArray(ov.log) ? ov.log.slice().reverse() : [];
  $("#main").innerHTML = `<article class="entry ${d.s === "inverno" ? "winter" : ""}">
    <div class="entry-head">
      <div><div class="eyebrow">${d.s === "inverno" ? "Esporte de inverno" : "Esporte de verão"}</div><h2>${esc(d.name)}</h2></div>
      <div class="since"><b>${esc(d.since)}</b><span>estreia nos Jogos</span></div>
      <p class="lede">${esc(d.desc)}</p>
      <div class="status">${status.map((s, i) => `<span class="pill ${i > 0 ? "new" : ""}">${esc(s)}</span>`).join("")}</div>
      <div class="actions"><button class="btn ghost" id="favBtn" aria-pressed="${fav}">${fav ? "★ Favorito" : "☆ Favoritar"}</button><button class="btn ghost" id="shareBtn">Compartilhar</button></div>
    </div>
    <div class="updbar">${ov ? `Atualizado em ${fmt(ov.updatedAt)}.` : "Conteúdo base, revisado em setembro de 2026."}</div>
    <div class="grid">
      <section class="block"><h3>Provas</h3><ul class="events">${d.events.map(e => `<li>${esc(e)}</li>`).join("")}</ul></section>
      <section class="block"><h3>Recordes e marcos</h3>${records}</section>
      <section class="block"><h3>Principais atletas</h3>${people(d.athletes)}</section>
      <section class="block"><h3>Promessas para os próximos Jogos</h3>${people(d.promises)}</section>
      <section class="block"><h3>Materiais e equipamentos</h3><ul class="plain">${d.gear.map(g => `<li>${esc(g)}</li>`).join("")}</ul></section>
      <section class="block"><h3>Mudanças de regras</h3>${d.rules && d.rules.length ? `<ul class="plain">${d.rules.map(r => `<li>${esc(r)}</li>`).join("")}</ul>` : `<p class="prose" style="color:var(--muted)">Nenhuma mudança relevante registrada.</p>`}</section>
      <section class="block full"><h3>Como praticar</h3><p class="prose">${esc(d.practice)}</p></section>
      ${log.length ? `<section class="block full"><h3>Histórico de atualizações</h3><ul class="log">${log.map(l => `<li><time>${fmt(l.at)}</time>${(l.changes || []).map(c => esc(c)).join("<br>")}${srcLinks(l.sources) ? `<div class="src">Fontes: ${srcLinks(l.sources)}</div>` : ""}</li>`).join("")}</ul></section>` : ""}
    </div></article>`;
  $("#favBtn").onclick = () => { fav ? favs.delete(d.id) : favs.add(d.id); store.set("favs", [...favs]); renderList(); renderMain(); };
  $("#shareBtn").onclick = () => share(d);
}

async function share(d) {
  const url = location.href.split("#")[0] + "#" + d.id;
  const text = `${d.name} no Pódio: provas, recordes e atletas.`;
  if (navigator.share) { try { await navigator.share({ title: `${d.name} · Pódio`, text, url }); return; } catch (e) { if (e && e.name === "AbortError") return; } }
  try { await navigator.clipboard.writeText(url); toast("Link copiado"); } catch (e) { toast(url); }
}

function select(id) {
  current = id; renderList(); renderMain();
  try { history.replaceState(null, "", "#" + id); } catch (e) {}
  if (window.matchMedia("(max-width:860px)").matches) $("#main").scrollIntoView({ behavior: "smooth", block: "start" });
}

$("#q").addEventListener("input", e => { query = e.target.value; renderList(); });
$("#filters").addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; filter = b.dataset.f; store.set("filter", filter); renderList(); });
$("#list").addEventListener("click", e => { const b = e.target.closest("button[data-id]"); if (b) select(b.dataset.id); });
window.addEventListener("hashchange", () => { const h = location.hash.slice(1); if (h && h !== current && DATA.some(d => d.id === h)) select(h); });

const h = (location.hash || "").slice(1);
current = DATA.some(d => d.id === h) ? h : "atletismo";
tally(); renderList(); renderMain();

// Atualizações semanais
fetch("data/atualizacoes.json", { cache: "no-cache" })
  .then(r => r.ok ? r.json() : {})
  .then(json => { if (json && typeof json === "object") { overrides = json; renderList(); renderMain(); } })
  .catch(() => {});

// Instalação
if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
let deferredPrompt = null;
if (!standalone && !store.get("installDismissed", false)) {
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault(); deferredPrompt = e;
    $("#install").hidden = false; $("#installBtn").hidden = false;
  });
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
    $("#installText").textContent = "Para instalar no iPhone: toque em Compartilhar e depois em “Adicionar à Tela de Início”.";
    $("#install").hidden = false;
  }
}
$("#installBtn").onclick = async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice.catch(() => {}); deferredPrompt = null; $("#install").hidden = true; };
$("#installClose").onclick = () => { $("#install").hidden = true; store.set("installDismissed", true); };
