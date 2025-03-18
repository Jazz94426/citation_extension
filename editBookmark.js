document.addEventListener("DOMContentLoaded", () => {
    const editBookmarkTitle = document.getElementById("editBookmarkTitle");
    const editSavePageUrl = document.getElementById("editSavePageUrl");
    const editBookmarkUrl = document.getElementById("editBookmarkUrl");
    const editUrlInputContainer = document.getElementById("editUrlInputContainer");
    const editCategorySelect = document.getElementById("editCategorySelect");
    const editNewCategoryInput = document.getElementById("editNewCategoryInput");
    const cancelEditBookmark = document.getElementById("cancelEditBookmark");
    const saveEditBookmark = document.getElementById("saveEditBookmark");

    let currentEditingBookmarkId = null;

    // Load the bookmark data into the form
    chrome.storage.sync.get(["editingBookmark", "bookmarkCategories"], (result) => {
        const bookmark = result.editingBookmark;
        const categories = result.bookmarkCategories || {};

        // Populate category dropdown
        editCategorySelect.innerHTML = `<option value="">No Category</option>`;
        Object.keys(categories).forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            editCategorySelect.appendChild(option);
        });

        if (bookmark) {
            currentEditingBookmarkId = bookmark.id;
            editBookmarkTitle.value = bookmark.title || "";
            editBookmarkUrl.value = bookmark.url || "";
            editSavePageUrl.checked = !!bookmark.url;
            editUrlInputContainer.classList.toggle("visible", !!bookmark.url);
            editCategorySelect.value = bookmark.category || "";
        }
    });

    // Handle the "Save" button click
    saveEditBookmark.addEventListener("click", () => {
        const updatedTitle = editBookmarkTitle.value.trim();
        const updatedUrl = editSavePageUrl.checked ? editBookmarkUrl.value.trim() : null;
        let updatedCategory = editCategorySelect.value;

        if (!updatedTitle) {
            alert("Title cannot be empty.");
            return;
        }

        if (!updatedCategory && editNewCategoryInput.value.trim()) {
            updatedCategory = editNewCategoryInput.value.trim();
        }

        chrome.storage.sync.get(["citationBookmarks", "bookmarkCategories"], (result) => {
            const bookmarks = result.citationBookmarks || [];
            const categories = result.bookmarkCategories || {};
            const bookmarkIndex = bookmarks.findIndex(b => b.id === currentEditingBookmarkId);

            if (bookmarkIndex !== -1) {
                const bookmark = bookmarks[bookmarkIndex];

                // Update bookmark details
                bookmark.title = updatedTitle;
                bookmark.url = updatedUrl;

                // Handle category changes
                if (bookmark.category && categories[bookmark.category]) {
                    categories[bookmark.category] = categories[bookmark.category].filter(id => id !== bookmark.id);
                }

                if (updatedCategory) {
                    if (!categories[updatedCategory]) {
                        categories[updatedCategory] = [];
                    }
                    categories[updatedCategory].push(bookmark.id);
                }

                bookmark.category = updatedCategory;

                // Save updated data
                chrome.storage.sync.set({ citationBookmarks: bookmarks, bookmarkCategories: categories }, () => {
                    alert("Bookmark updated successfully.");
                    // Redirect back to the bookmarks tab
                    chrome.storage.sync.set({ editingBookmark: null }, () => {
                        window.location.href = "popup.html";
                        setTimeout(() => {
                            document.getElementById("bookmarksTab").click();
                        }, 100);
                    });
                });
            } else {
                alert("Failed to find the bookmark to edit.");
            }
        });
    });

    // Handle the "Cancel" button click
    cancelEditBookmark.addEventListener("click", () => {
        // Redirect back to the bookmarks tab
        chrome.storage.sync.set({ editingBookmark: null }, () => {
            window.location.href = "popup.html";
            setTimeout(() => {
                document.getElementById("bookmarksTab").click();
            }, 100);
        });
    });

    // Toggle the URL input container visibility
    editSavePageUrl.addEventListener("change", (e) => {
        editUrlInputContainer.classList.toggle("visible", e.target.checked);
    });
});
