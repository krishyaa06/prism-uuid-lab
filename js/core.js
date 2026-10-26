/* Prism UUID Lab · core logic (browser + Node) */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Core = api;
})(typeof self !== "undefined" ? self : this, function () {
  const cr = () => globalThis.crypto || require("crypto").webcrypto;
  const rand = (n) => cr().getRandomValues(new Uint8Array(n));
  const hex = (b) => [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  const fmt = (h) => `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  function uuidv4() { const b = rand(16); b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80; return fmt(hex(b)); }
  function uuidv7(now = Date.now()) {
    const b = rand(16); const ts = BigInt(now);
    for (let i = 0; i < 6; i++) b[i] = Number((ts >> BigInt(8 * (5 - i))) & 0xffn);
    b[6] = (b[6] & 0x0f) | 0x70; b[8] = (b[8] & 0x3f) | 0x80; return fmt(hex(b));
  }
  const URL_ALPHA = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  function nanoid(size = 21, alphabet = URL_ALPHA) {
    const mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1, step = Math.ceil((1.6 * mask * size) / alphabet.length);
    let id = "";
    while (true) { const bytes = rand(step); for (let i = 0; i < step; i++) { const c = alphabet[bytes[i] & mask]; if (c) { id += c; if (id.length === size) return id; } } }
  }
  const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  function ulid(now = Date.now()) {
    let t = now, time = "";
    for (let i = 0; i < 10; i++) { time = CROCKFORD[t % 32] + time; t = Math.floor(t / 32); }
    const r = rand(16); let rnd = ""; for (let i = 0; i < 16; i++) rnd += CROCKFORD[r[i] & 31];
    return time + rnd;
  }
  const SETS = { lower: "abcdefghijklmnopqrstuvwxyz", upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", digits: "0123456789", symbols: "!@#$%^&*()-_=+[]{};:,.?/" };
  const AMBIG = /[Il1O0o]/g;
  function password({ length = 20, lower = true, upper = true, digits = true, symbols = true, noAmbiguous = false } = {}) {
    let pools = Object.entries({ lower, upper, digits, symbols }).filter(([, on]) => on).map(([k]) => (noAmbiguous ? SETS[k].replace(AMBIG, "") : SETS[k]));
    if (!pools.length) pools = [SETS.lower];
    const all = pools.join(""), out = pools.map((p) => p[pick(p.length)]);
    while (out.length < length) out.push(all[pick(all.length)]);
    for (let i = out.length - 1; i > 0; i--) { const j = pick(i + 1); [out[i], out[j]] = [out[j], out[i]]; }
    return out.slice(0, length).join("");
  }
  function pick(n) { const lim = Math.floor(256 / n) * n; let x; do x = rand(1)[0]; while (x >= lim); return x % n; }
  function entropy(pw) {
    let pool = 0;
    if (/[a-z]/.test(pw)) pool += 26; if (/[A-Z]/.test(pw)) pool += 26; if (/\d/.test(pw)) pool += 10; if (/[^a-zA-Z0-9]/.test(pw)) pool += 24;
    const bits = Math.round(pw.length * Math.log2(pool || 1));
    return { bits, label: bits < 40 ? "Weak" : bits < 60 ? "Fair" : bits < 80 ? "Strong" : "Excellent" };
  }
  function inspect(id) {
    const s = id.trim();
    const m = /^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/i.exec(s);
    if (m) {
      const version = parseInt(m[3][0], 16), variant = (parseInt(m[4][0], 16) & 0b1100) === 0b1000 ? "RFC 4122" : "other";
      const info = { kind: "UUID", version, variant };
      if (version === 7) info.time = new Date(parseInt(m[1] + m[2], 16)).toISOString();
      if (s === "00000000-0000-0000-0000-000000000000") info.kind = "Nil UUID";
      return info;
    }
    if (/^[0-9A-HJKMNP-TV-Z]{26}$/i.test(s)) { let t = 0; for (const c of s.slice(0, 10).toUpperCase()) t = t * 32 + CROCKFORD.indexOf(c); return { kind: "ULID", time: new Date(t).toISOString() }; }
    if (/^[\w-]{21}$/.test(s)) return { kind: "Probably a Nano ID" };
    return null;
  }
  return { uuidv4, uuidv7, nanoid, ulid, password, entropy, inspect };
});
