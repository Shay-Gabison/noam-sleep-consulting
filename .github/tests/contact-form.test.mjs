import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const javascript = await readFile(
  new URL("../../assets/index-hvPKpu13.js", import.meta.url),
  "utf8",
);
const stylesheet = await readFile(
  new URL("../../assets/index-DTIX-nkn.css", import.meta.url),
  "utf8",
);

test("contact fields retain visible associated labels and required markers", () => {
  for (const [id, label] of [
    ["name", "שם מלא"],
    ["phone", "טלפון"],
    ["message", "איך אפשר לעזור?"],
  ]) {
    assert.ok(
      javascript.includes(`label",{htmlFor:"${id}",children:"${label}"}`),
    );
    assert.match(
      javascript,
      new RegExp(`(?:input|textarea)"?,?\\{id:"${id}",name:"${id}"[^}]*required:!0`),
    );
  }

  const visibleLabelRule = stylesheet.lastIndexOf(
    ".contact-form label{position:static;display:block",
  );
  assert.notEqual(visibleLabelRule, -1);
  assert.ok(
    visibleLabelRule >
      stylesheet.lastIndexOf(".contact-form label{position:absolute"),
  );
  assert.ok(
    stylesheet.includes('.contact-form label:after{content:" (חובה)"}'),
  );
});

test("validation still focuses the first invalid field", () => {
  assert.ok(
    javascript.includes(
      'ol.querySelector(`[name="${Object.keys(zl)[0]}"]`)?.focus()',
    ),
  );
  assert.ok(javascript.includes('zl.name="הוסיפו שם מלא'));
  assert.ok(javascript.includes('zl.phone="הוסיפו מספר טלפון'));
  assert.ok(javascript.includes('zl.message="כתבו בקצרה'));
});

test("wide contact form uses flow layout without button overlap", () => {
  const wideRules = stylesheet.slice(
    stylesheet.lastIndexOf("@media(min-width:1600px)"),
  );

  assert.ok(wideRules.includes(".contact-form>div{position:static;width:auto}"));
  assert.ok(
    wideRules.includes(
      ".contact-form .button{position:relative;top:auto;left:auto}",
    ),
  );
  assert.ok(
    wideRules.includes(
      ".contact-form__note{position:static;width:auto;margin:0}",
    ),
  );
  assert.ok(wideRules.includes(".contact-form textarea{min-height:110px}"));
  assert.ok(!wideRules.includes(".contact-form>div{position:absolute"));
});

test("button pseudo-element is contained and cannot intercept pointers", () => {
  assert.ok(
    stylesheet.includes(
      ".contact-form .button{position:relative;overflow:hidden}",
    ),
  );
  assert.ok(
    stylesheet.includes(
      ".contact-form .button:before{max-width:100%;max-height:100%;pointer-events:none}",
    ),
  );
});
