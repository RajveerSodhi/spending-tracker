// blocked.js

document.getElementById("close-tab-btn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "closeCurrentTab" });
  });