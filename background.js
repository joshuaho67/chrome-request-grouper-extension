const domainMap = new Map();

chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.tabId < 0) return;
    try {
      const url = new URL(details.url);
      const hostname = url.hostname;
      if (!domainMap.has(details.tabId)) {
        domainMap.set(details.tabId, new Set());
      }
      domainMap.get(details.tabId).add(hostname);
    } catch (e) {
      // invalid URL
    }
  },
  { urls: ["<all_urls>"] }
);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "getDomains") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      const domains = Array.from(domainMap.get(tabId) || []);
      sendResponse({ domains });
    });
    return true;
  }
});
