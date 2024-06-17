#!/usr/bin/env node
import { cp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
    "    --publicDir  manifest.json文件生成的路径, 放到前端静态目录下, 默认为: public",
    "    --version    指定升级版本号, 如果不指定, 则读取获取原来的版本然后+1",
    "init               初始化检查, package.json中添加update命令、生成worker文件、入口文件中引入检查",
    "help               显示帮助信息",
    "version            显示当前版本号",
  ];
  console.log(helpContent.join("\r\n"));
}

function showVersion() {
  readFile(path.join(__dirname, "package.json"), "utf-8").then((data) => {
    console.log(`v${JSON.parse(data).version}`);
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
    scripts.update = "h5-check-update update";
    scripts.build = `${scripts.build} & npm run update`;
    await writeFile("package.json", JSON.stringify(pkg, null, 2));
    console.log("初始化 h5 更新检查服务成功");
  } catch (error) {
    console.log("初始化 h5 更新检查服务失败");
  }
}

function updateVersion(publicDir, version) {
  const filepath = path.join(publicDir, "manifest.json");

  console.log("开始写入更新文件");
  readFile(filepath, "utf-8")
    .then(
      (data) => {
        let dataJson = {
          version: "0.0.0",
        };
        try {
          dataJson = JSON.parse(data);
          if (!Object.hasOwn(dataJson, "version")) {
            dataJson.version = "0.0.0";
          }
        } catch (e) {
          return e;
        }
        if (version == null) {
          const versions = dataJson.version.split(".");
          versions[2] = parseInt(versions[2]) + 1;
          dataJson.version = versions.join(".");
        } else {
          dataJson.version = version;
        }
        return Promise.all([
          Promise.resolve(dataJson),
          readFile("package.json", "utf-8"),
        ]);
      },
      (err) => {
        const dataJson = {
          version: version || "0.0.1",
        };
        return Promise.all([
          Promise.resolve(dataJson),
          readFile("package.json", "utf-8"),
        ]);
      }
    )
    .then((data) => {
      const packageJson = JSON.parse(data[1]);
      const dataJson = data[0];
      packageJson.version = dataJson.version;
      if (dataJson.name == null) {
        dataJson.name = packageJson.name;
      }
      if (dataJson.description == null) {
        dataJson.description = packageJson.description || "";
      }
      const q = [
        writeFile(filepath, JSON.stringify(dataJson, null, 2), "utf-8"),
      ];
      if (updateVersion === true) {
        q.push(
          writeFile(
            "package.json",
            JSON.stringify(packageJson, null, 2),
            "utf-8"
          )
        );
      }
      return Promise.all(q);
    })
    .then(() => {
      console.log("写入更新文件成功");
    })
    .catch((e) => {
      console.error(e);
      console.log("写入更新文件失败");
    });
}
