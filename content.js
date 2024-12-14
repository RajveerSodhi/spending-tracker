// Define patterns for order confirmation paths for different websites
const orderConfirmationPaths = [
    "/thankyou",
    "/thank-you",
    "/order-confirmation",
    "/order-summary",
    "/confirmation"
];

// Check if the current URL matches any of the order confirmation paths
if (orderConfirmationPaths.some(path => window.location.pathname.includes(path))) {
    const hostname = window.location.hostname.replace("www.", ""); // Normalize hostname

    chrome.runtime.sendMessage({
        action: "recordPurchase",
        hostname: hostname // Send the hostname to identify the website
    });
}