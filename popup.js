const list = document.getElementById("domain-list");
const refreshBtn = document.getElementById("refresh");

function loadDomains() {
  chrome.runtime.sendMessage({ type: "getDomains" }, (response) => {
    const domains = response.domains.sort();
    list.innerHTML = "";
    domains.forEach((domain) => {
      const li = document.createElement("li");
      li.textContent = domain;
      list.appendChild(li);
    });
  });
}

refreshBtn.addEventListener("click", loadDomains);
document.addEventListener("DOMContentLoaded", loadDomains);
