document.addEventListener("DOMContentLoaded", () => {
    const formFields = document.getElementById("formFields");
    const citationOutput = document.getElementById("citationOutput");
    const generateButton = document.getElementById("generateCitation");
    const copyButton = document.getElementById("copyButton");
    const bookmarkButton = document.getElementById("bookmarkButton");
    const bookmarksList = document.getElementById("bookmarksList");
    
    // Tab navigation
    const generatorTab = document.getElementById("generatorTab");
    const bookmarksTab = document.getElementById("bookmarksTab");
    const generatorPanel = document.getElementById("generatorPanel");
    const bookmarksPanel = document.getElementById("bookmarksPanel");
    
    // Modal elements
    const bookmarkModal = document.getElementById("bookmarkModal");
    const bookmarkTitle = document.getElementById("bookmarkTitle");
    const saveBookmarkBtn = document.getElementById("saveBookmark");
    const cancelBookmarkBtn = document.getElementById("cancelBookmark");
    
    // Initialize bookmark manager
    const bookmarkManager = new BookmarkManager();
    
    // Tab switching
    generatorTab.addEventListener("click", () => {
        generatorTab.classList.add("active");
        bookmarksTab.classList.remove("active");
        generatorPanel.classList.remove("hidden");
        bookmarksPanel.classList.add("hidden");
    });
    
    bookmarksTab.addEventListener("click", () => {
        bookmarksTab.classList.add("active");
        generatorTab.classList.remove("active");
        bookmarksPanel.classList.remove("hidden");
        generatorPanel.classList.add("hidden");
        loadBookmarks();
    });

    const citationTemplates = {
        book: [
            { id: "authorLast", label: "Author Last Name" },
            { id: "authorFirst", label: "Author First Initial" },
            { id: "year", label: "Year of Publication" },
            { id: "title", label: "Title" },
            { id: "edition", label: "Edition" },
            { id: "publisher", label: "Publisher" }
        ],
        chapter: [
            { id: "chapterAuthorLast", label: "Chapter Author Last Name" },
            { id: "chapterAuthorFirst", label: "Chapter Author First Initial" },
            { id: "year", label: "Year of Publication" },
            { id: "chapterTitle", label: "Chapter Title" },
            { id: "editorLast", label: "Editor Last Name" },
            { id: "editorFirst", label: "Editor First Initial" },
            { id: "bookTitle", label: "Book Title" },
            { id: "edition", label: "Edition" },
            { id: "pages", label: "Page Numbers" },
            { id: "publisher", label: "Publisher" }
        ],
        thesis: [
            { id: "authorLast", label: "Author Last Name" },
            { id: "authorFirst", label: "Author First Initial" },
            { id: "year", label: "Year" },
            { id: "title", label: "Title" },
            { id: "reference", label: "Reference Number" },
            { id: "university", label: "University" }
        ],
        journal: [
            { id: "authorLast", label: "Author Last Name" },
            { id: "authorFirst", label: "Author First Initial" },
            { id: "year", label: "Year of Publication" },
            { id: "title", label: "Title" },
            { id: "journalTitle", label: "Journal Title" },
            { id: "volume", label: "Volume" },
            { id: "issue", label: "Issue" },
            { id: "pages", label: "Pages" }
        ],
        webpage: [
            { id: "website", label: "Website Name" },
            { id: "title", label: "Title" },
            { id: "url", label: "URL" },
            { id: "accessDate", label: "Accessed Date" }
        ]
    };

    document.querySelectorAll(".citation-btn").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".citation-btn").forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            const type = button.getAttribute("data-type");
            renderFormFields(type);
        });
    });

    function renderFormFields(type) {
        formFields.innerHTML = "";
        citationTemplates[type].forEach(field => {
            const input = document.createElement("input");
            input.type = "text";
            input.id = field.id;
            input.placeholder = field.label;
            formFields.appendChild(input);
        });
    }

    generateButton.addEventListener("click", () => {
        const selectedType = document.querySelector(".citation-btn.active")?.getAttribute("data-type");
        if (!selectedType) return;

        const values = {};
        citationTemplates[selectedType].forEach(field => {
            values[field.id] = document.getElementById(field.id)?.value || "";
        });

        citationOutput.innerHTML = formatCitation(selectedType, values);
    });

    function formatCitation(type, values) {
        // Define formats with italic formatting using <i></i> tags
        const formats = {
            book: `${values.authorLast}, ${values.authorFirst}. (${values.year}). <i>${values.title} (${values.edition})</i>. ${values.publisher}.`,
            chapter: `${values.chapterAuthorLast}, ${values.chapterAuthorFirst}. (${values.year}). ${values.chapterTitle}. In ${values.editorLast}, ${values.editorFirst} (ed.), <i>${values.bookTitle} (${values.edition})</i> (pp.: ${values.pages}). ${values.publisher}.`,
            thesis: `${values.authorLast}, ${values.authorFirst}. (${values.year}). <i>${values.title}</i>. (${values.reference}) [Doctoral thesis, ${values.university}].`,
            journal: `${values.authorLast}, ${values.authorFirst}. (${values.year}). ${values.title}. <i>${values.journalTitle}</i>, ${values.volume}(${values.issue}), ${values.pages}.`,
            webpage: `${values.website}. <i>${values.title}</i>. ${values.url}. (Accessed on ${values.accessDate}).`
        };
        return formats[type] || "";
    }

    copyButton.addEventListener("click", () => {
        // For copy, we need to handle the HTML format
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = citationOutput.innerHTML;
        
        // Create a temporary textarea for the plain text version
        const tempTextarea = document.createElement('textarea');
        
        // Create text with italics represented as appropriate in plain text
        const textContent = tempDiv.innerText;
        tempTextarea.value = textContent;
        
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextarea);
        
        // Visual feedback
        copyButton.textContent = "Copied!";
        setTimeout(() => {
            copyButton.textContent = "Copy";
        }, 1500);
    });
    
    // Bookmark button functionality
    bookmarkButton.addEventListener("click", () => {
        if (citationOutput.innerHTML.trim() === "") return;
        
        // Show the bookmark modal
        bookmarkModal.classList.remove("hidden");
        
        // Generate a default title
        const selectedType = document.querySelector(".citation-btn.active")?.getAttribute("data-type");
        let defaultTitle = "";
        
        if (selectedType === "book" || selectedType === "thesis") {
            const authorLast = document.getElementById("authorLast")?.value || "";
            const year = document.getElementById("year")?.value || "";
            defaultTitle = `${authorLast} (${year})`;
        } else if (selectedType === "chapter") {
            const authorLast = document.getElementById("chapterAuthorLast")?.value || "";
            const year = document.getElementById("year")?.value || "";
            defaultTitle = `${authorLast} (${year})`;
        } else if (selectedType === "journal") {
            const authorLast = document.getElementById("authorLast")?.value || "";
            const year = document.getElementById("year")?.value || "";
            defaultTitle = `${authorLast} (${year})`;
        } else if (selectedType === "webpage") {
            defaultTitle = document.getElementById("website")?.value || "Webpage";
        }
        
        bookmarkTitle.value = defaultTitle || `Citation ${Date.now()}`;
    });
    
    saveBookmarkBtn.addEventListener("click", () => {
        const selectedType = document.querySelector(".citation-btn.active")?.getAttribute("data-type");
        const title = bookmarkTitle.value.trim();
        const citation = citationOutput.innerHTML;
        
        if (citation.trim() === "") return;
        
        bookmarkManager.addBookmark(citation, selectedType, title);
        bookmarkModal.classList.add("hidden");
    });
    
    cancelBookmarkBtn.addEventListener("click", () => {
        bookmarkModal.classList.add("hidden");
    });
    
    // Load bookmarks into the bookmarks panel
    async function loadBookmarks() {
        await bookmarkManager.loadBookmarks();
        const bookmarks = bookmarkManager.getBookmarks();
        
        bookmarksList.innerHTML = "";
        
        if (bookmarks.length === 0) {
            bookmarksList.innerHTML = "<p class='no-bookmarks'>No bookmarks yet. Create some citations and bookmark them!</p>";
            return;
        }
        
        bookmarks.forEach(bookmark => {
            const bookmarkItem = document.createElement("div");
            bookmarkItem.className = "bookmark-item";
            bookmarkItem.dataset.id = bookmark.id;
            
            const typeIcon = document.createElement("img");
            typeIcon.src = `icons/${bookmark.type}.png`;
            typeIcon.alt = bookmark.type;
            typeIcon.className = "bookmark-type-icon";
            
            const content = document.createElement("div");
            content.className = "bookmark-content";
            
            const title = document.createElement("h3");
            title.textContent = bookmark.title;
            
            const date = document.createElement("span");
            date.className = "bookmark-date";
            date.textContent = bookmark.date;
            
            const citation = document.createElement("p");
            citation.className = "bookmark-citation";
            citation.innerHTML = bookmark.citation; // Use innerHTML to preserve italic formatting
            
            const controls = document.createElement("div");
            controls.className = "bookmark-controls";
            
            const copyBtn = document.createElement("button");
            copyBtn.className = "bookmark-copy-btn";
            copyBtn.textContent = "Copy";
            copyBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                
                // Create a temporary div to handle HTML content
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = bookmark.citation;
                
                // Create a temporary textarea for the plain text version
                const tempTextarea = document.createElement("textarea");
                tempTextarea.value = tempDiv.innerText;
                document.body.appendChild(tempTextarea);
                tempTextarea.select();
                document.execCommand("copy");
                document.body.removeChild(tempTextarea);
                
                // Visual feedback
                copyBtn.textContent = "Copied!";
                setTimeout(() => {
                    copyBtn.textContent = "Copy";
                }, 1500);
            });
            
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "bookmark-delete-btn";
            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                
                if (confirm("Are you sure you want to delete this bookmark?")) {
                    bookmarkManager.removeBookmark(parseInt(bookmarkItem.dataset.id));
                    bookmarkItem.remove();
                    
                    // If no bookmarks left, show the "no bookmarks" message
                    if (bookmarkManager.getBookmarks().length === 0) {
                        bookmarksList.innerHTML = "<p class='no-bookmarks'>No bookmarks yet. Create some citations and bookmark them!</p>";
                    }
                }
            });
            
            // Append all elements
            controls.appendChild(copyBtn);
            controls.appendChild(deleteBtn);
            
            content.appendChild(title);
            content.appendChild(date);
            content.appendChild(citation);
            
            bookmarkItem.appendChild(typeIcon);
            bookmarkItem.appendChild(content);
            bookmarkItem.appendChild(controls);
            
            bookmarksList.appendChild(bookmarkItem);
        });
    }
    
    // Initialize with the first citation type selected
    const firstCitationBtn = document.querySelector(".citation-btn");
    if (firstCitationBtn) {
        firstCitationBtn.classList.add("active");
        renderFormFields(firstCitationBtn.getAttribute("data-type"));
    }
});