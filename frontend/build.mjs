// Build sem dependências: concatena src/js em ordem (um único módulo ES), junta os
// estilos e copia os arquivos estáticos para dist/, que é o que o GitHub Pages serve.
//   node build.mjs            → dist/ legível
//   node build.mjs --minify   → dist/ minificado (requer `npm i -D esbuild`)
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, "src");
const dist = join(root, "dist");
const minify = process.argv.includes("--minify");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const parts = readdirSync(join(src, "js")).filter((name) => name.endsWith(".js")).sort();
let script = parts.map((name) => `// ---- ${name} ----\n` + readFileSync(join(src, "js", name), "utf8").trimEnd()).join("\n\n") + "\n";
let styles = ["fonts.css", "app.css"].map((name) => readFileSync(join(src, "styles", name), "utf8")).join("\n");

if (minify) {
  const esbuild = await import("esbuild");
  script = (await esbuild.transform(script, { format: "esm", minify: true, target: "es2022", legalComments: "none" })).code;
  styles = (await esbuild.transform(styles, { loader: "css", minify: true })).code;
}
writeFileSync(join(dist, "app.js"), script);
writeFileSync(join(dist, "styles.css"), styles);

const index = readFileSync(join(src, "index.html"), "utf8");
writeFileSync(join(dist, "index.html"), index);
// Página de retorno de convite e recuperação: mesmo aplicativo, endereço próprio e fixo.
writeFileSync(join(dist, "acesso.html"), index.replace("<body>", '<body data-entry="acesso">'));
copyFileSync(join(src, "operacao.html"), join(dist, "operacao.html"));
for (const name of readdirSync(join(src, "static"))) copyFileSync(join(src, "static", name), join(dist, name));
if (existsSync(join(root, "README.site.md"))) copyFileSync(join(root, "README.site.md"), join(dist, "README.md"));

console.log(`dist/ pronto: ${parts.length} módulos, app.js ${(script.length / 1024).toFixed(0)} KB, styles.css ${(styles.length / 1024).toFixed(0)} KB${minify ? " (minificado)" : ""}`);
