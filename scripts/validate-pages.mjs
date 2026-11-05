import { readFileSync } from "node:fs";
import vm from "node:vm";

const employee = readFileSync("index.html", "utf8");
const hr = readFileSync("hr/index.html", "utf8");
const workpulse = readFileSync("workpulse/index.html", "utf8");

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
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index && id !== "mp-app-code" && !id.includes("${"));
  if (duplicates.length) fail(label + ": duplicate DOM ids: " + [...new Set(duplicates)].join(", "));
}

checkDocument("WorkPulse HRMS", workpulse, [
  "<title>WorkPulse HRMS</title>",
  "clock_in",
  "clock_out",
  "calculate_payroll",
  "My payslips",
  "Employee ID",
  "Access PIN",
  'id="hrActivationForm"',
  "workpulse-access",
  "signInWithPassword",
  "showCreateEmployeeAccess",
  "action:'create_employee'",
  "action:'reset_pin'",
  "action:'bootstrap_hr'"
]);
for (const obsolete of [
  "First-time HR setup code",
  "loginSetupCode",
  "signupSetupCode",
  "claimCodePending",
  "claim_first_hr_admin",
  "wp_admin_code"
]) {
  if (workpulse.includes(obsolete)) fail("WorkPulse still contains the removed setup-code flow: " + obsolete);
}

checkDocument("Employee website", employee, [
  "Company Newsletter",
  "newsletter_editions",
  "let publication =",
  "publication={...publication,...data.publication",
  "renderCustomSections(publication)",
  "applySectionVisibility(publication)",
  "newsletter:published-edition-loaded",
  'id="employeeSurvey"',
  'id="company-newsletter-employee-survey"',
  "newsletter_surveys",
  "newsletter_survey_responses",
  'id="surveyRespondentName"',
  'id="surveyRespondentEmail"',
  "respondent_name",
  "respondent_email",
  "surveyIdentityConsent"
]);

if (employee.includes('id="hrWorkspace"') || employee.includes('id="hrLoginModal"')) {
  fail("Employee route must not contain private HR workspace markup.");
}

const loaderStart = employee.indexOf("async function loadLatestPublishedEdition()");
const loaderEnd = employee.indexOf("</script>", loaderStart);
if (loaderStart < 0 || loaderEnd < 0) fail("Employee page is missing the database publication loader.");
const loader = employee.slice(loaderStart, loaderEnd);
for (const marker of [".eq('status','published')", ".order('published_at'", "publication={...publication,...data.publication,", "render();", "window.setInterval", "document.addEventListener('visibilitychange'"]) {
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

function assertStaticDomReferences(label, html) {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  const refs = [];
  for (const match of html.matchAll(/\$\('([^']+)'\)|document\.getElementById\('([^']+)'\)/g)) {
    refs.push(match[1] || match[2]);
  }
  const missing = [...new Set(refs)].filter(id => !ids.has(id));
  if (missing.length) fail(label + ": code references missing DOM ids: " + missing.join(", "));
}
assertStaticDomReferences("Employee website", employee);
assertStaticDomReferences("HR workspace", hr);

function extractRenderer(html) {
  const start = html.indexOf("function render() {");
  const end = html.indexOf("function openStory(", start);
  if (start < 0 || end < 0) fail("A route is missing the publication renderer.");
  return html.slice(start, end)
    .replace(/^\s*if\(\$\('currentIssueStatus'\)\).*?\n/m, "")
    .trim();
}
if (extractRenderer(hr) !== extractRenderer(employee)) {
  fail("HR preview and employee page do not use identical publication rendering logic.");
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
  "Delete section",
  'id="newsletterSurveyManager"',
  'id="surveyQuestionList"',
  'id="surveyActivateBtn"',
  'id="surveyResponsePanel"',
  "newsletter_surveys",
  "newsletter_survey_responses",
  "saveSurvey(mode)",
  "downloadSurveyExcel",
  'id="surveyReportSelect"',
  'id="surveyExportExcelBtn"',
  'id="surveyInsights"',
  'id="surveyRespondentRows"',
  'id="surveyAddClosedBtn"',
  "respondent_email",
  "respondent_name",
  "closed_ended"
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


for (const [label, html] of [["HR workspace", hr], ["Employee website", employee]]) {
  for (const marker of [
    'id="mpTextSmaller"',
    'id="mpTextLarger"',
    'id="mpTextScaleValue"',
    "Decrease text size",
    "Increase text size",
    "monthly-pulse-text-scale-v1",
    "MIN_SCALE=0.8",
    "MAX_SCALE=1.4",
    "MutationObserver",
    "applyMonthlyPulseTextScale"
  ]) {
    if (!html.includes(marker)) fail(label + ": text-size control missing " + marker);
  }
}
for (const [label, html] of [["HR workspace", hr], ["Employee website", employee]]) {
  for (const marker of ['id="employeeSurvey"', 'id="company-newsletter-employee-survey"', "newsletter_surveys", "newsletter_survey_responses", "Submit feedback"]) {
    if (!html.includes(marker)) fail(label + ": employee survey feature missing " + marker);
  }
}
for (const marker of ["LIKERT SCALE · 1 TO 5", "multiple_choice", "open_ended", "closed_ended", "respondent_email", "respondent_name", "Download Excel Workbook (.xlsx)", "downloadSurveyExcel", "Question Analysis", "Written Feedback", "xlsx-0.20.3/package/dist/xlsx.full.min.js", "Survey published successfully."]) {
  if (!hr.includes(marker) && !employee.includes(marker)) fail("Survey workflow check missing " + marker);
}
console.log("Publication sync, survey builder, survey submissions, response monitoring, section management, text sizing, login, and route isolation checks passed.");
console.log("All static and inline-JavaScript checks passed.");
