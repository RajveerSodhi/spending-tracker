const supportedSites = [
    "*.amazon.com",
    "*.amazon.ca",
    "*.amazon.in",
    "*.bestbuy.com",
    "*.doordash.com",
    "*.ubereats.com",
    "*.flipkart.com",
    "*.ebay.com",
    "*.target.com",
    "*.walmart.com",
    "*.etsy.com",
    "*.costco.com",
    "*.shein.com",
    "*.myntra.com"
];

// Initialize default spending data
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed. Initializing spending data...");
    chrome.storage.local.get(["spendingData"], (result) => {
        if (!result.spendingData) {
            console.log("No existing spending data. Setting defaults...");
            const initialData = {};
            supportedSites.forEach((site) => {
                initialData[site] = { limit: 9999999999999, current: 0 }; // Default limits
            });
            chrome.storage.local.set({ spendingData: initialData }, () => {
                console.log("Default spending data set:", initialData);
            });
        } else {
            console.log("Existing spending data found:", result.spendingData);
        }
    });
});

// Track spending when purchases are made
chrome.webNavigation.onCompleted.addListener((details) => {
    const url = new URL(details.url);
    const hostname = url.hostname.replace("www.", "");

    if (url.pathname.includes("/thank-you") || url.pathname.includes("/order-confirmation")) {
        console.log(`Detected purchase completion on ${hostname}`);
        chrome.storage.local.get(["spendingData"], (result) => {
            const data = result.spendingData || {};
            const siteData = data[hostname];
            if (siteData) {
                const amount = parseFloat(prompt(`Enter the amount spent on ${hostname}:`)) || 0;
                console.log(`User entered amount: $${amount}`);
                siteData.current += amount;
                console.log(`Updated spending for ${hostname}:`, siteData);

                if (siteData.current >= siteData.limit) {
                    console.log(`${hostname} has exceeded its spending limit. Adding block rule.`);
                    chrome.declarativeNetRequest.updateDynamicRules({
                        addRules: [
                            {
                                id: hostname.length,
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

                chrome.storage.local.set({ spendingData: data }, () => {
                    console.log("Spending data saved:", data);
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
                    removeRuleIds: Array.from({ length: 100 }, (_, i) => i + 1)
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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