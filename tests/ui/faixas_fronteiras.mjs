// Fronteiras das faixas simuladas da bancada, direto nas funções do build (10-core.js):
// um número mostrado com duas casas tem sempre UMA faixa, e a faixa é a do número mostrado.
// Uso: node tests/ui/faixas_fronteiras.mjs   (a partir da raiz do repositório)
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const core = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../frontend/src/js/10-core.js"), "utf8");
const slice = (from, to) => core.slice(core.indexOf(from), core.indexOf(to, core.indexOf(from)));
const source =
  slice("const fmtNum =", "const fmtDateTime") + slice("const magBandOf =", "// ----- Faixas SIMULADAS") + slice("const BENCH_SIM = {", "// A preferência \"Mostrar faixas simuladas") +
  "return { fmtNum, magBandOf, BENCH_SIM, BENCH_SIM_EDGES, benchShown, benchSimOf };";
const { fmtNum, BENCH_SIM_EDGES, benchShown, benchSimOf } = new Function(source)();

let failures = 0, checks = 0;
const check = (ok, name, detail = "") => { checks++; if (!ok) failures++; console.log(`${ok ? "ok   " : "FALHA"} | ${name}${detail ? " | " + detail : ""}`); };
const shown = (value) => (benchShown(value) == null ? "—" : fmtNum(benchShown(value), 2) + " %");
const label = (value) => benchSimOf(value)?.label ?? "sem faixa";

// 1. A tabela do pedido.
for (const [value, text, band] of [
  [0, "0,00 %", "Sem ajuste"], [29.99, "29,99 %", "Sem ajuste"], [30, "30,00 %", "Baixo ajuste"], [49.99, "49,99 %", "Baixo ajuste"],
  [50, "50,00 %", "Médio ajuste"], [72.99, "72,99 %", "Médio ajuste"], [73, "73,00 %", "Alto ajuste"], [100, "100,00 %", "Alto ajuste"],
  [19.7559, "19,76 %", "Sem ajuste"], [42.6076, "42,61 %", "Baixo ajuste"], [67.83, "67,83 %", "Médio ajuste"],
]) check(shown(value) === text && label(value) === band, `${value} → ${text} · ${band}`, `${shown(value)} · ${label(value)}`);

// 2. Arredondamento a duas casas: o que aparece como 30,00 já é Baixo; o que aparece como 29,99 ainda é Sem ajuste.
for (const [value, text, band] of [
  [29.994, "29,99 %", "Sem ajuste"], [29.9949, "29,99 %", "Sem ajuste"], [29.9951, "30,00 %", "Baixo ajuste"], [29.999, "30,00 %", "Baixo ajuste"],
  [49.994, "49,99 %", "Baixo ajuste"], [49.9951, "50,00 %", "Médio ajuste"], [72.994, "72,99 %", "Médio ajuste"], [72.9951, "73,00 %", "Alto ajuste"],
  [99.999, "100,00 %", "Alto ajuste"], [0.004, "0,00 %", "Sem ajuste"],
]) check(shown(value) === text && label(value) === band, `arredondamento: ${value} → ${text} · ${band}`, `${shown(value)} · ${label(value)}`);

// 3. Ausência de dado e valores inválidos: sem número e sem faixa (nunca "0,00 % · Sem ajuste").
for (const value of [null, undefined, "", "abc", NaN, Infinity, -0.01, 100.01, true, false, {}, []])
  check(shown(value) === "—" && benchSimOf(value) === null, `sem dado ou inválido (${typeof value === "object" ? JSON.stringify(value) : String(value)}): sem número e sem faixa`, `${shown(value)} · ${label(value)}`);
check(shown("0") === "0,00 %" && label("0") === "Sem ajuste" && shown(0) === "0,00 %", "zero é valor válido (número ou texto numérico): 0,00 % · Sem ajuste");

// 4. Varredura de 0 a 100 em passos de 0,001: cada valor tem uma faixa, e ela é a do número mostrado.
let bad = 0, steps = 0, changes = [];
let previous = null;
for (let i = 0; i <= 100000; i++) {
  const value = i / 1000;
  steps++;
  const band = benchSimOf(value);
  const text = Number(fmtNum(benchShown(value), 2).replace(",", "."));
  const expected = text >= 73 ? "high" : text >= 50 ? "medium" : text >= 30 ? "low" : "none";
  if (!band || band.band !== expected) bad++;
  if (previous && band.band !== previous) changes.push(value);
  previous = band.band;
}
check(bad === 0, `varredura de ${steps} valores (0 a 100, passo 0,001): a faixa é sempre a do número mostrado com duas casas`, `${bad} divergências`);
check(changes.length === 3 && changes.every((value, i) => Math.abs(value - BENCH_SIM_EDGES[i]) <= 0.001), "a faixa muda em exatamente três pontos: onde o número mostrado passa a 30,00, 50,00 e 73,00", changes.join(" · "));
console.log(`TOTAL: ${checks} verificações, ${failures} falhas`);
process.exit(failures ? 1 : 0);
