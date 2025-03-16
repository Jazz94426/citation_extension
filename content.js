function extractMetadata() {
    return {
        title: document.title || "Unknown Title",
        author: document.querySelector("meta[name='author']")?.content || "Unknown Author",
        date: document.querySelector("meta[name='date']")?.content || "n.d.",
        url: window.location.href
    };
}
