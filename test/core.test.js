const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../js/core.js");

test("uuid v4 format and uniqueness", () => {
  const set = new Set(Array.from({ length: 2000 }, C.uuidv4));
  assert.equal(set.size, 2000);
  for (const u of [...set].slice(0, 50)) assert.match(u, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});
test("uuid v7 embeds time and sorts", () => {
  const a = C.uuidv7(1_700_000_000_000), b = C.uuidv7(1_700_000_000_001);
  assert.ok(a < b);
  assert.equal(C.inspect(a).version, 7);
  assert.equal(C.inspect(a).time, new Date(1_700_000_000_000).toISOString());
});
test("ulid decodes time", () => {
  const u = C.ulid(1_700_000_000_000);
  assert.equal(u.length, 26);
  assert.equal(C.inspect(u).time, new Date(1_700_000_000_000).toISOString());
});
test("nanoid length and alphabet", () => {
  assert.match(C.nanoid(), /^[\w-]{21}$/);
  assert.match(C.nanoid(10, "abc"), /^[abc]{10}$/);
});
test("password includes every chosen class", () => {
  for (let i = 0; i < 50; i++) {
    const p = C.password({ length: 12 });
    assert.equal(p.length, 12);
    assert.ok(/[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p) && /[^\w]/.test(p.replace(/_/g, "")) || /[_]/.test(p));
  }
  assert.ok(!/[Il1O0o]/.test(C.password({ length: 64, noAmbiguous: true })));
  assert.equal(C.entropy("aaaaaaaa").label, "Weak");
});
