import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const argvs = process.argv.slice(2);

if (argvs[0] === "update") {
	// 更新版本
	let version = null;
	let publicDir = "dist";
	for (const item of argvs) {
		if (item.startsWith("--version=")) {
			version = item.replace("--version=", "");
		}
		if (item.startsWith("--publicDir=")) {
			publicDir = item.replace("--publicDir=", "");
		}
	}
	updateVersion(publicDir, version);
} else if (argvs[0] === "init") {
	init();
}

function init() {
	const __dirname = path.dirname(fileURLToPath(import.meta.url));
	Promise.all([readFile("package.json", "utf-8")]).then((a) => {
		const pkg = JSON.parse(a[0]);
		const scripts = pkg.scripts || {};
		scripts.update = "node h5-check-update/update_script.js update";
		scripts.build = `${scripts.build} & npm run update`;
		return Promise.all([
			writeFile("package.json", JSON.stringify(pkg, null, 2)),
		]);
	});
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
			},
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
			return Promise.all([
				writeFile(filepath, JSON.stringify(dataJson, null, 2), "utf-8"),
				writeFile(
					"package.json",
					JSON.stringify(packageJson, null, 2),
					"utf-8",
				),
			]);
		})
		.then(() => {
			console.log("写入更新文件成功");
		})
		.catch((e) => {
			console.error(e);
			console.log("写入更新文件失败");
		});
}
