/**
 * 匹配 index.js 的引入
 *
 * #### 1. `<script\s+` 匹配 `<script>` 标签开始，`\s+` 匹配前面的空白字符。
 * #### 2. `.*?` 非贪婪模式匹配任意字符，直到接下来的 src 属性。
 * #### 3. `src\s*=\s*["']` 匹配 `src` 属性及其可能的空白字符和引号。
 * #### 4. `([^"']*\/index\.[a-zA-Z0-9]+\.js)` 捕获组，匹配 `index.js` 文件名，其中 `[a-zA-Z0-9]+` 匹配包含字母和数字的哈希值
 * #### 5. `["'].*?><\/script>` 匹配剩余的 `src` 属性值和可能的空白字符，直到 `<\/script>` 标签结束。
 */
const regex =
  /<script\s+.*?src\s*=\s*["'][^"']*\/index\.([a-zA-Z0-9]+)\.js["'].*?><\/script>/;

let taskId = -1;
let lastEtag = undefined;
let version = "";

async function checkUpdate() {
  try {
    // 检测前端资源是否有更新
    const response = await fetch(`/t=${Date.now()}}`, {
      method: "GET",
    });
    // 获取最新的etag和data
    const etag = response.headers.get("etag");
    const html = await response.text();
    const match = html.match(regex);
    let matchVersion = "";
    if (match != null) {
      matchVersion = match[1];
    }
    let hasUpdate = false; // 是否需要更新
    if (lastEtag != null && etag !== lastEtag && matchVersion !== version) {
      hasUpdate = true;
    }
    if (lastEtag == null) {
      version = matchVersion;
    }
    if (hasUpdate) {
      postMessage({
        type: "update",
        version: matchVersion,
        etag,
      });
    }
    lastEtag = etag;
  } catch (error) {}
}

addEventListener("message", ({ data }) => {
  if (data.type === "check") {
    checkUpdate();
    // 每5分钟检查一次更新
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
