// Background script for the Citation Generator extension
// This can be used for any additional functionality that needs to run in the background

chrome.runtime.onInstalled.addListener(() => {
    console.log("Citation Generator Extension installed");
    
    // Initialize empty bookmarks array if it doesn't exist
    chrome.storage.sync.get('citationBookmarks', (result) => {
        if (!result.citationBookmarks) {
            chrome.storage.sync.set({ 'citationBookmarks': [] });
        }
    });
});