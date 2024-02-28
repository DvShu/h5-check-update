import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

let dir = "dist";

const argvs = process.argv;

if (argvs.length > 2) {
	dir = argvs[2];
}

const filepath = path.join(dir, "update.json");

console.log("开始写入更新文件");
readFile(filepath, "utf-8")
	.then((data) => {
		let dataJson = {};
		try {
			dataJson = JSON.parse(data);
		} catch (e) {
			return e;
		}
		dataJson.timestamp = new Date().getTime();
		return JSON.stringify(dataJson);
	})
	.then((data) => {
		return writeFile(filepath, data, "utf-8");
	})
	.then(() => {
		console.log("写入更新文件成功");
	})
	.catch((e) => {
		console.error(e);
		console.log("写入更新文件失败");
	});
