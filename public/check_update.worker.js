let taskId = -1;
let lastEtag = undefined;
let version = "";

async function checkUpdate() {
	try {
		// 检测前端资源是否有更新
		const response = await fetch(`/manifest.json?v=${Date.now()}`, {
			method: "GET",
		});
		// 获取最新的etag和data
		const etag = response.headers.get("etag");
		const manifest = await response.json();

		let hasUpdate = false; // 是否需要更新
		if (lastEtag != null && etag !== lastEtag && manifest.version > version) {
			hasUpdate = true;
		}
		if (lastEtag == null) {
			version = manifest.version;
		}
		if (hasUpdate) {
			postMessage({
				type: "update",
				version: manifest.version,
				etag,
			});
		}
		lastEtag = etag;
	} catch (error) {}
}

addEventListener("message", ({ data }) => {
	if (data.type === "check") {
		checkUpdate();
		// 每3分钟检查一次更新
		taskId = setInterval(checkUpdate, 300000); // 300000 = 3 * 60 * 1000
	}
	if (data.type === "pause") {
		clearInterval(taskId);
	}
	if (data.type === "destroy") {
		clearInterval(taskId);
		close();
	}
});
