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
      if (!tabs.length) {
        sendResponse({ domains: [] });
        return;
      }
      const tab = tabs[0];
      // Prevent chrome:// and restricted URLs access
      const url = tab.url || "";
      if (
        url.startsWith("chrome://") ||
        url.startsWith("chrome-extension://") ||
        url.startsWith("https://chrome.google.com/webstore")
      ) {
        sendResponse({ domains: [], error: "Cannot access this page." });
        return;
      }
      const domains = Array.from(domainMap.get(tab.id) || []);
      sendResponse({ domains });
    });
    return true; // async response
  }
});
