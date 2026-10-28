import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const javascript = await readFile(
  new URL("../../assets/index-DprMrgAe.js", import.meta.url),
  "utf8",
);
const stylesheet = await readFile(
  new URL("../../assets/index-D1eTWmnV.css", import.meta.url),
  "utf8",
);

test("contact fields retain exact visible labels and required semantics", () => {
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

  assert.ok(
    stylesheet.includes(
      ".contact-form label{display:flex;align-items:baseline",
    ),
  );
  assert.ok(stylesheet.includes(".contact-form label{position:static"));
  assert.ok(!stylesheet.includes(".contact-form label{position:absolute"));
  assert.ok(!stylesheet.includes("(חובה)"));
  assert.ok(!javascript.includes("(חובה)"));
  assert.ok(!javascript.includes("placeholder:"));
});

test("validation still focuses the first invalid field", () => {
  assert.match(
    javascript,
    /querySelector\(`\[name="\$\{Object\.keys\([A-Za-z_$][\w$]*\)\[0\]\}"\]`\)\?\.focus\(\)/,
  );
  assert.ok(javascript.includes("הוסיפו שם מלא"));
  assert.ok(javascript.includes("הוסיפו מספר טלפון"));
  assert.ok(javascript.includes("כתבו בקצרה"));
});

test("Instagram link uses the approved handle and external-link safeguards", () => {
  assert.ok(
    javascript.includes(
      'href:"https://www.instagram.com/noam_gabison_/",target:"_blank",rel:"noopener noreferrer"',
    ),
  );
  assert.ok(
    javascript.includes('className:"contact__value",children:"noam_gabison_"'),
  );
  assert.ok(!javascript.includes("noam_gabison._"));
});

test("wide contact fields and actions retain adaptive flow", () => {
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

  const form = declarationsFor(".contact-form");
  const field = declarationsFor(".contact-form>div");
  const textarea = declarationsFor(".contact-form textarea");
  const button = declarationsFor(".contact-form .button");
  const note = declarationsFor(".contact-form__note");

  assert.equal(form["align-content"], "start");
  assert.equal(form.gap, "16px");
  assert.equal(field.position, "static");
  assert.equal(field.width, "auto");
  assert.equal(textarea["min-height"], "96px");
  assert.notEqual(button.position, "absolute");
  assert.equal(button["min-height"], "65px");
  assert.equal(note.position, "static");
  assert.equal(note.width, "auto");
});

test("textarea remains vertically resizable", () => {
  assert.ok(
    stylesheet.includes(
      ".contact-form textarea{min-height:96px;resize:vertical}",
    ),
  );
});
