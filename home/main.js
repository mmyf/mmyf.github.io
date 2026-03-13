const WEEK_MAP = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
const NOTE_KEY = "home.quickNote";

const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");
const noteInput = document.getElementById("noteInput");
const saveTip = document.getElementById("saveTip");
const clearBtn = document.getElementById("clearBtn");

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateDateTime() {
  const now = new Date();
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

  timeEl.textContent = `${hours}:${minutes}:${seconds}`;
  dateEl.textContent = `${now.getFullYear()}年${pad(now.getMonth() + 1)}月${pad(now.getDate())}日 ${WEEK_MAP[now.getDay()]}`;
}

function setSaveTip(text) {
  saveTip.textContent = text;
}

function saveNote() {
  localStorage.setItem(NOTE_KEY, noteInput.value);
  setSaveTip(`已自动保存 ${new Date().toLocaleTimeString("zh-CN")}`);
}

function loadNote() {
  const saved = localStorage.getItem(NOTE_KEY);
  if (saved) {
    noteInput.value = saved;
    setSaveTip("已载入本地内容");
  }
}

noteInput.addEventListener("input", saveNote);

clearBtn.addEventListener("click", () => {
  noteInput.value = "";
  localStorage.removeItem(NOTE_KEY);
  setSaveTip("内容已清空");
  noteInput.focus();
});

updateDateTime();
setInterval(updateDateTime, 1000);
loadNote();
