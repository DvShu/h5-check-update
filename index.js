let t = new Worker("check_update.worker.js");
function l({ data: e }) {
  e.type === "update" && p();
}
t.addEventListener("message", l);
let o = null;
d();
function p() {
  let e = document.createElement("div");
  e.style.cssText = "position:fixed;bottom:15px;right:15px;box-shadow:0 3px 6px -4px rgba(0, 0, 0, .12), 0 6px 16px 0 rgba(0, 0, 0, .08), 0 9px 28px 8px rgba(0, 0, 0, .05);padding:7px 10px;z-index:99999;border-radius:5px;border:1px solid #4998f4;font-size: 14px; color: #333; transition: all .3s;opacity:0;transform:translate3d(0, calc(100% + 15px), 0);";
  const r = "color:#4998f6;cursor:pointer;margin-left:10px;", i = [
    "<span>发现新版本，立即刷新页面尝试！</span>",
    `<a style="${r}margin-left:20px;" role="cancel">取消</a>`,
    `<a style="${r}color:#18a058;" role="refresh">刷新</a>`
  ];
  requestAnimationFrame(() => {
    e.style.opacity = "1", e.style.transform = "translate3d(0,0,0)";
  }), e.innerHTML = i.join(""), e.addEventListener("click", a), document.body.appendChild(e), o = setTimeout(() => {
    s();
  }, 3e3);
  function s() {
    e != null && (e.removeEventListener("click", a), e.style.opacity = "0", e.style.transform = "translate3d(0, calc(100% + 15px), 0)", setTimeout(() => {
      document.body.removeChild(e), e = null;
    }, 300));
  }
  function a(c) {
    const n = c.target.getAttribute("role");
    n != null && (o != null && clearTimeout(o), n === "cancel" ? s() : n === "refresh" && (t.postMessage({ type: "destroy" }), location.reload()));
  }
}
function d() {
  t.postMessage({ type: "check" });
}
function u() {
  o != null && clearTimeout(o), t.postMessage({ type: "destroy" }), t.removeEventListener("message", l), t = null;
}
export {
  d as checkUpdate,
  u as destroy
};
