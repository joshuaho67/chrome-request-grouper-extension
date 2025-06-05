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
      // Ignore invalid URLs
    }
  },
  { urls: ["<all_urls>"] }
);

// Clear stored domains when tab reloads or navigates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading") {
    domainMap.delete(tabId);
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "getDomains") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      const domains = Array.from(domainMap.get(tabId) || []);
      sendResponse({ domains });
    });
    return true; // async
  }
});
