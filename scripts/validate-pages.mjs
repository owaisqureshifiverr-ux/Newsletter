import { readFileSync } from "node:fs";
import vm from "node:vm";

const employee = readFileSync("index.html", "utf8");
const hr = readFileSync("hr/index.html", "utf8");

function check(label, html, required) {
  const fail = (message) => { throw new Error(label + ": " + message); };
  if (!html.trim().toLowerCase().startsWith("<!doctype html>")) fail("missing doctype");
  if (!html.toLowerCase().includes("<title>")) fail("missing title");
  if (!html.toLowerCase().includes("<body")) fail("missing body");
  if (!html.toLowerCase().includes("</body>") || !html.toLowerCase().includes("</html>")) fail("incomplete document");
  if (!html.includes("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2")) fail("Supabase browser client is missing");
  for (const marker of required) if (!html.includes(marker)) fail("missing feature marker: " + marker);

  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  const scripts = [...html.matchAll(scriptRegex)];
  let compiled = 0;
  for (const match of scripts) {
    if (/\bsrc\s*=/.test(match[1]) || !match[2].trim()) continue;
    new vm.Script(match[2], { filename: label + "-inline-" + (++compiled) + ".js" });
  }
  if (!compiled) fail("no inline scripts were syntax-checked");
  console.log(label + ": structure passed; " + compiled + " inline scripts syntax-checked.");
}

check("Employee website", employee, [
  "The Monthly Pulse",
  "newsletter_editions",
  ".eq('status','published')"
]);

if (employee.includes('id="hrWorkspace"') || employee.includes('id="hrLoginModal"')) {
  throw new Error("Employee route must not contain private HR workspace markup.");
}

check("HR workspace", hr, [
  "HR Publishing Studio",
  "hrWorkspace",
  "hrLoginModal",
  'id="hrPassword"',
  "Unlock Workspace",
  "signInWithPassword",
  "saveToCloud",
  "newsletter_editions",
  "hr_admins",
  "data-array-add",
  "data-array-remove"
]);


for (const obsolete of ['id="hrEmail"', 'id="hrBootstrapCode"', 'id="hrCreateAccountBtn"', 'id="hrClaimAdminBtn"', "claim_first_hr_admin"]) {
  if (hr.includes(obsolete)) throw new Error("HR page still exposes obsolete sign-in flow: " + obsolete);
}
console.log("Password-only HR access checks passed.");
console.log("All static checks passed.");
