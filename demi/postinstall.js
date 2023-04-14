// reference vue-demi

const fs = require("fs");
const path = require("path");

let vuemodule = undefined;

try {
  vuemodule = require("vue");
} catch (error) {}

if (vuemodule && /^2\.7/.test(vuemodule.version)) {
  const dir = path.resolve(__dirname);
  const v2file = path.join(dir, "vue2.d.ts");
  const index = path.join(dir, "index.d.ts");
  const content = fs.readFileSync(v2file, "utf-8");
  try {
    fs.unlinkSync(index);
  } catch (error) {}
  fs.writeFileSync(index, content, "utf-8");
}
