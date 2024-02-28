const worker = new Worker("check_update.worker.js");

worker.addEventListener("message", ({ data }) => {
  if (data.type === "update") {
    // 弹出刷新弹窗
    showUpdateNotify();
  }
});

checkUpdate();
showUpdateNotify();

function showUpdateNotify() {
  const $notify = document.createElement("div");
  $notify.style.cssText =
    "position:fixed;bottom:15px;left:50%;transform: translate3d(-50%,0,0); box-shadow:0 3px 6px -4px rgba(0, 0, 0, .12), 0 6px 16px 0 rgba(0, 0, 0, .08), 0 9px 28px 8px rgba(0, 0, 0, .05);padding:7px 10px;z-index:99999;border-radius:5px;border:1px solid #dedede;font-size: 14px; color: #333;";
  $notify.innerHTML = "<span>有新版本，请刷新页面</span>";
  document.body.appendChild($notify);
}

/**
 * 检查是否需要更新
 */
export function checkUpdate() {
  worker.postMessage({ type: "check" });
}
