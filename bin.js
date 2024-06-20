#!/usr/bin/env node
import { cp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { styleText } from "node:util";

const inputFiles = ["main.ts", "main.js"];
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let argvs = process.argv;
argvs = argvs.slice(2);

if (argvs[0] === "update") {
  // 更新版本
  let version = null;
  let publicDir = "dist";
  let updatePackage = false;
  for (const item of argvs) {
    if (item.startsWith("--version=")) {
      version = item.replace("--version=", "");
    }
    if (item.startsWith("--public-dir=")) {
      publicDir = item.replace("--public-dir=", "");
    }
    if (item.startsWith("--update-package")) {
      updatePackage = true;
    }
  }
  updateVersion(publicDir, version, updatePackage);
} else if (argvs[0] === "init") {
  init();
} else if (argvs[0] === "version") {
  showVersion();
} else if (argvs[0] === "help") {
  const helpContent = [
    "使用: h5-eheck-update [Command] [option] ",
    "\r\nh5更新检查提示命令行工具\r\n",
    "Commands:",
    "update [options]  每次上线部署时调用, 生成manifest.json用于检查提示更新, 同时更新package.json版本号",
    "  update options:",
    "    --public-dir      manifest.json文件生成的路径, 放到前端静态目录下, 默认为: public",
    "    --version         指定升级版本号, 如果不指定, 则读取获取原来的版本然后+1",
    "    --update-package  是否更新 package.json 文件, 默认不更新",
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

async function readManifest(manifestPath) {
  try {
    let content = readFile(filepath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    return {};
  }
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
    const a = await Promise.all([
      readFile("package.json", "utf-8"),
      cp(path.join(__dirname, "public"), path.join(process.cwd(), "public"), {
        recursive: true,
      }),
      sourceImport(),
    ]);
    // package.json
    const pkg = JSON.parse(a[0]);
    const scripts = pkg.scripts || {};
    scripts.update = "h5-check-update update --update-package";
    scripts.build = `${scripts.build} & npm run update`;
    await writeFile("package.json", JSON.stringify(pkg, null, 2));
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

function updateVersion(publicDir, version, updatePackage) {
  const filepath = path.join(publicDir, "manifest.json");
  log("开始写入更新文件");
  Promise.all([readManifest(filepath), readFile("package.json", "utf-8")])
    .then((a) => {
      a[1] = JSON.parse(a[1]);
      if (a[0].version == null) {
        a[0].version = a[1].version;
      }
      return Promise.resolve(a);
    })
    .then((a) => {
      if (version == null) {
        const versions = a[0].version.split(".");
        versions[2] = parseInt(versions[2]) + 1;
        a[0].version = versions.join(".");
      } else {
        a[0].version = version;
      }
      a[0].name = a[1].name;
      a[0].description = a[1].description || "";
      const q = [writeFile(filepath, JSON.stringify(a[0], null, 2), "utf-8")];
      if (updatePackage === true) {
        q.push(
          writeFile("package.json", JSON.stringify(a[1], null, 2), "utf-8")
        );
      }
      return Promise.all(q);
    })
    .then(() => {
      log("写入更新文件成功");
    })
    .catch((e) => {
      console.error(e);
      log("写入更新文件失败", "error");
    });
}
