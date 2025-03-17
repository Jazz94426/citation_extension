document.addEventListener("DOMContentLoaded", () => {
    const formFields = document.getElementById("formFields");
    const citationOutput = document.getElementById("citationOutput");
    const generateButton = document.getElementById("generateCitation");
    const copyButton = document.getElementById("copyButton");
    const bookmarkButton = document.getElementById("bookmarkButton");
    const bookmarksList = document.getElementById("bookmarksList");

    const generatorTab = document.getElementById("generatorTab");
    const bookmarksTab = document.getElementById("bookmarksTab");
    const generatorPanel = document.getElementById("generatorPanel");
    const bookmarksPanel = document.getElementById("bookmarksPanel");
    
    const bookmarkModal = document.getElementById("bookmarkModal");
    const bookmarkTitle = document.getElementById("bookmarkTitle");
    const savePageUrl = document.getElementById("savePageUrl");
    const saveBookmarkBtn = document.getElementById("saveBookmark");
    const cancelBookmarkBtn = document.getElementById("cancelBookmark");
    const urlInputContainer = document.getElementById("urlInputContainer");
    const bookmarkUrl = document.getElementById("bookmarkUrl");
    

    let currentPageUrl = "";

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        currentPageUrl = tabs[0].url;
    });
    
    const bookmarkManager = new BookmarkManager();
    
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

    let selectedThesisType = "doctoral"; 

    document.querySelectorAll(".citation-btn").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".citation-btn").forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            const type = button.getAttribute("data-type");
            

            const thesisTypeSelector = document.getElementById("thesisTypeSelector");
            if (type === "thesis") {
                thesisTypeSelector.classList.remove("hidden");
            } else {
                thesisTypeSelector.classList.add("hidden");
            }
            
            renderFormFields(type);
        });
    });


    document.querySelectorAll(".thesis-type-btn").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".thesis-type-btn").forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            
            const type = button.getAttribute("data-type");
            selectedThesisType = type;
            
            const otherInput = document.getElementById("otherThesisType");
            const universityInput = document.getElementById("university");
            
            if (type === "other") {
                otherInput.classList.remove("hidden");
                if (universityInput) universityInput.classList.add("hidden");
            } else {
                otherInput.classList.add("hidden");
                if (universityInput) universityInput.classList.remove("hidden");
            }
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
        const formats = {
            book: `${values.authorLast}, ${values.authorFirst}. (${values.year}). <i>${values.title} (${values.edition})</i>. ${values.publisher}.`,
            chapter: `${values.chapterAuthorLast}, ${values.chapterAuthorFirst}. (${values.year}). ${values.chapterTitle}. In ${values.editorLast}, ${values.editorFirst} (ed.), <i>${values.bookTitle} (${values.edition})</i> (pp.: ${values.pages}). ${values.publisher}.`,
            thesis: `${values.authorLast}, ${values.authorFirst}. (${values.year}). <i>${values.title}</i>. (${values.reference}) [${getThesisTypeText()}, ${values.university}].`,
            journal: `${values.authorLast}, ${values.authorFirst}. (${values.year}). ${values.title}. <i>${values.journalTitle}</i>, ${values.volume}(${values.issue}), ${values.pages}.`,
            webpage: `${values.website}. <i>${values.title}</i>. ${values.url}. (Accessed on ${values.accessDate}).`
        };
        return formats[type] || "";
    }

    function getThesisTypeText() {
        switch (selectedThesisType) {
            case "doctoral":
                return "Doctoral thesis";
            case "masters":
                return "Master's thesis";
            case "other":
                const otherInput = document.getElementById("otherThesisType");
                return otherInput.value.trim() || "Thesis";
            default:
                return "Thesis";
        }
    }

    copyButton.addEventListener("click", () => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = citationOutput.innerHTML;
        
        const tempTextarea = document.createElement('textarea');
        
        const textContent = tempDiv.innerText;
        tempTextarea.value = textContent;
        
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextarea);
        
        copyButton.textContent = "Copied!";
        setTimeout(() => {
            copyButton.textContent = "Copy";
        }, 1500);
    });
    
    bookmarkButton.addEventListener("click", () => {
        if (citationOutput.innerHTML.trim() === "") return;
        
        bookmarkModal.classList.remove("hidden");
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            currentPageUrl = tabs[0].url;
            bookmarkUrl.value = currentPageUrl;
        });
        
        if (savePageUrl.checked) {
            urlInputContainer.classList.add("visible");
        } else {
            urlInputContainer.classList.remove("visible");
        }
        
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
        const citation = citationOutput.innerHTML;
        const selectedType = document.querySelector(".citation-btn.active")?.getAttribute("data-type");
        const title = bookmarkTitle.value.trim() || `Citation ${Date.now()}`;
        const url = savePageUrl.checked ? bookmarkUrl.value : null;
        
        bookmarkManager.addBookmark(citation, selectedType, title, url);
        
        bookmarkTitle.value = "";
        bookmarkUrl.value = "";
        bookmarkModal.classList.add("hidden");
    });
    
    cancelBookmarkBtn.addEventListener("click", () => {
        bookmarkModal.classList.add("hidden");
    });
    
    savePageUrl.addEventListener("change", (e) => {
        if (e.target.checked) {
            urlInputContainer.classList.add("visible");
            bookmarkUrl.value = currentPageUrl;
        } else {
            urlInputContainer.classList.remove("visible");
        }
    });
    
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
            citation.innerHTML = bookmark.citation;
            
            const controls = document.createElement("div");
            controls.className = "bookmark-controls";
            
            const copyBtn = document.createElement("button");
            copyBtn.className = "bookmark-copy-btn";
            copyBtn.textContent = "Copy";
            copyBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = bookmark.citation;
                
                const tempTextarea = document.createElement("textarea");
                tempTextarea.value = tempDiv.innerText;
                document.body.appendChild(tempTextarea);
                tempTextarea.select();
                document.execCommand("copy");
                document.body.removeChild(tempTextarea);


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
                bookmarkManager.deleteBookmark(bookmark.id);
                loadBookmarks();
            });
            
            if (bookmark.url) {
                const visitBtn = document.createElement("button");
                visitBtn.className = "bookmark-visit-btn";
                visitBtn.textContent = "Visit";
                visitBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    chrome.tabs.create({ url: bookmark.url });
                });
                controls.appendChild(visitBtn);
            }
            
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
    
    const firstCitationBtn = document.querySelector(".citation-btn");
    if (firstCitationBtn) {
        firstCitationBtn.classList.add("active");
        renderFormFields(firstCitationBtn.getAttribute("data-type"));
    }
});