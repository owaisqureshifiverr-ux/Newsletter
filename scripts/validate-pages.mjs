import { readFileSync } from "node:fs";
import vm from "node:vm";

const employee = readFileSync("index.html", "utf8");
const hr = readFileSync("hr/index.html", "utf8");

function fail(message) { throw new Error(message); }

function checkDocument(label, html, required) {
  if (!html.trim().toLowerCase().startsWith("<!doctype html>")) fail(label + ": missing doctype");
  if (!html.toLowerCase().includes("<title>")) fail(label + ": missing title");
  if (!html.toLowerCase().includes("<body")) fail(label + ": missing body");
  if (!html.toLowerCase().includes("</body>") || !html.toLowerCase().includes("</html>")) fail(label + ": incomplete document");
  for (const marker of required) if (!html.includes(marker)) fail(label + ": missing feature marker " + marker);

  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  const scripts = [...html.matchAll(scriptRegex)];
  let compiled = 0;
  for (const match of scripts) {
    if (/\bsrc\s*=/.test(match[1]) || !match[2].trim()) continue;
    new vm.Script(match[2], { filename: label.replace(/\s+/g, "-") + "-inline-" + (++compiled) + ".js" });
  }
  if (!compiled) fail(label + ": no inline scripts were syntax-checked");
  console.log(label + ": structure passed; " + compiled + " inline scripts syntax-checked.");

  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index && id !== "mp-app-code");
  if (duplicates.length) fail(label + ": duplicate DOM ids: " + [...new Set(duplicates)].join(", "));
}

checkDocument("Employee website", employee, [
  "The Monthly Pulse",
  "newsletter_editions",
  "let publication =",
  "publication={...publication,...data.publication",
  "renderCustomSections(publication)",
  "applySectionVisibility(publication)",
  "newsletter:published-edition-loaded"
]);

if (employee.includes('id="hrWorkspace"') || employee.includes('id="hrLoginModal"')) {
  fail("Employee route must not contain private HR workspace markup.");
}

const loaderStart = employee.indexOf("async function loadLatestPublishedEdition()");
const loaderEnd = employee.indexOf("</script>", loaderStart);
if (loaderStart < 0 || loaderEnd < 0) fail("Employee page is missing the database publication loader.");
const loader = employee.slice(loaderStart, loaderEnd);
for (const marker of [".eq('status','published')", ".order('published_at'", "publication={...publication,...data.publication}", "render();"]) {
  if (!loader.includes(marker)) fail("Employee publication loader is missing: " + marker);
}
for (const obsolete of ["highlightsList", "heroImage'", "hcmImage'"]) {
  if (loader.includes(obsolete)) fail("Employee publication loader still targets an obsolete element: " + obsolete);
}

const sectionKeys = ["hero","hcm","inside","latest","businessInnovation","peopleCulture","international","spotlight","comingUp","closing","footer"];
for (const key of sectionKeys) {
  if (!hr.includes(`{key:'${key}'`)) fail("HR Section Manager is missing " + key);
  if (!hr.includes(key + ":document.getElementById")) fail("Section visibility map is missing " + key);
}
for (const attr of [
  "data-section-remove","data-section-restore","data-custom-section-add",
  "data-custom-section-remove","data-custom-item-add","data-custom-item-remove",
  "function createCustomSection()","function renderCustomSections(data)",
  "function applySectionVisibility(data)"
]) {
  if (!hr.includes(attr)) fail("HR section-management control is missing: " + attr);
}
for (const field of ["highlights","businessInnovation","peopleCulture","international","spotlight","comingUp"]) {
  if (!hr.includes(field) || !employee.includes("publication." + field)) fail("Publication field is not connected to both pages: " + field);
}

checkDocument("HR workspace", hr, [
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
  "data-array-remove",
  "Section Manager",
  "Add New Section",
  "Delete section"
]);

for (const obsolete of ['id="hrEmail"', 'id="hrBootstrapCode"', 'id="hrCreateAccountBtn"', 'id="hrClaimAdminBtn"', "claim_first_hr_admin"]) {
  if (hr.includes(obsolete)) fail("HR page still exposes obsolete sign-in flow: " + obsolete);
}

const saveStart = hr.indexOf("async function saveToCloud");
const publishEnd = hr.indexOf("function compressImageFile", saveStart);
const saveBlock = hr.slice(saveStart, publishEnd);
if (!saveBlock.includes("return true;") || !saveBlock.includes("return false;") || !saveBlock.includes("if(published)")) {
  fail("Save/publish flow must report success or failure before claiming publication.");
}

console.log("Publication sync, section management, login, and route isolation checks passed.");
console.log("All static and inline-JavaScript checks passed.");
