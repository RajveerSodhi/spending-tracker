const supportedSites = [
    { name: "Amazon (.com)", hostname: "amazon.com" },
    { name: "Amazon (.ca)", hostname: "amazon.ca" },
    { name: "Amazon (.in)", hostname: "amazon.in" },
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
chrome.storage.local.get(["spendingData", "favourites"], (result) => {
    const spendingData = result.spendingData || {};
    const favourites = result.favourites || [];
    const favouriteList = document.getElementById("favourites");
    const otherList = document.getElementById("others");

    supportedSites.forEach((site) => {
        const siteData = spendingData[site.hostname] || { limit: 0, current: 0 };

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

        if (favourites.includes(site.hostname)) {
            const removeButton = document.createElement("button");
            removeButton.className = "remove-btn";
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", () => {
                const index = favourites.indexOf(site.hostname);
                if (index !== -1) {
                    favourites.splice(index, 1);
                    chrome.storage.local.set({ favourites });
                    alert(`${site.name} removed from favourites`);
                    window.location.reload();
                }
            });
            websiteItem.appendChild(removeButton);
            favouriteList.appendChild(websiteItem);
        } else {
            const addButton = document.createElement("button");
            addButton.className = "add-btn";
            addButton.textContent = "+";
            addButton.addEventListener("click", () => {
                favourites.push(site.hostname);
                chrome.storage.local.set({ favourites });
                alert(`${site.name} added to favourites`);
                window.location.reload();
            });
            websiteItem.appendChild(addButton);
            otherList.appendChild(websiteItem);
        }
    });
});

// Toggle dropdown visibility
document.getElementById("toggle-dropdown").addEventListener("click", (e) => {
    const dropdown = document.getElementById("dropdown-list");
    if (dropdown.classList.contains("hidden")) {
        dropdown.classList.remove("hidden");
        e.target.textContent = "Hide More Websites";
    } else {
        dropdown.classList.add("hidden");
        e.target.textContent = "Show More Websites";
    }
});