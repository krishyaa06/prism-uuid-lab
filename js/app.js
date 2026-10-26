(() => {
  const { $, copy, store, esc, tabs } = Prism;
  let kind = store.get("uuid:kind", "uuidv4"), ids = [];
  document.querySelectorAll("#kind button").forEach((b) => b.classList.toggle("on", b.dataset.v === kind));
  const make = () => { let v = kind === "nanoid" ? Core.nanoid(+$("#size").value || 21) : Core[kind](); if (kind.startsWith("uuid")) { if ($("#nodash").checked) v = v.replace(/-/g, ""); if ($("#upper").checked) v = v.toUpperCase(); } return v; };
  function gen() {
    store.set("uuid:kind", kind);
    $("#nlen").hidden = kind !== "nanoid";
    const n = Math.min(500, Math.max(1, +$("#count").value || 1));
    ids = Array.from({ length: n }, make); $("#one").textContent = ids[0]; $("#list").textContent = ids.join("\n");
  }
  function pw() {
    const p = Core.password({ length: +$("#len").value, lower: $("#pl").checked, upper: $("#pu").checked, digits: $("#pd").checked, symbols: $("#ps").checked, noAmbiguous: $("#pa").checked });
    $("#pw").textContent = p; $("#lenV").textContent = $("#len").value;
    const e = Core.entropy(p); $("#strength").className = "pill " + ({ Weak: "bad", Fair: "warn", Strong: "ok", Excellent: "acc" }[e.label]); $("#strength").textContent = `${e.label} · ${e.bits} bits`;
  }
  function inspect() {
    const v = $("#ins").value.trim(); if (!v) { $("#insOut").innerHTML = ""; return; }
    const r = Core.inspect(v);
    $("#insOut").innerHTML = r ? Object.entries(r).map(([k, x]) => `<span class="pill ${k === "kind" ? "acc" : ""}">${esc(k)}: ${esc(x)}</span>`).join("") : '<span class="pill bad">Not a recognised UUID / ULID</span>';
  }
  tabs($("#kind"), (v) => { kind = v; gen(); });
  ["#count", "#upper", "#nodash", "#size"].forEach((id) => $(id).addEventListener("change", gen));
  $("#gen").onclick = gen;
  $("#one").onclick = () => copy(ids[0]);
  $("#copyAll").onclick = () => copy(ids.join("\n"), `Copied ${ids.length} IDs`);
  $("#json").onclick = () => copy(JSON.stringify(ids, null, 2));
  ["#len", "#pl", "#pu", "#pd", "#ps", "#pa"].forEach((id) => $(id).addEventListener("input", pw));
  $("#regen").onclick = pw; $("#pw").onclick = $("#copyPw").onclick = () => copy($("#pw").textContent, "Password copied");
  $("#ins").addEventListener("input", inspect);
  gen(); pw(); $("#ins").value = Core.uuidv7(); inspect();
})();
