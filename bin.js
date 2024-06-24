#!/usr/bin/env node
import { cp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { styleText } from "node:util";

const inputFiles = ["main.ts", "main.js"];
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let argvs = process.argv;
argvs = argvs.slice(2);

if (argvs[0] === "init") {
  init();
} else if (argvs[0] === "version") {
  showVersion();
} else if (argvs[0] === "help") {
  const helpContent = [
    "使用: h5-eheck-update [Command] [option] ",
    "\r\nh5更新检查提示命令行工具\r\n",
    "Commands:",
    "init               初始化检查, package.json中添加update命令、生成worker文件、入口文件中引入检查",
    "help               显示帮助信息",
    "version            显示当前版本号",
  ];
  console.log(helpContent.join("\r\n"));
}

async function getPackageInfo() {
  let content = readFile(path.join(__dirname, "package.json"), "utf-8");
  return JSON.parse(content);
}

function showVersion() {
  getPackageInfo().then((data) => {
    console.log(`v${data.version}`);
  });
}

async function readSource(src) {
  let content;
  try {
    content = await readFile(src, "utf-8");
  } catch (error) {
    content = 0;
  }
  return content;
}

async function sourceImport() {
  const dir = path.join(process.cwd(), "src");
  const a = await Promise.all(
    inputFiles.map((f) => readSource(path.join(dir, f)))
  );
  let inputFile = "";
  let content = "";
  for (let i = 0, len = a.length; i < len; i++) {
    if (a[i] !== 0) {
      inputFile = inputFiles[i];
      content = a[i];
      break;
    }
  }
  if (inputFile !== "" && content.indexOf("h5-check-update") === -1) {
    content = `import "h5-check-update";\n${content}`;
    await writeFile(path.join(dir, inputFile), content);
  }
}

async function init() {
  console.log("正在初始化 h5 更新检查服务……");
  try {
    await Promise.all([
      cp(path.join(__dirname, "public"), path.join(process.cwd(), "public"), {
        recursive: true,
      }),
      sourceImport(),
    ]);
    log("初始化 h5 更新检查服务成功");
  } catch (error) {
    log("初始化 h5 更新检查服务失败", "error");
  }
}

function log(msg, type = "info") {
  return console.log(
    styleText("blue", "h5-check-update") +
      " " +
      styleText(type === "error" ? "red" : "green", msg)
  );
}
