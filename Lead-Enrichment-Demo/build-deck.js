const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625
pres.author = "Stephen Ellington";
pres.title = "Building a Lead Enrichment Pipeline with LLM Agents";

// ---- palette ----
const DARK = "0E1A2B";   // dark navy bg
const DARK2 = "16263C";  // panel on dark
const INK = "1B2A41";    // dark text
const AMBER = "E8A04C";  // warm accent (coffee/lead-gen)
const TEAL = "1F8A8A";   // systems accent
const MUTED = "6B7A90";  // muted gray
const PANEL = "F3F6F9";  // light panel
const LINE = "DCE3EA";   // hairline
const WHITE = "FFFFFF";

const HF = "Georgia";     // header font
const BF = "Calibri";     // body font

const mkShadow = () => ({ type: "outer", color: "000000", blur: 7, offset: 3, angle: 135, opacity: 0.12 });

// stage motif pills
const STAGES = ["Discover", "Enrich", "Score", "Gate", "Learn"];
function stageStrip(slide, y, activeIdx, onDark) {
  const w = 1.62, gap = 0.12, startX = 0.5;
  STAGES.forEach((s, i) => {
    const x = startX + i * (w + gap);
    const active = i === activeIdx;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w, h: 0.42, rectRadius: 0.06,
      fill: { color: active ? AMBER : (onDark ? DARK2 : PANEL) },
      line: { color: active ? AMBER : (onDark ? "2A3C56" : LINE), width: 1 },
    });
    slide.addText(s, {
      x, y, w, h: 0.42, align: "center", valign: "middle", margin: 0,
      fontFace: BF, fontSize: 11, bold: active,
      color: active ? INK : (onDark ? "9FB0C6" : MUTED),
    });
    if (i < STAGES.length - 1) {
      slide.addText(">", {
        x: x + w - 0.02, y, w: gap + 0.04, h: 0.42, align: "center", valign: "middle",
        margin: 0, fontFace: BF, fontSize: 10, color: onDark ? "3D5070" : "B6C2CE",
      });
    }
  });
}

function header(slide, chip, chipColor, title) {
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 0.42, w: 0.13, h: 0.55, fill: { color: chipColor } });
  slide.addText(chip, { x: 0.72, y: 0.4, w: 9, h: 0.3, margin: 0, fontFace: BF, fontSize: 12, bold: true, color: chipColor, charSpacing: 2 });
  slide.addText(title, { x: 0.72, y: 0.66, w: 8.8, h: 0.62, margin: 0, fontFace: HF, fontSize: 27, bold: true, color: INK });
}
function footer(slide, n) {
  slide.addText("Novara Fertility · EvoNexus AI Meetup", { x: 0.5, y: 5.28, w: 6, h: 0.25, margin: 0, fontFace: BF, fontSize: 9, color: MUTED });
  slide.addText(String(n), { x: 9.2, y: 5.28, w: 0.5, h: 0.25, margin: 0, align: "right", fontFace: BF, fontSize: 9, color: MUTED });
}
function card(slide, x, y, w, h, fill, lineColor) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: lineColor || LINE, width: 1 }, shadow: mkShadow() });
}

let N = 0;
const slides = [];
function newSlide(bg) { N++; const s = pres.addSlide(); s.background = { color: bg || WHITE }; slides.push(s); return s; }

/* ============ 1. TITLE ============ */
{
  const s = newSlide(DARK);
  // subtle corner accent
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: 5.625, fill: { color: AMBER } });
  s.addText("WORKING SESSION", { x: 0.7, y: 0.95, w: 8, h: 0.3, margin: 0, fontFace: BF, fontSize: 13, bold: true, color: AMBER, charSpacing: 4 });
  s.addText("Building a Lead Enrichment\nPipeline with LLM Agents", { x: 0.66, y: 1.35, w: 9, h: 1.9, margin: 0, fontFace: HF, fontSize: 41, bold: true, color: WHITE, lineSpacingMultiple: 1.02 });
  s.addText([
    { text: "Relating the tactical (sales) to the technical (LLM systems)", options: { color: "C7D3E2" } },
    { text: ", modeled on Novara's production pipeline", options: { color: TEAL, bold: true } },
  ], { x: 0.7, y: 3.35, w: 8.8, h: 0.5, margin: 0, fontFace: BF, fontSize: 15 });
  stageStrip(s, 4.35, -1, true);
  s.addText("Stephen Ellington  ·  Founder/CEO, Novara Fertility", { x: 0.7, y: 5.0, w: 8.8, h: 0.3, margin: 0, fontFace: BF, fontSize: 11, color: "8597AD" });
}

/* ============ 2. THESIS ============ */
{
  const s = newSlide(WHITE);
  header(s, "THE PROBLEM", AMBER, "The job we're automating: the SDR research loop");
  const items = [
    ["Who are the accounts?", "Find clinics (or coffee shops) that might buy"],
    ["Who's the right human?", "The operational buyer, not the figurehead"],
    ["Are they even a fit?", "Qualify against an ideal-customer definition"],
    ["What do we say?", "A reason THIS account should care, in their words"],
  ];
  let y = 1.45;
  items.forEach((it, i) => {
    card(s, 0.5, y, 4.35, 0.82, PANEL);
    s.addText(`${i + 1}`, { x: 0.66, y: y + 0.16, w: 0.5, h: 0.5, margin: 0, align: "center", valign: "middle", fontFace: HF, fontSize: 22, bold: true, color: AMBER });
    s.addText(it[0], { x: 1.2, y: y + 0.12, w: 3.5, h: 0.3, margin: 0, fontFace: BF, fontSize: 14, bold: true, color: INK });
    s.addText(it[1], { x: 1.2, y: y + 0.42, w: 3.55, h: 0.32, margin: 0, fontFace: BF, fontSize: 11.5, color: MUTED });
    y += 0.92;
  });
  // big quote card
  card(s, 5.15, 1.45, 4.35, 3.38, DARK, DARK);
  s.addText("The thesis", { x: 5.4, y: 1.65, w: 3.8, h: 0.3, margin: 0, fontFace: BF, fontSize: 12, bold: true, color: AMBER, charSpacing: 2 });
  s.addText([
    { text: "We didn't build an AI that does sales.\n\n", options: { color: WHITE, bold: true, fontSize: 19 } },
    { text: "We built a ", options: { color: "C7D3E2", fontSize: 16 } },
    { text: "state machine", options: { color: TEAL, bold: true, fontSize: 16 } },
    { text: " an AI operates inside ", options: { color: "C7D3E2", fontSize: 16 } },
    { text: "guardrails", options: { color: AMBER, bold: true, fontSize: 16 } },
    { text: ", with a ", options: { color: "C7D3E2", fontSize: 16 } },
    { text: "human holding the pen", options: { color: WHITE, bold: true, fontSize: 16 } },
    { text: " on the one irreversible step.", options: { color: "C7D3E2", fontSize: 16 } },
  ], { x: 5.4, y: 2.05, w: 3.9, h: 2.6, margin: 0, fontFace: HF, lineSpacingMultiple: 1.05 });
  footer(s, N);
}

/* ============ 3. VOCAB ============ */
{
  const s = newSlide(WHITE);
  header(s, "SHARED LANGUAGE", TEAL, "Sales vocabulary, mapped to the system");
  const rows = [
    ["Lead", "A shop that MIGHT buy", "A row in state 'To Research'"],
    ["Prospect", "A lead worth pursuing", "A scored lead past the threshold"],
    ["ICP", "Who we sell to", "A weighted scoring rubric"],
    ["Champion", "Feels the pain, advocates", "Entry-point role label"],
    ["Gatekeeper", "Screens access", "Route-around role label"],
    ["Enrichment", "Filling in missing facts", "The model + tools job"],
    ["Dedup", "Don't re-add what we have", "A correctness gate"],
    ["Cadence", "The scripted outreach sequence", "Downstream of this pipeline"],
  ];
  const tbl = [[
    { text: "Term", options: { fill: { color: INK }, color: WHITE, bold: true, fontFace: BF, fontSize: 12, align: "left", valign: "middle" } },
    { text: "Sales meaning", options: { fill: { color: INK }, color: WHITE, bold: true, fontFace: BF, fontSize: 12, valign: "middle" } },
    { text: "In the system", options: { fill: { color: INK }, color: WHITE, bold: true, fontFace: BF, fontSize: 12, valign: "middle" } },
  ]];
  rows.forEach((r, i) => {
    const f = i % 2 ? PANEL : WHITE;
    tbl.push([
      { text: r[0], options: { fill: { color: f }, color: AMBER, bold: true, fontFace: BF, fontSize: 12.5, valign: "middle" } },
      { text: r[1], options: { fill: { color: f }, color: INK, fontFace: BF, fontSize: 12, valign: "middle" } },
      { text: r[2], options: { fill: { color: f }, color: TEAL, fontFace: BF, fontSize: 12, valign: "middle" } },
    ]);
  });
  s.addTable(tbl, { x: 0.5, y: 1.5, w: 9, colW: [1.7, 3.65, 3.65], rowH: 0.38, border: { type: "solid", pt: 0.5, color: LINE }, margin: [3, 6, 3, 6] });
  footer(s, N);
}

/* ============ 4. AGENDA: 5 QUESTIONS ============ */
{
  const s = newSlide(WHITE);
  header(s, "THE ARC", AMBER, "Five questions, answered twice (sales, then systems)");
  const qs = [
    ["1", "What is a lead, and what states can it be in?", "State machine + memory", TEAL],
    ["2", "How do we fill in what we don't know?", "Enrichment", AMBER],
    ["3", "What does the agent actually call?", "Tools", TEAL],
    ["4", "How do we stop it doing something dumb?", "Gates", AMBER],
    ["5", "Where does the human sit?", "Human-in-the-loop + learning", TEAL],
  ];
  let y = 1.5;
  qs.forEach((q) => {
    card(s, 0.5, y, 9, 0.66, WHITE);
    s.addShape(pres.shapes.OVAL, { x: 0.66, y: y + 0.13, w: 0.4, h: 0.4, fill: { color: q[3] } });
    s.addText(q[0], { x: 0.66, y: y + 0.13, w: 0.4, h: 0.4, margin: 0, align: "center", valign: "middle", fontFace: HF, fontSize: 17, bold: true, color: WHITE });
    s.addText(q[1], { x: 1.25, y, w: 5.9, h: 0.66, margin: 0, valign: "middle", fontFace: BF, fontSize: 14.5, color: INK });
    s.addText(q[2], { x: 7.15, y, w: 2.3, h: 0.66, margin: 0, valign: "middle", align: "right", fontFace: BF, fontSize: 12.5, bold: true, color: q[3] });
    y += 0.76;
  });
  footer(s, N);
}

/* ============ 5. Q1 CORE MEMORY ============ */
{
  const s = newSlide(WHITE);
  header(s, "1 · CORE MEMORY", TEAL, "The system's memory lives outside the model");
  // two memory layers
  card(s, 0.5, 1.5, 4.5, 1.85, PANEL);
  s.addText("STATE memory  →  databases", { x: 0.7, y: 1.62, w: 4.1, h: 0.3, margin: 0, fontFace: BF, fontSize: 13, bold: true, color: TEAL });
  s.addText([
    { text: "Pipeline stage, contacts, scores, signals.\n", options: {} },
    { text: "Authoritative, changes daily. ", options: {} },
    { text: "Queried fresh every run, never 'remembered.'", options: { bold: true, color: INK } },
  ], { x: 0.7, y: 1.98, w: 4.1, h: 1.25, margin: 0, fontFace: BF, fontSize: 12.5, color: MUTED, lineSpacingMultiple: 1.05 });

  card(s, 5.0, 1.5, 4.5, 1.85, PANEL);
  s.addText("NARRATIVE memory  →  markdown", { x: 5.2, y: 1.62, w: 4.1, h: 0.3, margin: 0, fontFace: BF, fontSize: 13, bold: true, color: AMBER });
  s.addText([
    { text: "Positioning, what worked, methodology.\n", options: {} },
    { text: "Durable, slow-changing. ", options: {} },
    { text: "Injected on demand for context.", options: { bold: true, color: INK } },
  ], { x: 5.2, y: 1.98, w: 4.1, h: 1.25, margin: 0, fontFace: BF, fontSize: 12.5, color: MUTED, lineSpacingMultiple: 1.05 });

  // databases row
  s.addText("The state lives in 5 real databases:", { x: 0.5, y: 3.55, w: 9, h: 0.3, margin: 0, fontFace: BF, fontSize: 12, bold: true, color: INK });
  const dbs = ["Clinic Outreach\n(accounts)", "Sales Contacts\n(humans)", "Market Intel\n(signals)", "Cron Runs\n(learning log)", "Cases\n(work queue)"];
  const w = 1.76, gap = 0.07; let x = 0.5;
  dbs.forEach((d) => {
    card(s, x, 3.9, w, 0.78, DARK, DARK);
    s.addText(d, { x, y: 3.9, w, h: 0.78, margin: 0, align: "center", valign: "middle", fontFace: BF, fontSize: 10.5, color: "DCE6F2", lineSpacingMultiple: 0.95 });
    x += w + gap;
  });
  s.addText("Status is the gate: a clinic in 'In Discussion' is off-limits to the cold pipeline. The schema's enums constrain what the model can write.", { x: 0.5, y: 4.82, w: 9, h: 0.35, margin: 0, fontFace: BF, fontSize: 11.5, italic: true, color: TEAL });
  footer(s, N);
}

/* ============ 6. Q1b DEFINITIONS AS MODULES ============ */
{
  const s = newSlide(WHITE);
  header(s, "1 · CORE MEMORY", TEAL, "Definitions = injectable context modules");
  // left: the file tree
  card(s, 0.5, 1.5, 3.95, 3.32, DARK, DARK);
  s.addText("definitions/", { x: 0.72, y: 1.66, w: 3.6, h: 0.3, margin: 0, fontFace: "Consolas", fontSize: 13, bold: true, color: AMBER });
  const files = [
    ["lead.md", "what a lead IS"],
    ["prospect.md", "the promotion rule"],
    ["icp.md", "ICP as a rubric"],
    ["buyer-roles.md", "champion / gatekeeper…"],
    ["state-machine.md", "states + transitions"],
    ["glossary.md", "shared vocabulary"],
  ];
  let y = 2.05;
  files.forEach((f) => {
    s.addText([
      { text: f[0], options: { color: "9FE7E0", fontFace: "Consolas", fontSize: 12, bold: true } },
      { text: "  " + f[1], options: { color: "8597AD", fontFace: BF, fontSize: 11 } },
    ], { x: 0.95, y, w: 3.4, h: 0.34, margin: 0 });
    y += 0.44;
  });

  // right: why
  s.addText("Don't write one giant system prompt.", { x: 4.7, y: 1.5, w: 4.8, h: 0.35, margin: 0, fontFace: HF, fontSize: 16, bold: true, color: INK });
  const why = [
    ["Inject only what the worker needs", "The scoring worker gets icp.md; the contact worker gets buyer-roles.md. Neither carries the other's baggage."],
    ["Editable, versioned units", "Learn 'we mis-score chains' → edit ONE file. The eval loop's governance edits this same surface."],
    ["The ICP file is a rubric, not prose", "Its format enforces the determinism boundary: the model retrieves facts, code computes the score."],
  ];
  y = 2.0;
  why.forEach((wv, i) => {
    s.addShape(pres.shapes.OVAL, { x: 4.7, y: y + 0.02, w: 0.32, h: 0.32, fill: { color: i % 2 ? AMBER : TEAL } });
    s.addText(String(i + 1), { x: 4.7, y: y + 0.02, w: 0.32, h: 0.32, margin: 0, align: "center", valign: "middle", fontFace: BF, fontSize: 13, bold: true, color: WHITE });
    s.addText(wv[0], { x: 5.12, y: y - 0.04, w: 4.4, h: 0.3, margin: 0, fontFace: BF, fontSize: 13, bold: true, color: INK });
    s.addText(wv[1], { x: 5.12, y: y + 0.27, w: 4.4, h: 0.62, margin: 0, fontFace: BF, fontSize: 11, color: MUTED, lineSpacingMultiple: 1.0 });
    y += 0.96;
  });
  s.addText("LLM best practice: progressive disclosure / just-in-time context.", { x: 0.5, y: 4.95, w: 9, h: 0.3, margin: 0, fontFace: BF, fontSize: 11.5, italic: true, color: TEAL });
  footer(s, N);
}

/* ============ 7. Q2 ENRICHMENT ARCHITECTURE ============ */
{
  const s = newSlide(WHITE);
  header(s, "2 · ENRICHMENT", AMBER, "An orchestrator that runs focused workers, in waves");
  const waves = [
    ["Wave 0", "Eval synthesis", "Read last 10 runs, self-tune", TEAL],
    ["Wave 1", "Discovery (parallel)", "3 blind workers: registry · signals · intel", AMBER],
    ["Gate", "Merge · dedup · score", "Cap at 10. Code, not model.", INK],
    ["Wave 2", "Enrichment (batched)", "Clinic data + contacts + emails", AMBER],
    ["Gate", "Validate · gen Angle", "Min: site + location + 1 contact", INK],
    ["Wave 3", "HUMAN GATE (blocking)", "Ranked dashboard → approvals", TEAL],
    ["Wave 4", "Write + log + self-eval", "CRM write, then grade the run", AMBER],
  ];
  let y = 1.5;
  waves.forEach((wv) => {
    const h = 0.46;
    card(s, 0.5, y, 2.0, h, wv[3] === INK ? PANEL : WHITE, wv[3] === INK ? LINE : wv[3]);
    s.addText(wv[0], { x: 0.5, y, w: 2.0, h, margin: 0, align: "center", valign: "middle", fontFace: BF, fontSize: 12.5, bold: true, color: wv[3] === INK ? INK : wv[3] });
    s.addText(wv[1], { x: 2.7, y, w: 3.0, h, margin: 0, valign: "middle", fontFace: BF, fontSize: 12.5, bold: true, color: INK });
    s.addText(wv[2], { x: 5.75, y, w: 3.75, h, margin: 0, valign: "middle", fontFace: BF, fontSize: 11, color: MUTED });
    y += 0.53;
  });
  footer(s, N);
}

/* ============ 8. Q2b DETERMINISM BOUNDARY ============ */
{
  const s = newSlide(WHITE);
  header(s, "2 · ENRICHMENT", AMBER, "The whole game: what's code vs what's the model");
  card(s, 0.5, 1.5, 4.45, 1.95, PANEL, TEAL);
  s.addText("CODE owns  (correctness)", { x: 0.7, y: 1.62, w: 4.1, h: 0.3, margin: 0, fontFace: BF, fontSize: 13, bold: true, color: TEAL });
  s.addText([
    { text: "Lead scoring (weighted rubric)", options: { bullet: true, breakLine: true } },
    { text: "Dedup (ID / domain / fuzzy name)", options: { bullet: true, breakLine: true } },
    { text: "Schema validation + enums", options: { bullet: true, breakLine: true } },
    { text: "Thresholds → priority → action", options: { bullet: true } },
  ], { x: 0.75, y: 1.98, w: 4.0, h: 1.4, margin: 0, fontFace: BF, fontSize: 12.5, color: INK, paraSpaceAfter: 5 });

  card(s, 5.05, 1.5, 4.45, 1.95, PANEL, AMBER);
  s.addText("MODEL owns  (judgment)", { x: 5.25, y: 1.62, w: 4.1, h: 0.3, margin: 0, fontFace: BF, fontSize: 13, bold: true, color: AMBER });
  s.addText([
    { text: "Gathering & grounding facts", options: { bullet: true, breakLine: true } },
    { text: "Classifying roles from titles", options: { bullet: true, breakLine: true } },
    { text: "Writing the account-specific Angle", options: { bullet: true, breakLine: true } },
    { text: "Parsing human approval intent", options: { bullet: true } },
  ], { x: 5.3, y: 1.98, w: 4.0, h: 1.4, margin: 0, fontFace: BF, fontSize: 12.5, color: INK, paraSpaceAfter: 5 });

  // good vs bad angle
  card(s, 0.5, 3.62, 9, 1.28, DARK, DARK);
  s.addText("The Angle: generative, but constrained by a good/bad exemplar", { x: 0.7, y: 3.72, w: 8.6, h: 0.3, margin: 0, fontFace: BF, fontSize: 12, bold: true, color: WHITE });
  s.addText([
    { text: "GOOD  ", options: { color: TEAL, bold: true } },
    { text: "\"280 cycles/yr across 4 REIs ≈ 70 per doctor, coordinator bottleneck. Novara automates between-visit engagement.\"", options: { color: "DCE6F2" } },
  ], { x: 0.7, y: 4.04, w: 8.6, h: 0.42, margin: 0, fontFace: BF, fontSize: 11.5, lineSpacingMultiple: 0.98 });
  s.addText([
    { text: "BAD   ", options: { color: AMBER, bold: true } },
    { text: "\"Fertility clinic that could benefit from patient engagement software.\"", options: { color: "8597AD", italic: true } },
  ], { x: 0.7, y: 4.5, w: 8.6, h: 0.32, margin: 0, fontFace: BF, fontSize: 11.5 });
  footer(s, N);
}

/* ============ 9. Q3 TOOLS ============ */
{
  const s = newSlide(WHITE);
  header(s, "3 · TOOLS", TEAL, "What the agent actually calls to touch reality");
  const tools = [
    ["WebSearch / Fetch", "Registries, job boards, news, LinkedIn profiles"],
    ["Hunter.io", "Find & verify emails, returns a confidence score"],
    ["PostHog", "Are they already on our site? Inbound = warmer lead"],
    ["Notion (MCP + REST)", "Read/write state; MCP for ergonomics, REST for the long tail"],
    ["Subagent tool", "The orchestrator's 'fork', spawn focused workers"],
    ["Filesystem", "Inject the narrative/definition markdown on demand"],
  ];
  let x = 0.5, y = 1.5;
  tools.forEach((t, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const cx = 0.5 + col * 4.6, cy = 1.5 + row * 1.05;
    card(s, cx, cy, 4.4, 0.92, WHITE);
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: 0.1, h: 0.92, fill: { color: i % 2 ? AMBER : TEAL } });
    s.addText(t[0], { x: cx + 0.25, y: cy + 0.12, w: 4.0, h: 0.3, margin: 0, fontFace: BF, fontSize: 13.5, bold: true, color: INK });
    s.addText(t[1], { x: cx + 0.25, y: cy + 0.44, w: 4.05, h: 0.42, margin: 0, fontFace: BF, fontSize: 11, color: MUTED, lineSpacingMultiple: 0.98 });
  });
  s.addText("Two lessons: MCP is the 'USB-C' of tools · carry confidence/provenance as a first-class field, never collapse it.", { x: 0.5, y: 4.92, w: 9, h: 0.3, margin: 0, fontFace: BF, fontSize: 11.5, italic: true, color: TEAL });
  footer(s, N);
}

/* ============ 10. Q4 GATES ============ */
{
  const s = newSlide(WHITE);
  header(s, "4 · GATES", AMBER, "Four checkpoints, match strictness to blast radius");
  const gates = [
    ["Schema validation", "Pre-flight", "Do the CRM fields exist, by exact name?", "HALT before any work"],
    ["Dedup gate", "After discovery", "Already in the CRM? (ID / domain / name)", "Exact → drop; fuzzy → ask"],
    ["Validation gate", "After enrichment", "Min viable data present?", "Demote + flag, don't drop silently"],
    ["Human gate", "Wave 3", "Does a human approve the writes?", "No approval → no writes"],
  ];
  let y = 1.5;
  gates.forEach((g, i) => {
    card(s, 0.5, y, 9, 0.74, i === 3 ? DARK : WHITE, i === 3 ? DARK : LINE);
    const tc = i === 3 ? WHITE : INK, mc = i === 3 ? "9FB0C6" : MUTED, ac = i === 3 ? AMBER : TEAL;
    s.addText(g[0], { x: 0.7, y: y + 0.09, w: 2.6, h: 0.3, margin: 0, fontFace: BF, fontSize: 14, bold: true, color: ac });
    s.addText(g[1], { x: 0.7, y: y + 0.4, w: 2.6, h: 0.28, margin: 0, fontFace: BF, fontSize: 11, color: mc });
    s.addText(g[2], { x: 3.4, y, w: 3.5, h: 0.74, margin: 0, valign: "middle", fontFace: BF, fontSize: 12, color: tc });
    s.addText(g[3], { x: 7.0, y, w: 2.45, h: 0.74, margin: 0, valign: "middle", fontFace: BF, fontSize: 11.5, bold: true, color: ac });
    y += 0.81;
  });
  s.addText("Automate the confident & reversible. Gate the uncertain & irreversible. Fail loud, never silent.", { x: 0.5, y: 4.92, w: 9, h: 0.3, margin: 0, fontFace: BF, fontSize: 11.5, italic: true, color: AMBER });
  footer(s, N);
}

/* ============ 11. Q5 HUMAN-IN-THE-LOOP ============ */
{
  const s = newSlide(WHITE);
  header(s, "5 · HUMAN-IN-THE-LOOP", TEAL, "Two human roles, keep them separate");
  card(s, 0.5, 1.5, 4.45, 3.3, PANEL, TEAL);
  s.addText("Human as DECISION-MAKER", { x: 0.7, y: 1.64, w: 4.1, h: 0.3, margin: 0, fontFace: BF, fontSize: 14, bold: true, color: TEAL });
  s.addText("The approval gate (Wave 3)", { x: 0.7, y: 1.96, w: 4.1, h: 0.28, margin: 0, fontFace: BF, fontSize: 12, italic: true, color: MUTED });
  s.addText([
    { text: "Pipeline does the expensive work, then STOPS and presents a ranked dashboard.\n\n", options: { color: INK } },
    { text: "Interface is a conversation, not a form:", options: { color: INK, bold: true } },
  ], { x: 0.7, y: 2.3, w: 4.05, h: 1.0, margin: 0, fontFace: BF, fontSize: 12, lineSpacingMultiple: 1.0 });
  s.addText([
    { text: "\"approve all\"\n", options: {} },
    { text: "\"approve 1,3,5\"\n", options: {} },
    { text: "\"edit 1: mention their EMR migration\"\n", options: {} },
    { text: "\"not new: 2 is a dupe\"", options: {} },
  ], { x: 0.7, y: 3.35, w: 4.05, h: 1.3, margin: 0, fontFace: "Consolas", fontSize: 11.5, color: TEAL, lineSpacingMultiple: 1.15 });

  card(s, 5.05, 1.5, 4.45, 3.3, PANEL, AMBER);
  s.addText("Human as TEACHER", { x: 5.25, y: 1.64, w: 4.1, h: 0.3, margin: 0, fontFace: BF, fontSize: 14, bold: true, color: AMBER });
  s.addText("The eval loop", { x: 5.25, y: 1.96, w: 4.1, h: 0.28, margin: 0, fontFace: BF, fontSize: 12, italic: true, color: MUTED });
  s.addText([
    { text: "AI grades itself first", options: { bold: true, color: INK } },
    { text: " (so the human just reacts), then a 5-question eval with self-assessment pre-filled.\n\n", options: { color: INK } },
    { text: "Accepts terse input, ", options: { color: INK } },
    { text: "\"good\"", options: { color: AMBER, bold: true } },
    { text: " or ", options: { color: INK } },
    { text: "\"mostly noise\"", options: { color: AMBER, bold: true } },
    { text: " maps to structured fields, logged to Cron Runs.\n\n", options: { color: INK } },
    { text: "That log feeds the NEXT run's Wave 0. The loop closes.", options: { color: INK, bold: true } },
  ], { x: 5.25, y: 2.3, w: 4.05, h: 2.4, margin: 0, fontFace: BF, fontSize: 12, lineSpacingMultiple: 1.0 });
  footer(s, N);
}

/* ============ 12. Q5b LEARNING LOOP / GOVERNANCE ============ */
{
  const s = newSlide(WHITE);
  header(s, "5 · THE LEARNING LOOP", TEAL, "Self-tuning under graduated governance");
  const tiers = [
    ["TIER 1", "Autonomous nudges", "Max 3 per run, per-run only. 'Southwest 0% for 3 runs → focus there.' Written to temp, injected into prompts.", TEAL],
    ["TIER 2", "Escalate to human", "Persistent patterns it can't fix alone. 'Angles generic 3 runs straight → change the instructions. Approve / Dismiss / Defer?'", AMBER],
    ["TIER 3", "Commit the change", "Approved Tier-2 edits are written to the skill file with a governance log. The system edits its own rules, with a human approving the diff.", INK],
  ];
  let y = 1.55;
  tiers.forEach((t) => {
    const h = 1.0;
    card(s, 0.5, y, 9, h, WHITE);
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 1.55, h, fill: { color: t[3] === INK ? DARK : t[3] } });
    s.addText(t[0], { x: 0.5, y: y + 0.18, w: 1.55, h: 0.4, margin: 0, align: "center", fontFace: HF, fontSize: 17, bold: true, color: WHITE });
    s.addText(t[1], { x: 0.5, y: y + 0.56, w: 1.55, h: 0.3, margin: 0, align: "center", fontFace: BF, fontSize: 9.5, color: t[3] === INK ? "9FB0C6" : "FFF4E6" });
    s.addText(t[2], { x: 2.3, y, w: 7.0, h, margin: 0, valign: "middle", fontFace: BF, fontSize: 12.5, color: INK, lineSpacingMultiple: 1.02 });
    y += 1.1;
  });
  s.addText("LLM best practice: closed-loop evals + graduated autonomy. Improve without drifting.", { x: 0.5, y: 5.0, w: 9, h: 0.3, margin: 0, fontFace: BF, fontSize: 11.5, italic: true, color: TEAL });
  footer(s, N);
}

/* ============ 13. REAL ARTIFACT: TERRA ============ */
{
  const s = newSlide(DARK);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.15, h: 5.625, fill: { color: AMBER } });
  s.addText("REAL ARTIFACT", { x: 0.6, y: 0.45, w: 8, h: 0.3, margin: 0, fontFace: BF, fontSize: 12, bold: true, color: AMBER, charSpacing: 3 });
  s.addText("How a durable record looks in production", { x: 0.6, y: 0.78, w: 9, h: 0.5, margin: 0, fontFace: HF, fontSize: 25, bold: true, color: WHITE });
  s.addText("pm-knowledge/prospects/terra-fertility.md  (injected when this deal comes up)", { x: 0.6, y: 1.32, w: 9, h: 0.3, margin: 0, fontFace: "Consolas", fontSize: 11, color: "8597AD" });

  card(s, 0.5, 1.8, 4.45, 3.05, DARK2, "2A3C56");
  s.addText("ICP fit, as the file states it", { x: 0.72, y: 1.92, w: 4.1, h: 0.3, margin: 0, fontFace: BF, fontSize: 12.5, bold: true, color: TEAL });
  s.addText([
    { text: "\"Terra is the textbook Novara ICP\"\n", options: { italic: true, color: "DCE6F2", bold: true } },
    { text: "Independent + physician-owner-led", options: { bullet: true, breakLine: true, color: "C7D3E2" } },
    { text: "Tech-forward by stated positioning", options: { bullet: true, breakLine: true, color: "C7D3E2" } },
    { text: "Founded after a PE event", options: { bullet: true, breakLine: true, color: "C7D3E2" } },
    { text: "Scaling patient experience w/o staff burden", options: { bullet: true, color: "C7D3E2" } },
  ], { x: 0.72, y: 2.3, w: 4.1, h: 2.4, margin: 0, fontFace: BF, fontSize: 12, lineSpacingMultiple: 1.1, paraSpaceAfter: 4 });

  card(s, 5.05, 1.8, 4.45, 3.05, DARK2, "2A3C56");
  s.addText("Buyer constraint that became the Angle", { x: 5.27, y: 1.92, w: 4.1, h: 0.3, margin: 0, fontFace: BF, fontSize: 12.5, bold: true, color: AMBER });
  s.addText([
    { text: "\"No second surface.\"\n", options: { bold: true, color: WHITE, fontSize: 15 } },
    { text: "Pietro: 'I don't want clinical users checking multiple applications.'\n\n", options: { italic: true, color: "C7D3E2" } },
    { text: "Decision-maker: ", options: { color: "8597AD" } },
    { text: "Dr. Pietro Bortoletto (founder)\n", options: { color: "DCE6F2", bold: true } },
    { text: "Real, grounded, role-tagged, not a template.", options: { color: TEAL } },
  ], { x: 5.27, y: 2.3, w: 4.1, h: 2.4, margin: 0, fontFace: BF, fontSize: 12, lineSpacingMultiple: 1.05 });
  s.addText("13", { x: 9.2, y: 5.28, w: 0.5, h: 0.25, margin: 0, align: "right", fontFace: BF, fontSize: 9, color: "5E7088" });
}

/* ============ 14. END-TO-END BUILD ============ */
{
  const s = newSlide(WHITE);
  header(s, "END-TO-END", AMBER, "One coffee shop, four stages (BrewOps demo kit)");
  const stages = [
    ["01", "Raw discovery", "Name + city + 3 signals. Found by 2 workers (multi-source). contacts: []", TEAL],
    ["02", "Enriched + scored", "540 tx/day, Square-only. Dana = Champion (verified email). Code computes 96/100.", AMBER],
    ["03", "Human gate", "Ranked dashboard → STOPS. Human: 'approve 1, lead the angle with the 2nd location.'", TEAL],
    ["04", "Write + learn", "Record written w/ the edit, every fact sourced. Run grades itself → logged.", AMBER],
  ];
  let y = 1.5;
  stages.forEach((st) => {
    card(s, 0.5, y, 9, 0.79, WHITE);
    s.addShape(pres.shapes.OVAL, { x: 0.72, y: y + 0.16, w: 0.46, h: 0.46, fill: { color: st[3] } });
    s.addText(st[0], { x: 0.72, y: y + 0.16, w: 0.46, h: 0.46, margin: 0, align: "center", valign: "middle", fontFace: HF, fontSize: 15, bold: true, color: WHITE });
    s.addText(st[1], { x: 1.4, y: y + 0.1, w: 2.6, h: 0.6, margin: 0, valign: "middle", fontFace: BF, fontSize: 14, bold: true, color: INK });
    s.addText(st[2], { x: 4.0, y, w: 5.4, h: 0.79, margin: 0, valign: "middle", fontFace: BF, fontSize: 11.5, color: MUTED, lineSpacingMultiple: 0.98 });
    y += 0.87;
  });
  s.addText("Every stage adds information under a constraint; the one irreversible action waits for a human.", { x: 0.5, y: 5.0, w: 9, h: 0.3, margin: 0, fontFace: BF, fontSize: 11.5, italic: true, color: AMBER });
  footer(s, N);
}

/* ============ 15. BUILD YOUR OWN, 3 PATHS ============ */
{
  const s = newSlide(WHITE);
  header(s, "TAKE IT HOME", AMBER, "Build your own: three friction paths");
  const cols = [
    { letter: "A", name: "Copilot", tool: "Claude.ai Project · Custom GPT", time: "~5 min · no keys", accent: TEAL,
      who: "You are the runtime",
      bullets: ["Paste your definitions as context", "Web-search inside the chat", "You do the CRM writes by hand"], badge: null },
    { letter: "B", name: "Local Agent", tool: "Claude Code · Cowork", time: "~30–45 min", accent: AMBER,
      who: "Your laptop runs it, you approve",
      bullets: ["Real tool calls: web · Notion · Hunter", "Stops at the human gate", "Mirrors how Novara runs it"], badge: "START HERE" },
    { letter: "C", name: "Always-On", tool: "OpenClaw · Hermes (self-hosted)", time: "~half a day", accent: INK,
      who: "Runs itself on a schedule",
      bullets: ["Cron + memory + MCP, batteries-in", "Approve from Slack / your phone", "What Novara actually runs"], badge: null },
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.04, w = 2.92, y = 1.5, h = 3.4;
    card(s, x, y, w, h, c.accent === INK ? DARK : WHITE, c.accent === INK ? DARK : LINE);
    const onDark = c.accent === INK;
    const titleC = onDark ? WHITE : INK, subC = onDark ? "9FB0C6" : MUTED, accC = onDark ? AMBER : c.accent;
    // letter chip
    s.addShape(pres.shapes.OVAL, { x: x + 0.22, y: y + 0.24, w: 0.5, h: 0.5, fill: { color: c.accent === INK ? AMBER : c.accent } });
    s.addText(c.letter, { x: x + 0.22, y: y + 0.24, w: 0.5, h: 0.5, margin: 0, align: "center", valign: "middle", fontFace: HF, fontSize: 20, bold: true, color: onDark ? INK : WHITE });
    if (c.badge) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + w - 1.32, y: y + 0.28, w: 1.12, h: 0.34, rectRadius: 0.05, fill: { color: AMBER } });
      s.addText(c.badge, { x: x + w - 1.32, y: y + 0.28, w: 1.12, h: 0.34, margin: 0, align: "center", valign: "middle", fontFace: BF, fontSize: 9.5, bold: true, color: INK, charSpacing: 1 });
    }
    s.addText(c.name, { x: x + 0.22, y: y + 0.85, w: w - 0.4, h: 0.34, margin: 0, fontFace: HF, fontSize: 18, bold: true, color: titleC });
    s.addText(c.tool, { x: x + 0.22, y: y + 1.2, w: w - 0.4, h: 0.3, margin: 0, fontFace: BF, fontSize: 10.5, color: accC, bold: true });
    s.addText(c.who, { x: x + 0.22, y: y + 1.5, w: w - 0.4, h: 0.3, margin: 0, fontFace: BF, fontSize: 11, italic: true, color: subC });
    s.addText(c.bullets.map((b, j) => ({ text: b, options: { bullet: true, breakLine: j < c.bullets.length - 1, color: onDark ? "DCE6F2" : INK } })),
      { x: x + 0.28, y: y + 1.92, w: w - 0.5, h: 1.0, margin: 0, fontFace: BF, fontSize: 10.5, paraSpaceAfter: 5, lineSpacingMultiple: 0.98 });
    s.addText(c.time, { x: x + 0.22, y: y + h - 0.42, w: w - 0.4, h: 0.3, margin: 0, fontFace: BF, fontSize: 10.5, bold: true, color: accC });
  });
  s.addText("Friction up, leverage up. Pick the lowest tier that does the job; graduate when the loop annoys you.  →  brewops/setup/", { x: 0.5, y: 5.02, w: 9, h: 0.3, margin: 0, fontFace: BF, fontSize: 11.5, italic: true, color: AMBER });
  footer(s, N);
}

/* ============ 16. ONE-SLIDE MAPPING ============ */
{
  const s = newSlide(WHITE);
  header(s, "THE WHOLE THING", TEAL, "Tactical → Technical → LLM best practice");
  const rows = [
    ["Lead lifecycle / stages", "State machine over a typed CRM", "External memory tames non-determinism"],
    ["Word definitions", "Per-concept files injected on demand", "Progressive disclosure"],
    ["SDR research", "Orchestrator + parallel workers", "Supervisor pattern; context isolation"],
    ["ICP / lead scoring", "Deterministic rubric + thresholds", "Correctness in code, judgment in model"],
    ["The pitch / Angle", "Constrained generation, exemplars", "Few-shot, grounded in retrieval"],
    ["Don't add a dupe / junk", "Schema · dedup · validation · human", "Guardrails; calibrated autonomy"],
    ["Manager reviews the list", "Wave 3 blocking approval", "HITL at the irreversible step"],
    ["Coaching the rep", "Self-eval + 3-tier self-tuning", "Closed-loop evals; governance"],
  ];
  const tbl = [[
    { text: "Sales (tactical)", options: { fill: { color: AMBER }, color: INK, bold: true, fontFace: BF, fontSize: 12, valign: "middle" } },
    { text: "System (technical)", options: { fill: { color: INK }, color: WHITE, bold: true, fontFace: BF, fontSize: 12, valign: "middle" } },
    { text: "LLM best practice", options: { fill: { color: TEAL }, color: WHITE, bold: true, fontFace: BF, fontSize: 12, valign: "middle" } },
  ]];
  rows.forEach((r, i) => {
    const f = i % 2 ? PANEL : WHITE;
    tbl.push([
      { text: r[0], options: { fill: { color: f }, color: INK, bold: true, fontFace: BF, fontSize: 11.5, valign: "middle" } },
      { text: r[1], options: { fill: { color: f }, color: INK, fontFace: BF, fontSize: 11.5, valign: "middle" } },
      { text: r[2], options: { fill: { color: f }, color: TEAL, fontFace: BF, fontSize: 11.5, valign: "middle" } },
    ]);
  });
  s.addTable(tbl, { x: 0.5, y: 1.5, w: 9, colW: [2.7, 3.3, 3.0], rowH: 0.4, border: { type: "solid", pt: 0.5, color: LINE }, margin: [3, 6, 3, 6] });
  footer(s, N);
}

/* ============ 16. CLOSING ============ */
{
  const s = newSlide(DARK);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.18, fill: { color: AMBER } });
  s.addText("THE TAKEAWAY", { x: 0.7, y: 1.0, w: 8, h: 0.3, margin: 0, fontFace: BF, fontSize: 13, bold: true, color: AMBER, charSpacing: 4 });
  s.addText([
    { text: "The model is ~20% of this system.\n", options: { color: WHITE, bold: true } },
    { text: "The state machine, the gates, and the eval loop are the load-bearing 80%.", options: { color: "C7D3E2" } },
  ], { x: 0.66, y: 1.45, w: 9, h: 1.7, margin: 0, fontFace: HF, fontSize: 30, bold: true, lineSpacingMultiple: 1.05 });
  s.addText([
    { text: "Don't build an AI that does the job.  ", options: { color: TEAL, bold: true } },
    { text: "Build the rails the AI runs on, and own the gates.", options: { color: WHITE } },
  ], { x: 0.7, y: 3.45, w: 9, h: 0.6, margin: 0, fontFace: BF, fontSize: 17 });
  stageStrip(s, 4.4, -1, true);
  s.addText("Stephen Ellington  ·  Novara Fertility  ·  EvoNexus AI Meetup", { x: 0.7, y: 5.05, w: 9, h: 0.3, margin: 0, fontFace: BF, fontSize: 11, color: "8597AD" });
}

pres.writeFile({ fileName: "evonexus-lead-enrichment.pptx" }).then((f) => console.log("WROTE", f, "slides:", N));
