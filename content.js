// Define patterns for order confirmation paths for different websites
const orderConfirmationPaths = [
    "/thank-you", // Amazon, etc.
    "/order-confirmation", // Best Buy, etc.
    "/order-summary", // Flipkart, etc.
    "/confirmation" // Uber Eats, DoorDash, etc.
];

// Check if the current URL matches any of the order confirmation paths
if (orderConfirmationPaths.some(path => window.location.pathname.includes(path))) {
    const hostname = window.location.hostname.replace("www.", ""); // Normalize hostname

    chrome.runtime.sendMessage({
        action: "recordPurchase",
        hostname: hostname // Send the hostname to identify the website
    });
}