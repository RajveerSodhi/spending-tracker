// Predefined websites and their limits
const supportedSites = [
    { name: "Amazon", hostname: "amazon.com" },
    { name: "Best Buy", hostname: "bestbuy.com" },
    { name: "DoorDash", hostname: "doordash.com" },
    { name: "Uber Eats", hostname: "ubereats.com" },
    { name: "Flipkart", hostname: "flipkart.com" },
    { name: "eBay", hostname: "ebay.com" },
    { name: "Target", hostname: "target.com" },
    { name: "Walmart", hostname: "walmart.com" },
    { name: "Etsy", hostname: "etsy.com" },
    { name: "Costco", hostname: "costco.com" },
    { name: "Shein", hostname: "shein.com" },
    { name: "Myntra", hostname: "myntra.com" }
];

// Load spending data and populate UI
chrome.storage.local.get(["spendingData"], (result) => {
    const spendingData = result.spendingData || {};
    const websiteList = document.getElementById("website-list");

    supportedSites.forEach((site) => {
        const siteData = spendingData[site.hostname] || { limit: 0, current: 0 };

        // Create website item
        const websiteItem = document.createElement("div");
        websiteItem.className = "website-item";

        const info = document.createElement("div");
        info.className = "info";
        info.innerHTML = `
            <span>${site.name}</span>
            <span>Spent: $${siteData.current.toFixed(2)} / Limit: $<input class="limit-input" type="number" value="${siteData.limit}" data-hostname="${site.hostname}" /></span>
        `;
        websiteItem.appendChild(info);

        const saveButton = document.createElement("button");
        saveButton.className = "save-btn";
        saveButton.textContent = "Save";
        saveButton.addEventListener("click", () => {
            const newLimit = parseFloat(info.querySelector(".limit-input").value) || 0;
            spendingData[site.hostname] = { ...siteData, limit: newLimit };
            chrome.storage.local.set({ spendingData });
            alert(`${site.name} limit updated to $${newLimit}`);
        });
        websiteItem.appendChild(saveButton);

        websiteList.appendChild(websiteItem);
    });
});