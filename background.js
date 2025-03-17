chrome.runtime.onInstalled.addListener(() => {
    console.log("Citation Generator Extension installed");
    
    chrome.storage.sync.get('citationBookmarks', (result) => {
        if (!result.citationBookmarks) {
            chrome.storage.sync.set({ 'citationBookmarks': [] });
        }
    });
});