let taskId = -1;

async function checkUpdate() {}

addEventListener("message", ({ data }) => {
	if (data.type === "check") {
		// 每3分钟检查一次更新
		taskId = setInterval(checkUpdate, 180000); // 180,000 = 3 * 60 * 1000
	}
});
