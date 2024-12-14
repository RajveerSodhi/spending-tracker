const supportedSitesByCountry = {
    USA: [
        { name: "Amazon (.com)", hostname: "amazon.com" },
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
        { name: "Wayfair", hostname: "wayfair.com" },
        { name: "Nordstrom", hostname: "nordstrom.com" },
        { name: "Zappos", hostname: "zappos.com" },
        { name: "eBay", hostname: "ebay.com" },
        { name: "Staples", hostname: "staples.com" },
    ],
    India: [
        { name: "Amazon (.in)", hostname: "amazon.in" },
        { name: "Flipkart", hostname: "flipkart.com" },
        { name: "Myntra", hostname: "myntra.com" },
        { name: "Zomato", hostname: "zomato.com" },
        { name: "Swiggy", hostname: "swiggy.com" },
        { name: "BigBasket", hostname: "bigbasket.com" },
        { name: "Nykaa", hostname: "nykaa.com" },
        { name: "BookMyShow", hostname: "bookmyshow.com" },
    ],
    Canada: [
        { name: "Amazon (.ca)", hostname: "amazon.ca" },
        { name: "Best Buy (.ca)", hostname: "bestbuy.ca" },
        { name: "Home Depot", hostname: "homedepot.ca" },
        { name: "DoorDash", hostname: "doordash.com" },
        { name: "Uber Eats (.ca)", hostname: "ubereats.com/ca" },
        { name: "Walmart (.ca)", hostname: "walmart.ca" },
        { name: "Etsy (.ca)", hostname: "etsy.com/ca" },
        { name: "Costco (.ca)", hostname: "costco.ca" },
        { name: "Indigo", hostname: "indigo.ca" },
        { name: "SportChek", hostname: "sportchek.ca" },
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
            info.innerHTML = `
                <span>${site.name}</span>
                ${favourites.includes(site.hostname) ? `
                <span>Spent: $${siteData.current.toFixed(2)} / Limit: $<input class="limit-input" type="number" value="${siteData.limit}" data-hostname="${site.hostname}" /></span>` 
                : ""}
            `;
            websiteItem.appendChild(info);

            if (favourites.includes(site.hostname)) {
                const saveButton = document.createElement("button");
                saveButton.className = "save-btn";
                saveButton.textContent = "Save";
                saveButton.addEventListener("click", () => {
                    const newLimit = parseFloat(info.querySelector(".limit-input").value) || 0;
                    spendingData[site.hostname] = { ...siteData, limit: newLimit };
                    chrome.storage.local.set({ spendingData }, () => {
                        alert(`${site.name} limit updated to $${newLimit}`);
                    });
                });
                websiteItem.appendChild(saveButton);

                const removeButton = document.createElement("button");
                removeButton.className = "remove-btn";
                removeButton.textContent = "Remove";
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
                websiteItem.appendChild(removeButton);

                favouriteList.appendChild(websiteItem);
            } else {
                const addButton = document.createElement("button");
                addButton.className = "add-btn";
                addButton.textContent = "Add";
                addButton.addEventListener("click", () => {
                    favourites.push(site.hostname);
                    chrome.storage.local.set({ favourites }, () => {
                        alert(`${site.name} added to favourites`);
                        populateWebsites(country);
                    });
                });
                websiteItem.appendChild(addButton);
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
});