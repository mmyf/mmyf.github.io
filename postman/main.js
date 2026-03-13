const METHODS_WITHOUT_BODY = new Set(["GET", "HEAD"]);

const requestForm = document.getElementById("requestForm");
const methodSelect = document.getElementById("methodSelect");
const urlInput = document.getElementById("urlInput");
const headersInput = document.getElementById("headersInput");
const bodyInput = document.getElementById("bodyInput");
const sendBtn = document.getElementById("sendBtn");

const statusValue = document.getElementById("statusValue");
const timeValue = document.getElementById("timeValue");
const sizeValue = document.getElementById("sizeValue");
const responseHeaders = document.getElementById("responseHeaders");
const responseBody = document.getElementById("responseBody");
const errorOutput = document.getElementById("errorOutput");

function parseHeaders(rawHeaders) {
  const result = {};
  const lines = rawHeaders.split(/\r?\n/);

  for (const line of lines) {
    const text = line.trim();
    if (!text) {
      continue;
    }

    const separatorIndex = text.indexOf(":");
    if (separatorIndex < 1) {
      throw new Error(`请求头格式错误：${text}`);
    }

    const key = text.slice(0, separatorIndex).trim();
    const value = text.slice(separatorIndex + 1).trim();
    result[key] = value;
  }

  return result;
}

function formatBody(rawText) {
  if (!rawText) {
    return "(空响应体)";
  }

  try {
    const json = JSON.parse(rawText);
    return JSON.stringify(json, null, 2);
  } catch {
    return rawText;
  }
}

function setResponseMeta(statusText = "--", timeText = "--", sizeText = "--") {
  statusValue.textContent = statusText;
  timeValue.textContent = timeText;
  sizeValue.textContent = sizeText;
}

function setBodyDisabled(disabled) {
  bodyInput.disabled = disabled;
}

function updateBodyState() {
  const noBody = METHODS_WITHOUT_BODY.has(methodSelect.value);
  setBodyDisabled(noBody);
}

async function handleSendRequest() {
  errorOutput.textContent = "";

  let parsedUrl;
  try {
    parsedUrl = new URL(urlInput.value.trim());
  } catch {
    throw new Error("URL 格式不正确，请输入完整地址（如 https://example.com/api）");
  }

  const method = methodSelect.value;
  const headers = parseHeaders(headersInput.value);

  const options = {
    method,
    headers
  };

  if (!METHODS_WITHOUT_BODY.has(method) && bodyInput.value.trim()) {
    options.body = bodyInput.value;
  }

  sendBtn.disabled = true;
  sendBtn.textContent = "发送中";

  const startedAt = performance.now();

  try {
    const response = await fetch(parsedUrl.toString(), options);
    const text = await response.text();

    const elapsed = Math.round(performance.now() - startedAt);
    const bytes = new TextEncoder().encode(text).length;

    const headersText = Array.from(response.headers.entries())
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    setResponseMeta(
      `${response.status} ${response.statusText}`.trim(),
      `${elapsed} ms`,
      `${bytes} B`
    );

    responseHeaders.textContent = headersText || "(无响应头)";
    responseBody.textContent = formatBody(text);
  } catch (error) {
    setResponseMeta();
    responseHeaders.textContent = "";
    responseBody.textContent = "";

    if (error instanceof Error) {
      errorOutput.textContent = error.message;
    } else {
      errorOutput.textContent = "请求失败，请检查网络或接口地址";
    }
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "发送";
  }
}

requestForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await handleSendRequest();
  } catch (error) {
    if (error instanceof Error) {
      errorOutput.textContent = error.message;
    } else {
      errorOutput.textContent = "请求参数有误";
    }
  }
});

methodSelect.addEventListener("change", updateBodyState);

updateBodyState();
setResponseMeta();
responseHeaders.textContent = "";
responseBody.textContent = "";
