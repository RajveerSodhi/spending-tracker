if (window.location.pathname.includes("/thank-you")) {
    chrome.runtime.sendMessage({ action: "recordPurchase" });
}