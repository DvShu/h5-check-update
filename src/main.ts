const worker = new Worker("check_update.worker.js");

worker.postMessage({ type: "check" });

/**
 * 检查是否需要更新
 */
export function checkUpdate() {
	worker.postMessage({ type: "check" });
}
