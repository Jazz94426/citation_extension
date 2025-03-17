class BookmarkManager {
  constructor() {
    this.bookmarks = [];
    this.loadBookmarks();
  }

  async loadBookmarks() {
    return new Promise((resolve) => {
      chrome.storage.sync.get('citationBookmarks', (result) => {
        this.bookmarks = result.citationBookmarks || [];
        console.log("Loaded bookmarks:", this.bookmarks);
        resolve(this.bookmarks);
      });
    });
  }

  saveBookmarks() {
    console.log("Saving bookmarks:", this.bookmarks); 
    chrome.storage.sync.set({ 'citationBookmarks': this.bookmarks });
  }

  addBookmark(citation, type, title, url = null) {
    const bookmark = {
        id: Date.now(),
        citation: citation,
        type: type,
        title: title || `Citation ${this.bookmarks.length + 1}`,
        date: new Date().toLocaleDateString(),
        url: url
    };
    
    this.bookmarks.push(bookmark);
    this.saveBookmarks();
    return bookmark;
  }

  deleteBookmark(id) {
    this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== id);
    this.saveBookmarks();
  }

  getBookmarks() {
    return this.bookmarks;
  }
}

window.BookmarkManager = BookmarkManager;