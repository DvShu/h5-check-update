let taskId = -1;
let lastEtag = undefined;
let hasUpdate = false; // 是否需要更新
let version = "0.0.1";

async function checkUpdate() {
	try {
		// 检测前端资源是否有更新
		const response = await fetch(`/manifest.json?v=${Date.now()}`, {
			method: "GET",
		});
		// 获取最新的etag和data
		const etag = response.headers.get("etag");
		const manifest = await response.json();
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
			});
		}
		lastEtag = etag;
	} catch (error) {}
}

addEventListener("message", ({ data }) => {
	if (data.type === "check") {
		checkUpdate();
		// 每3分钟检查一次更新
		taskId = setInterval(checkUpdate, 180000); // 180,000 = 3 * 60 * 1000
	}
});
