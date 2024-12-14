const orderConfirmationPaths = [
    "/thankyou",
    "/thank-you",
    "/order-confirmation",
    "/order-summary",
    "/confirmation",
    "/purchase-confirmation",
    "/checkout-complete",
    "/success"
];

const orderConfirmationQueryParams = [
    "status=confirmed",
    "order=success",
    "payment=completed",
    "success=true"
];

// Check if the current URL matches any of the order confirmation paths
const isConfirmationPage =
    orderConfirmationPaths.some((path) => window.location.pathname.toLowerCase().includes(path)) ||
    orderConfirmationQueryParams.some((param) => window.location.search.toLowerCase().includes(param));

if (isConfirmationPage) {
    const hostname = window.location.hostname.replace("www.", ""); // Normalize hostname

    console.log(`Detected purchase confirmation for ${hostname}`);

    chrome.runtime.sendMessage({
        action: "recordPurchase",
        hostname: hostname // Send the hostname to identify the website
    });
}