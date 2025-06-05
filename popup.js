const list = document.getElementById("domain-list");
const refreshBtn = document.getElementById("refresh");

// Helper to get the "registered domain" (e.g. "aliyun.com") from a hostname
// For simplicity, this function assumes TLD is one part like .com, .org, etc.
// For production, consider using a public suffix list library.
function getRegisteredDomain(hostname) {
  const parts = hostname.split(".");
  if (parts.length <= 2) {
    return hostname; // no subdomain, just return as is
  }
  // return last two parts: example.com
  return parts.slice(parts.length - 2).join(".");
}

// Groups domains by their registered domain, then applies wildcard if multiple subdomains
function groupDomains(domains) {
  const groups = {};

  domains.forEach((domain) => {
    const regDomain = getRegisteredDomain(domain);
    if (!groups[regDomain]) {
      groups[regDomain] = new Set();
    }
    groups[regDomain].add(domain);
  });

  const result = [];

  for (const regDomain in groups) {
    const subdomains = groups[regDomain];
    if (subdomains.size > 1) {
      result.push(`*.${regDomain}`);
    } else {
      // only one domain, push the domain itself
      result.push([...subdomains][0]);
    }
  }

  return result.sort();
}

function loadDomains() {
  chrome.runtime.sendMessage({ type: "getDomains" }, (response) => {
    if (!response || !response.domains) {
      list.innerHTML = "<li>No data available</li>";
      return;
    }
    const grouped = groupDomains(response.domains);
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
