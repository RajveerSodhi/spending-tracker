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

// Generate the supportedSites array dynamically
const supportedSites = Object.values(supportedSitesByCountry)
    .flat()
    .map((site) => `*.${site.hostname}`);

// Initialize default spending data
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed. Initializing spending data...");
    chrome.storage.local.get(["spendingData", "lastResetTime"], (result) => {
        const currentTime = Date.now();

        if (!result.spendingData) {
            console.log("No existing spending data. Setting defaults...");
            const initialData = {};
            supportedSites.forEach((site) => {
                initialData[site] = { limit: 9999999999999, current: 0 }; // Default limits
            });
            chrome.storage.local.set({
                spendingData: initialData,
                lastResetTime: currentTime // Store the initial reset time
            }, () => {
                console.log("Default spending data set:", initialData);
            });
        } else {
            console.log("Existing spending data found:", result.spendingData);
        }
    });
});

// Function to calculate time remaining until the next midnight
const getTimeUntilMidnight = () => {
    const now = new Date();
    const nextMidnight = new Date();
    nextMidnight.setDate(now.getDate() + 1); // Go to the next day
    nextMidnight.setHours(0, 0, 0, 0); // Set time to 00:00:00
    return nextMidnight - now; // Difference in milliseconds
};

// Function to reset daily spending at midnight
const resetSpendingAtMidnight = () => {
    chrome.storage.local.get(["spendingData"], (result) => {
        const spendingData = result.spendingData || {};
        Object.keys(spendingData).forEach((site) => {
            spendingData[site].current = 0; // Reset current spending to 0
        });

        chrome.storage.local.set({ spendingData }, () => {
            console.log("Spending data has been reset at midnight:", spendingData);
        });
    });

    // Schedule the next reset at the next midnight
    const timeUntilNextMidnight = getTimeUntilMidnight();
    setTimeout(resetSpendingAtMidnight, timeUntilNextMidnight);
};

// Schedule the first reset at midnight
const timeUntilMidnight = getTimeUntilMidnight();
setTimeout(resetSpendingAtMidnight, timeUntilMidnight);

console.log(`Next spending reset scheduled in ${Math.round(timeUntilMidnight / 1000 / 60)} minutes.`);

// Track spending when purchases are made
chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.action === "recordPurchase" && message.hostname) {
        const hostname = message.hostname;

        // Fetch stored spending data
        chrome.storage.local.get(["spendingData"], (result) => {
            const spendingData = result.spendingData || {};
            const siteData = spendingData[hostname];

            if (siteData) {
                // Prompt user to enter the amount spent
                const amount = parseFloat(prompt(`Enter the amount spent on ${hostname}:`)) || 0;

                // Update the spending for the site
                siteData.current += amount;

                // Check if spending exceeds the limit
                if (siteData.current >= siteData.limit) {
                    console.log(`${hostname} has exceeded its spending limit. Adding block rule.`);
                    chrome.declarativeNetRequest.updateDynamicRules({
                        addRules: [
                            {
                                id: hostname.length, // Use hostname length as a unique ID
                                priority: 1,
                                action: {
                                    type: "redirect",
                                    redirect: { extensionPath: "/blocked.html" }
                                },
                                condition: {
                                    urlFilter: hostname,
                                    resourceTypes: ["main_frame"]
                                }
                            }
                        ]
                    });
                }

                // Save updated spending data
                spendingData[hostname] = siteData;
                chrome.storage.local.set({ spendingData }, () => {
                    console.log(`Updated spending data for ${hostname}:`, siteData);
                });
            } else {
                console.log(`No spending data found for ${hostname}`);
            }
        });
    }
});

// Unblock sites when the limit is updated
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local" && changes.spendingData) {
        console.log("Spending data updated:", changes.spendingData.newValue);

        const updatedData = changes.spendingData.newValue;

        Object.keys(updatedData).forEach((site) => {
            const siteData = updatedData[site];
            const ruleId = site.length; // Unique rule ID based on site length

            if (siteData.current < siteData.limit) {
                console.log(`Spending is below limit for ${site}. Removing block rule.`);
                chrome.declarativeNetRequest.updateDynamicRules({
                    removeRuleIds: [ruleId]
                }, () => {
                    console.log(`Block rule removed for ${site}`);
                });
            } else {
                console.log(`${site} is still over the limit. Keeping block rule.`);
                chrome.declarativeNetRequest.updateDynamicRules({
                    addRules: [
                        {
                            id: ruleId,
                            priority: 1,
                            action: {
                                type: "redirect",
                                redirect: { extensionPath: "/blocked.html" }
                            },
                            condition: {
                                urlFilter: site,
                                resourceTypes: ["main_frame"]
                            }
                        }
                    ]
                });
            }
        });
    }
});

// Handle "Close Tab" action
chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.action === "closeCurrentTab" && sender.tab) {
        chrome.tabs.remove(sender.tab.id, () => {
            console.log(`Closed tab with ID: ${sender.tab.id}`);
        });
    }
});