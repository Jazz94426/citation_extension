class BookmarkManager {
  constructor() {
    this.bookmarks = [];
    this.categories = {}; // Store categories and their associated bookmarks
    this.loadBookmarks();
  }

  async loadBookmarks() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['citationBookmarks', 'bookmarkCategories'], (result) => {
        this.bookmarks = result.citationBookmarks || [];
        this.categories = result.bookmarkCategories || {};
        console.log("Loaded bookmarks:", this.bookmarks);
        console.log("Loaded categories:", this.categories);
        resolve({ bookmarks: this.bookmarks, categories: this.categories });
      });
    });
  }

  saveBookmarks() {
    console.log("Saving bookmarks:", this.bookmarks);
    chrome.storage.sync.set({ 'citationBookmarks': this.bookmarks });
    chrome.storage.sync.set({ 'bookmarkCategories': this.categories });
  }

  addBookmark(citation, type, title, url = null, category = null) {
    const bookmark = {
        id: Date.now(),
        citation: citation,
        type: type,
        title: title || `Citation ${this.bookmarks.length + 1}`,
        date: new Date().toLocaleDateString(),
        url: url,
        category: category
    };

    this.bookmarks.push(bookmark);

    if (category) {
      if (!this.categories[category]) {
        this.categories[category] = [];
      }
      this.categories[category].push(bookmark.id);
    }

    this.saveBookmarks();
    return bookmark;
  }

  deleteBookmark(id) {
    const bookmark = this.bookmarks.find(b => b.id === id);
    if (bookmark?.category && this.categories[bookmark.category]) {
      this.categories[bookmark.category] = this.categories[bookmark.category].filter(bid => bid !== id);
    }

    this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== id);
    this.saveBookmarks();
  }

  addCategory(name) {
    if (!this.categories[name]) {
      this.categories[name] = [];
      this.saveBookmarks();
    }
  }

  getCategories() {
    return this.categories;
  }

  getBookmarks() {
    return this.bookmarks;
  }
}

window.BookmarkManager = BookmarkManager;