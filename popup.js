const list = document.getElementById("domain-list");
const refreshBtn = document.getElementById("refresh");
const errorDiv = document.getElementById("error");

// Naive registered domain extractor (last two parts)
function getRegisteredDomain(hostname) {
  const parts = hostname.split(".");
  if (parts.length <= 2) return hostname;
  return parts.slice(parts.length - 2).join(".");
}

// Group domains by registered domain and use wildcard if multiple subdomains exist
function groupDomains(domains) {
  const groups = {};

  domains.forEach((domain) => {
    const regDomain = getRegisteredDomain(domain);
    if (!groups[regDomain]) groups[regDomain] = new Set();
    groups[regDomain].add(domain);
  });

  const result = [];
  for (const regDomain in groups) {
    const subdomains = groups[regDomain];
    if (subdomains.size > 1) {
      result.push(`*.${regDomain}`);
    } else {
      result.push([...subdomains][0]);
    }
  }

  return result.sort();
}

function loadDomains() {
  errorDiv.textContent = "";
  chrome.runtime.sendMessage({ type: "getDomains" }, (response) => {
    if (!response) {
      errorDiv.textContent = "No response from background script.";
      list.innerHTML = "";
      return;
    }
    if (response.error) {
      errorDiv.textContent = response.error;
      list.innerHTML = "";
      return;
    }
    const domains = response.domains || [];
    if (domains.length === 0) {
      list.innerHTML = "<li>No domains recorded yet.</li>";
      return;
    }
    const grouped = groupDomains(domains);
    list.innerHTML = "";
    grouped.forEach((domain) => {
      const li = document.createElement("li");
      li.textContent = domain;
      list.appendChild(li);
    });
  });
}

refreshBtn.addEventListener("click", loadDomains);
document.addEventListener("DOMContentLoaded", loadDomains);
