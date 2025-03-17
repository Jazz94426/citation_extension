// Handles all bookmark-related operations

class BookmarkManager {
  constructor() {
    this.bookmarks = [];
    this.loadBookmarks();
  }

  // Load bookmarks from chrome storage
  async loadBookmarks() {
    return new Promise((resolve) => {
      chrome.storage.sync.get('citationBookmarks', (result) => {
        this.bookmarks = result.citationBookmarks || [];
        resolve(this.bookmarks);
      });
    });
  }

  // Save bookmarks to chrome storage
  saveBookmarks() {
    chrome.storage.sync.set({ 'citationBookmarks': this.bookmarks });
  }

  // Add a new bookmark
  addBookmark(citation, type, title) {
    const bookmark = {
      id: Date.now(),
      citation: citation,
      type: type,
      title: title || `Citation ${this.bookmarks.length + 1}`,
      date: new Date().toLocaleDateString()
    };
    
    this.bookmarks.push(bookmark);
    this.saveBookmarks();
    return bookmark;
  }

  // Remove a bookmark by ID
  removeBookmark(id) {
    this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== id);
    this.saveBookmarks();
  }

  // Get all bookmarks
  getBookmarks() {
    return this.bookmarks;
  }
}

// Export the BookmarkManager
window.BookmarkManager = BookmarkManager;