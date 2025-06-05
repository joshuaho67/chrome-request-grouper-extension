const domainMap = new Map();

// Listen to requests
chrome.webRequest.onCompleted.addListener(
  (details) => {
    const url = new URL(details.url);
    const domain = url.hostname;
    const tabId = details.tabId;
    if (tabId < 0) return;

    if (!domainMap.has(tabId)) {
      domainMap.set(tabId, new Set());
    }

    domainMap.get(tabId).add(domain);
  },
  { urls: ["<all_urls>"] }
);

// Listen for popup requests
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "getDomains") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      const domains = Array.from(domainMap.get(tabId) || []);
      sendResponse({ domains });
    });
    return true; // async response
  }
});
