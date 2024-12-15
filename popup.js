const supportedSitesByCountry = {
    USA: [
        { name: "Amazon", hostname: "amazon.com" },
        { name: "Best Buy", hostname: "bestbuy.com" },
        { name: "DoorDash", hostname: "doordash.com" },
        { name: "Uber Eats", hostname: "ubereats.com" },
        { name: "Target", hostname: "target.com" },
        { name: "Walmart", hostname: "walmart.com" },
        { name: "Etsy", hostname: "etsy.com" },
        { name: "Costco", hostname: "costco.com" },
        { name: "Shein", hostname: "shein.com" },
        { name: "Macy's", hostname: "macys.com" },
        { name: "Kohl's", hostname: "kohls.com" },
        { name: "Home Depot", hostname: "homedepot.com" },
        { name: "Lowe's", hostname: "lowes.com" },
        { name: "eBay", hostname: "ebay.com" },
        { name: "Staples", hostname: "staples.com" },
    ],
    India: [
        { name: "Amazon", hostname: "amazon.in" },
        { name: "Flipkart", hostname: "flipkart.com" },
        { name: "Myntra", hostname: "myntra.com" },
        { name: "Zomato", hostname: "zomato.com" },
        { name: "Swiggy", hostname: "swiggy.com" },
        { name: "BigBasket", hostname: "bigbasket.com" },
        { name: "BookMyShow", hostname: "bookmyshow.com" },
    ],
    Canada: [
        { name: "Amazon", hostname: "amazon.ca" },
        { name: "Best Buy", hostname: "bestbuy.ca" },
        { name: "Home Depot", hostname: "homedepot.ca" },
        { name: "DoorDash", hostname: "doordash.com" },
        { name: "Uber Eats", hostname: "ubereats.com/ca" },
        { name: "Walmart", hostname: "walmart.ca" },
        { name: "Etsy", hostname: "etsy.com/ca" },
        { name: "Costco", hostname: "costco.ca" },
        { name: "Indigo", hostname: "indigo.ca" },
        { name: "Canadian Tire", hostname: "canadiantire.ca" },
        { name: "Hudson's Bay", hostname: "thebay.com" },
        { name: "Staples", hostname: "staples.ca" },
    ],
};

// Load spending data and dynamically populate the UI based on the selected country
function populateWebsites(country) {
    chrome.storage.local.get(["spendingData", "favourites"], (result) => {
        const spendingData = result.spendingData || {};
        const favourites = result.favourites || [];
        const favouriteList = document.getElementById("favourites");
        const otherList = document.getElementById("others");

        // Clear previous items
        favouriteList.innerHTML = "";
        otherList.innerHTML = "";

        // Get supported sites for the selected country
        const supportedSites = supportedSitesByCountry[country] || [];

        // Handle empty favorites
        if (favourites.length === 0) {
            favouriteList.innerHTML = "<p>No limits set. Select websites below to manage spending limits.</p>";
        }

        supportedSites.forEach((site) => {
            const siteData = spendingData[site.hostname] || { limit: 9999999999999, current: 0 };
        
            const websiteItem = document.createElement("div");
            websiteItem.className = "website-item";
        
            const info = document.createElement("div");
            info.className = "info";
        
            if (favourites.includes(site.hostname)) {
                info.innerHTML = `
                    <div class="flex-card">
                        <div>
                            <div class="fav-store-name">${site.name}</div>
                            <span class="limit-display"><em>${site.hostname}</em></span>
                        </div>
                        <div class="limit-display">
                            $${Math.round(siteData.current)} / ${siteData.limit === 9999999999999 ? '' : `$${Math.round(siteData.limit)}`}
                        </div>
                    </div>
                `;
        
                const actionsContainer = document.createElement("div");
                actionsContainer.className = "limit-actions"; // Use flexbox for space-between
        
                // Container for limit input and save button
                const inputSaveContainer = document.createElement("div");
                inputSaveContainer.className = "input-save-container";
        
                // Input for limit editing
                const limitInput = document.createElement("input");
                limitInput.type = "number";
                limitInput.className = "limit-input";
                limitInput.placeholder = "Enter limit";
                limitInput.value = siteData.limit === 9999999999999 ? "" : siteData.limit;
        
                // Save button
                const saveButton = document.createElement("button");
                saveButton.className = "save-btn";
                saveButton.textContent = "💾";
                saveButton.addEventListener("click", () => {
                    const newLimit = parseFloat(limitInput.value) || 0;
                    spendingData[site.hostname] = { ...siteData, limit: newLimit };
                    chrome.storage.local.set({ spendingData }, () => {
                        alert(`${site.name} limit updated to $${newLimit}`);
                    });
                });
        
                inputSaveContainer.appendChild(limitInput);
                inputSaveContainer.appendChild(saveButton);
        
                // Remove button
                const removeButton = document.createElement("button");
                removeButton.className = "remove-btn";
                removeButton.textContent = "—";
                removeButton.addEventListener("click", () => {
                    const index = favourites.indexOf(site.hostname);
                    if (index !== -1) {
                        favourites.splice(index, 1);
                        spendingData[site.hostname] = { ...siteData, limit: 9999999999999 }; // Reset limit to default
                        chrome.storage.local.set({ favourites, spendingData }, () => {
                            alert(`${site.name} removed from favourites`);
                            populateWebsites(country);
                        });
                    }
                });
        
                // Append both containers to actionsContainer
                actionsContainer.appendChild(inputSaveContainer);
                actionsContainer.appendChild(removeButton);
        
                info.appendChild(actionsContainer);
                websiteItem.appendChild(info);
                favouriteList.appendChild(websiteItem);
            } else {
                // Hidden stores layout
                const flexContainer = document.createElement("div");
                flexContainer.className = "flex-card";
        
                const textSection = document.createElement("div");
                textSection.innerHTML = `
                    <div class="fav-store-name">${site.name}</div>
                    <span class="limit-display"><em>${site.hostname}</em></span>
                `;
        
                const addButton = document.createElement("button");
                addButton.className = "add-btn";
                addButton.textContent = "+";
                addButton.addEventListener("click", () => {
                    favourites.push(site.hostname);
                    chrome.storage.local.set({ favourites }, () => {
                        alert(`${site.name} added to favourites`);
                        populateWebsites(country);
                    });
                });
        
                flexContainer.appendChild(textSection);
                flexContainer.appendChild(addButton);
        
                websiteItem.appendChild(flexContainer);
                otherList.appendChild(websiteItem);
            }
        });
    });
}

// Initialize the country dropdown and populate websites
document.addEventListener("DOMContentLoaded", () => {
    const countrySelect = document.getElementById("country-select");

    // Set default country or use saved country preference
    const savedCountry = localStorage.getItem("selectedCountry") || "USA";
    countrySelect.value = savedCountry;
    populateWebsites(savedCountry);

    // Update websites on country change
    countrySelect.addEventListener("change", (e) => {
        const selectedCountry = e.target.value;
        localStorage.setItem("selectedCountry", selectedCountry);
        populateWebsites(selectedCountry);
    });

    document.getElementById("toggle-dropdown").addEventListener("click", (e) => {
        const dropdown = document.getElementById("dropdown-list");
        if (dropdown.classList.contains("hidden")) {
            dropdown.classList.remove("hidden");
            e.target.textContent = "Hide More Stores";
        } else {
            dropdown.classList.add("hidden");
            e.target.textContent = "Show More Stores";
        }
    });
});