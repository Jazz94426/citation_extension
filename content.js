// Extract metadata from the current page
function extractMetadata() {
    return {
        title: document.title || "Unknown Title",
        author: document.querySelector("meta[name='author']")?.content || "Unknown Author",
        date: document.querySelector("meta[name='date']")?.content || "n.d.",
        url: window.location.href
    };
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getMetadata") {
        sendResponse(extractMetadata());
    }
});