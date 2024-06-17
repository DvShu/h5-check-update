let worker = new Worker("/check_update.worker.js");

function handleWorkerMessage({ data }: any) {
  if (data.type === "update") {
    // 弹出刷新弹窗
    showUpdateNotify();
  }
}
worker.addEventListener("message", handleWorkerMessage);

let cancelTaskId: null | NodeJS.Timeout = null;

checkUpdate();

function showUpdateNotify() {
  let $notify = document.createElement("div");
  $notify.style.cssText =
    "position:fixed;bottom:15px;right:15px;box-shadow:0 3px 6px -4px rgba(0, 0, 0, .12), 0 6px 16px 0 rgba(0, 0, 0, .08), 0 9px 28px 8px rgba(0, 0, 0, .05);padding:7px 10px;z-index:99999;border-radius:5px;border:1px solid #4998f4;font-size: 14px; color: #333; transition: all .3s;opacity:0;transform:translate3d(0, calc(100% + 15px), 0);";
  const btnStyle = "color:#4998f6;cursor:pointer;margin-left:10px;";
  const contents = [
    "<span>发现新版本，立即刷新页面尝试！</span>",
    `<a style="${btnStyle}margin-left:20px;" role="cancel">取消</a>`,
    `<a style="${btnStyle}color:#18a058;" role="refresh">刷新</a>`,
  ];
  requestAnimationFrame(() => {
    $notify.style.opacity = "1";
    $notify.style.transform = "translate3d(0,0,0)";
  });
  $notify.innerHTML = contents.join("");
  $notify.addEventListener("click", handleUpdateClick);
  document.body.appendChild($notify);
  cancelTaskId = setTimeout(() => {
    close();
  }, 60000);

  function close() {
    if ($notify != null) {
      $notify.removeEventListener("click", handleUpdateClick);
      $notify.style.opacity = "0";
      $notify.style.transform = "translate3d(0, calc(100% + 15px), 0)";
      setTimeout(() => {
        document.body.removeChild($notify);
        $notify = null as any;
      }, 300);
    }
  }

  function handleUpdateClick(e: Event) {
    const $target = e.target as HTMLElement;
    const role = $target.getAttribute("role");
    if (role != null) {
      if (cancelTaskId != null) {
        clearTimeout(cancelTaskId);
      }
      if (role === "cancel") {
        close();
      } else if (role === "refresh") {
        worker.postMessage({ type: "destroy" });
        location.reload();
      }
    }
  }
}

/**
 * 检查是否需要更新
 */
export function checkUpdate() {
  worker.postMessage({ type: "check" });
}

/** 停止定时检测，释放资源，通常在应用结束的时候调用 */
export function destroy() {
  if (cancelTaskId != null) {
    clearTimeout(cancelTaskId);
  }
  worker.postMessage({ type: "destroy" });
  worker.removeEventListener("message", handleWorkerMessage);
  worker = null as any;
}
