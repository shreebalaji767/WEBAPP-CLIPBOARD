(() => {
"use strict";
const KEY = "clipboard-workspace-v2", HISTORY_LIMIT = 30;
const state = { snippets: [], bin: [], history: [], query: "", sort: "newest", category: "", favoritesOnly: false, selected: new Set(), editingId: null, theme: "light" };
const $ = (s) => document.querySelector(s);
const list = $("#list"), empty = $("#emptyState"), title = $("#titleInput"), input = $("#textInput"), category = $("#categoryInput"), tags = $("#tagsInput"), search = $("#searchInput"), sort = $("#sortSelect"), count = $("#countLabel"), chars = $("#charCount"), toast = $("#toast"), dialog = $("#editDialog"), form = $("#editForm");
let toastTimer = 0;
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" })[c]); }
function date(v) { try { return new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(v); } catch (_) { return new Date(v).toLocaleString(); } }
function notify(message) { toast.textContent = message; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2400); }
function cleanTags(value) { const a = Array.isArray(value) ? value : String(value || "").split(","); return Array.from(new Set(a.map(x => String(x).trim().replace(/^#/,"").slice(0,30)).filter(Boolean))).slice(0,12); }
function cleanItem(x) {
 if (!x || typeof x !== "object" || typeof x.text !== "string" || x.text.length > 20000) return null;
 return { id: typeof x.id === "string" && x.id ? x.id : uid(), title: String(x.title || "Untitled snippet").slice(0,100), text:x.text, category:String(x.category || "General").trim().slice(0,40) || "General", tags:cleanTags(x.tags), favorite:x.favorite === true, createdAt:Number.isFinite(Number(x.createdAt)) ? Number(x.createdAt) : Date.now(), updatedAt:Number(x.updatedAt) || Number(x.createdAt) || Date.now() };
}
function save() {
 try { localStorage.setItem(KEY,JSON.stringify({version:2,snippets:state.snippets,bin:state.bin,history:state.history.slice(0,HISTORY_LIMIT),theme:state.theme})); return true; }
 catch(e) { notify(e && e.name === "QuotaExceededError" ? "Browser storage is full. Export a backup and remove large items." : "Could not save. Check browser storage permissions."); return false; }
}
function load() {
 try {
  const raw = localStorage.getItem(KEY); if (!raw) return;
  const d = JSON.parse(raw); if (!d || typeof d !== "object") return;
  state.snippets = (Array.isArray(d.snippets) ? d.snippets : []).map(cleanItem).filter(Boolean);
  state.bin = (Array.isArray(d.bin) ? d.bin : []).map(e => { const item = cleanItem(e && e.snippet ? e.snippet : e); return item ? {snippet:item,deletedAt:Number(e && e.deletedAt) || Date.now()} : null; }).filter(Boolean);
  state.history = Array.isArray(d.history) ? d.history.filter(x => x && typeof x.text === "string").slice(0,HISTORY_LIMIT) : [];
  state.theme = ["light","dark","ocean","forest"].includes(d.theme) ? d.theme : "light";
 } catch (_) { notify("Saved data could not be read. Import a backup if available."); }
}
function applyTheme(value) {
 state.theme = ["light","dark","ocean","forest"].includes(value) ? value : "light";
 document.body.classList.toggle("dark",state.theme === "dark"); document.body.dataset.theme = state.theme;
 $("#themeSelect").value = state.theme; $("#themeBtn").textContent = state.theme === "dark" ? "☀" : "☾";
 $("#themeBtn").setAttribute("aria-label",state.theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
}
function filtered() {
 const q = state.query.trim().toLowerCase();
 const a = state.snippets.filter(x => {
  const hay = [x.title,x.text,x.category,x.tags.join(" ")].join(" ").toLowerCase();
  return (!q || hay.includes(q)) && (!state.category || x.category.toLowerCase() === state.category.toLowerCase()) && (!state.favoritesOnly || x.favorite);
 });
 a.sort((x,y) => state.sort === "oldest" ? x.createdAt-y.createdAt : state.sort === "title" ? x.title.localeCompare(y.title,undefined,{sensitivity:"base"}) : state.sort === "longest" ? y.text.length-x.text.length : y.createdAt-x.createdAt);
 return a;
}
function updateCategories() {
 const sel = $("#categoryFilter"), current = state.category;
 const cats = Array.from(new Set(state.snippets.map(x => x.category))).sort((a,b) => a.localeCompare(b));
 sel.innerHTML = '<option value="">All categories</option>' + cats.map(x => '<option value="' + esc(x) + '">' + esc(x) + '</option>').join("");
 sel.value = cats.includes(current) ? current : ""; state.category = sel.value;
}
function render() {
 updateCategories(); const items = filtered();
 count.textContent = items.length + " of " + state.snippets.length + " snippets";
 empty.classList.toggle("hidden",items.length > 0);
 empty.querySelector("h2").textContent = state.snippets.length ? "No matching snippets" : "No snippets yet";
 empty.querySelector("p").textContent = state.snippets.length ? "Try another search or filter." : "Add your first snippet above. Your saved items stay in this browser.";
 list.innerHTML = items.map(x => {
  const tagHtml = x.tags.map(t => '<span class="tag">#' + esc(t) + '</span>').join("");
  return '<article class="snippet' + (x.favorite ? ' is-favorite' : '') + '"><div class="snippet-head"><label class="select-snippet"><input type="checkbox" data-select="' + esc(x.id) + '"' + (state.selected.has(x.id) ? " checked" : "") + ' aria-label="Select snippet"></label><h3 class="snippet-title">' + esc(x.title) + '</h3><time class="snippet-time">' + esc(date(x.createdAt)) + '</time></div><div class="snippet-meta"><span class="category-chip">' + esc(x.category) + '</span>' + tagHtml + '</div><div class="snippet-content">' + esc(x.text) + '</div><div class="snippet-actions"><button class="copy" type="button" data-action="copy" data-id="' + esc(x.id) + '">Copy</button><button type="button" data-action="edit" data-id="' + esc(x.id) + '">Edit</button><button type="button" data-action="duplicate" data-id="' + esc(x.id) + '">Duplicate</button><button type="button" data-action="favorite" data-id="' + esc(x.id) + '">' + (x.favorite ? "★ Unfavorite" : "☆ Favorite") + '</button><button class="danger" type="button" data-action="delete" data-id="' + esc(x.id) + '">Delete</button></div></article>';
 }).join("");
 $("#selectedCount").textContent = state.selected.size + " selected";
 $("#bulkFavoriteBtn").disabled = state.selected.size === 0; $("#bulkDeleteBtn").disabled = state.selected.size === 0;
 $("#selectVisible").checked = items.length > 0 && items.every(x => state.selected.has(x.id));
 $("#binCount").textContent = state.bin.length; $("#historyCount").textContent = state.history.length;
}
function updateChars() { const n = input.value.length; chars.textContent = n.toLocaleString() + " character" + (n === 1 ? "" : "s"); }
function add() {
 const text = input.value.trim(); if (!text) { notify("Enter some text first"); input.focus(); return; }
 state.snippets.unshift(cleanItem({id:uid(),title:title.value.trim() || "Untitled snippet",text,category:category.value.trim() || "General",tags:cleanTags(tags.value),createdAt:Date.now()}));
 title.value = ""; input.value = ""; category.value = ""; tags.value = ""; updateChars(); save(); render(); notify("Snippet saved in this browser"); input.focus();
}
function edit(id) {
 const x = state.snippets.find(v => v.id === id); if (!x) return;
 state.editingId = id; $("#editTitle").value = x.title; $("#editText").value = x.text; $("#editCategory").value = x.category; $("#editTags").value = x.tags.join(", ");
 if (typeof dialog.showModal === "function") dialog.showModal(); else notify("This browser does not support the edit dialog.");
}
function saveEdit(e) {
 e.preventDefault(); const x = state.snippets.find(v => v.id === state.editingId); if (!x) { dialog.close(); return; }
 const text = $("#editText").value.trim(); if (!text) { notify("Content cannot be empty"); $("#editText").focus(); return; }
 x.title = $("#editTitle").value.trim() || "Untitled snippet"; x.text = text; x.category = $("#editCategory").value.trim() || "General"; x.tags = cleanTags($("#editTags").value); x.updatedAt = Date.now();
 state.editingId = null; dialog.close(); save(); render(); notify("Snippet updated");
}
function duplicate(id) {
 const x = state.snippets.find(v => v.id === id); if (!x) return;
 state.snippets.unshift(Object.assign({},x,{id:uid(),title:x.title + " (copy)",tags:x.tags.slice(),favorite:false,createdAt:Date.now(),updatedAt:Date.now()}));
 save(); render(); notify("Snippet duplicated");
}
function moveToBin(ids) {
 const set = new Set(ids), removed = state.snippets.filter(x => set.has(x.id)); if (!removed.length) return;
 removed.forEach(x => state.bin.unshift({snippet:x,deletedAt:Date.now()}));
 state.snippets = state.snippets.filter(x => !set.has(x.id)); removed.forEach(x => state.selected.delete(x.id));
 save(); render(); renderBin(); notify(removed.length + " snippet(s) moved to recycle bin");
}
function removeOne(id) { const x = state.snippets.find(v => v.id === id); if (x && confirm('Move "' + x.title + '" to the recycle bin?')) moveToBin([id]); }
function clearAll() { if (!state.snippets.length) { notify("Workspace is already empty"); return; } if (confirm("Move all snippets to the recycle bin? You can restore them later.")) moveToBin(state.snippets.map(x => x.id)); }
function favorite(id) { const x = state.snippets.find(v => v.id === id); if (x) { x.favorite = !x.favorite; save(); render(); } }
function copyText(text, label) {
 state.history.unshift({title:label || "Copied text",text,copiedAt:Date.now()}); state.history = state.history.slice(0,HISTORY_LIMIT); save(); render();
 const fallback = () => { const a=document.createElement("textarea"); a.value=text; a.style.position="fixed"; a.style.left="-9999px"; document.body.appendChild(a); a.focus(); a.select(); let ok=false; try { ok=document.execCommand("copy"); } catch(_) {} a.remove(); notify(ok ? "Copied to clipboard" : "Copy failed — select text manually"); };
 if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(() => notify("Copied to clipboard")).catch(fallback); else fallback();
}
function insertText(value) { input.setRangeText(value,input.selectionStart,input.selectionEnd,"end"); input.focus(); updateChars(); }
function renderBin() {
 $("#binList").innerHTML = state.bin.length ? state.bin.map((e,i) => '<div class="bin-row"><div><strong>' + esc(e.snippet.title) + '</strong><small>' + esc(date(e.deletedAt)) + '</small></div><button type="button" data-restore="' + i + '">Restore</button><button class="danger" type="button" data-purge="' + i + '">Delete forever</button></div>').join("") : '<p class="muted">Your recycle bin is empty.</p>';
 $("#binCount").textContent = state.bin.length;
}
function renderHistory() {
 $("#historyList").innerHTML = state.history.length ? state.history.map((e,i) => '<div class="history-row"><div><strong>' + esc(e.title) + '</strong><small>' + esc(date(e.copiedAt)) + '</small></div><button type="button" data-history-copy="' + i + '">Copy again</button></div>').join("") : '<p class="muted">Nothing copied yet.</p>';
 $("#historyCount").textContent = state.history.length;
}
function exportBackup() {
 const data = {app:"WEBAPP-CLIPBOARD",version:2,exportedAt:new Date().toISOString(),snippets:state.snippets,bin:state.bin,history:state.history};
 const url = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"})), a=document.createElement("a");
 a.href=url; a.download="clipboard-backup-" + new Date().toISOString().slice(0,10) + ".json"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); notify("Backup exported");
}
function importBackup(file) {
 if (!file) return; const reader = new FileReader();
 reader.onload = () => {
  try {
   const d=JSON.parse(String(reader.result || "")); if (!d || typeof d !== "object" || !Array.isArray(d.snippets)) throw new Error("Invalid backup format");
   const incoming=d.snippets.map(cleanItem); if (incoming.some(x => !x)) throw new Error("Backup contains invalid snippets");
   const trash=Array.isArray(d.bin) ? d.bin.map(e => { const x=cleanItem(e && e.snippet ? e.snippet : e); return x ? {snippet:x,deletedAt:Number(e && e.deletedAt) || Date.now()} : null; }).filter(Boolean) : [];
   if (!confirm("Import " + incoming.length + " snippets? Existing snippets will be kept.")) return;
   const ids=new Set(state.snippets.map(x => x.id)); incoming.forEach(x => { if(ids.has(x.id)) x.id=uid(); ids.add(x.id); });
   state.snippets=incoming.concat(state.snippets); state.bin=trash.concat(state.bin); save(); render(); renderBin(); notify("Backup imported successfully");
  } catch(e) { notify(e.message || "Could not import this backup"); }
  $("#importFile").value="";
 };
 reader.onerror=() => notify("Could not read the backup file"); reader.readAsText(file);
}
$("#addBtn").addEventListener("click",add);
input.addEventListener("input",updateChars);
input.addEventListener("keydown",e => { if((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); add(); } });
search.addEventListener("input",e => { state.query=e.target.value; render(); });
sort.addEventListener("change",e => { state.sort=e.target.value; render(); });
$("#categoryFilter").addEventListener("change",e => { state.category=e.target.value; render(); });
$("#favoritesOnly").addEventListener("change",e => { state.favoritesOnly=e.target.checked; render(); });
form.addEventListener("submit",saveEdit); dialog.addEventListener("close",() => { state.editingId=null; });
list.addEventListener("click",e => {
 const b=e.target.closest("button[data-action]"); if(!b) return; const id=b.dataset.id, action=b.dataset.action;
 if(action==="copy") { const x=state.snippets.find(v => v.id===id); if(x) copyText(x.text,x.title); }
 if(action==="edit") edit(id); if(action==="duplicate") duplicate(id); if(action==="favorite") favorite(id); if(action==="delete") removeOne(id);
});
list.addEventListener("change",e => { const id=e.target.dataset.select; if(!id) return; if(e.target.checked) state.selected.add(id); else state.selected.delete(id); render(); });
$("#clearAllBtn").addEventListener("click",clearAll);
$("#themeBtn").addEventListener("click",() => { applyTheme(state.theme==="dark" ? "light" : "dark"); save(); });
$("#themeSelect").addEventListener("change",e => { applyTheme(e.target.value); save(); });
document.querySelectorAll("[data-insert]").forEach(b => b.addEventListener("click",() => insertText(b.dataset.insert)));
$("#exportBtn").addEventListener("click",exportBackup);
$("#importBtn").addEventListener("click",() => $("#importFile").click());
$("#importFile").addEventListener("change",e => importBackup(e.target.files[0]));
$("#selectVisible").addEventListener("change",e => { filtered().forEach(x => e.target.checked ? state.selected.add(x.id) : state.selected.delete(x.id)); render(); });
$("#bulkDeleteBtn").addEventListener("click",() => { if(state.selected.size && confirm("Move selected snippets to the recycle bin?")) moveToBin(Array.from(state.selected)); });
$("#bulkFavoriteBtn").addEventListener("click",() => { state.snippets.forEach(x => { if(state.selected.has(x.id)) x.favorite=true; }); save(); render(); notify("Selected snippets favorited"); });
$("#historyBtn").addEventListener("click",() => { $("#historyPanel").hidden=!$("#historyPanel").hidden; $("#binPanel").hidden=true; renderHistory(); });
$("#binBtn").addEventListener("click",() => { $("#binPanel").hidden=!$("#binPanel").hidden; $("#historyPanel").hidden=true; renderBin(); });
document.querySelectorAll("[data-close-panel]").forEach(b => b.addEventListener("click",() => { $("#" + b.dataset.closePanel).hidden=true; }));
$("#historyList").addEventListener("click",e => { const b=e.target.closest("[data-history-copy]"); if(b) { const x=state.history[Number(b.dataset.historyCopy)]; if(x) copyText(x.text,x.title); } });
$("#clearHistoryBtn").addEventListener("click",() => { state.history=[]; save(); renderHistory(); render(); notify("Copy history cleared"); });
$("#binList").addEventListener("click",e => {
 const r=e.target.closest("[data-restore]"), p=e.target.closest("[data-purge]");
 if(r) { const entry=state.bin.splice(Number(r.dataset.restore),1)[0]; if(entry) { state.snippets.unshift(entry.snippet); save(); render(); renderBin(); notify("Snippet restored"); } }
 if(p) { const i=Number(p.dataset.purge); if(confirm("Permanently delete this snippet?")) { state.bin.splice(i,1); save(); renderBin(); render(); } }
});
$("#emptyBinBtn").addEventListener("click",() => { if(!state.bin.length) { notify("Recycle bin is already empty"); return; } if(confirm("Permanently delete every item in the recycle bin? This cannot be undone.")) { state.bin=[]; save(); renderBin(); render(); notify("Recycle bin emptied"); } });
document.addEventListener("keydown",e => {
 if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==="k") { e.preventDefault(); search.focus(); }
 if((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase()==="e") { e.preventDefault(); exportBackup(); }
});
load(); applyTheme(state.theme); updateChars(); render(); renderBin();
})();