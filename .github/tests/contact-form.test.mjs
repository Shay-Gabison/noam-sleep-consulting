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

test("wide contact form and section expand with a resized textarea", () => {
  const wideRules = stylesheet.slice(
    stylesheet.indexOf("@media(min-width:1600px)"),
  );
  const declarationsFor = (selector) => {
    const declarations = {};
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    for (const match of wideRules.matchAll(
      new RegExp(`${escapedSelector}\\{([^{}]*)\\}`, "g"),
    )) {
      for (const declaration of match[1].split(";")) {
        const separator = declaration.indexOf(":");
        if (separator === -1) continue;
        declarations[declaration.slice(0, separator)] = declaration.slice(
          separator + 1,
        );
      }
    }

    return declarations;
  };

  const section = declarationsFor(".contact.visual-screen");
  const grid = declarationsFor(".contact__grid");
  const form = declarationsFor(".contact-form");
  const field = declarationsFor(".contact-form>div");
  const textarea = declarationsFor(".contact-form textarea");
  const button = declarationsFor(".contact-form .button");
  const note = declarationsFor(".contact-form__note");

  assert.equal(section["overflow-x"], "clip");
  assert.equal(section["overflow-y"], "visible");
  assert.equal(grid.height, "auto");
  assert.equal(grid["min-height"], "944px");
  assert.equal(grid["align-items"], "start");
  assert.notEqual(form.position, "absolute");
  assert.equal(form.top, "auto");
  assert.equal(form.right, "auto");
  assert.equal(field.position, "static");
  assert.equal(textarea["min-height"], "110px");
  assert.notEqual(button.position, "absolute");
  assert.equal(note.position, "static");
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
