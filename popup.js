document.addEventListener("DOMContentLoaded", async () => {
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

    const citationButtonsContainer = document.querySelector(".styles");
    const thesisTypeSelector = document.getElementById("thesisTypeSelector");

    citationButtonsContainer.addEventListener("click", (event) => {
        const button = event.target.closest(".citation-btn");
        if (!button) return;

        document.querySelectorAll(".citation-btn").forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        const type = button.getAttribute("data-type");

        // Hide home page informational text and show citation page content
        document.getElementById("homePageInfo").classList.add("hidden");
        document.getElementById("citationPageContent").classList.remove("hidden");

        // Ensure thesis type selector visibility is toggled only for "thesis"
        if (type === "thesis") {
            thesisTypeSelector.classList.remove("hidden");
            if (!formFields.contains(thesisTypeSelector)) {
                formFields.appendChild(thesisTypeSelector);
            }
        } else {
            thesisTypeSelector.classList.add("hidden");
            if (formFields.contains(thesisTypeSelector)) {
                formFields.removeChild(thesisTypeSelector);
            }
        }

        // Hide "In-text citation" checkbox for "webpage" type
        const inTextCheckboxRow = document.querySelector(".checkbox-row");
        if (type === "webpage") {
            inTextCheckboxRow.classList.add("hidden");
        } else {
            inTextCheckboxRow.classList.remove("hidden");
        }

        // Show form fields and output container
        document.getElementById("citationForm").classList.remove("hidden");
        document.querySelector(".citation-output-container").classList.remove("hidden");

        // Render form fields for the selected citation type
        renderFormFields(type);
    });

    thesisTypeSelector.addEventListener("click", (event) => {
        const button = event.target.closest(".thesis-type-btn");
        if (!button) return;

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

    function renderFormFields(type) {
        formFields.innerHTML = "";
        citationTemplates[type].forEach(field => {
            if (["authorLast", "authorFirst", "chapterAuthorLast", "chapterAuthorFirst", "editorLast", "editorFirst"].includes(field.id)) {
                const nameContainer = document.createElement("div");
                nameContainer.className = "name-controls";

                const createNameInput = () => {
                    const input = document.createElement("input");
                    input.type = "text";
                    input.placeholder = field.label;
                    input.className = "name-input";
                    return input;
                };

                const input = createNameInput();

                const addButton = document.createElement("button");
                addButton.type = "button";
                addButton.textContent = "+";
                addButton.addEventListener("click", () => {
                    const newInput = createNameInput();
                    nameContainer.insertBefore(newInput, addButton);
                });

                const removeButton = document.createElement("button");
                removeButton.type = "button";
                removeButton.textContent = "-";
                removeButton.addEventListener("click", () => {
                    const inputs = nameContainer.querySelectorAll("input");
                    if (inputs.length > 1) {
                        nameContainer.removeChild(inputs[inputs.length - 1]);
                    }
                });

                nameContainer.appendChild(input);
                nameContainer.appendChild(addButton);
                nameContainer.appendChild(removeButton);
                formFields.appendChild(nameContainer);
            } else {
                const input = document.createElement("input");
                input.type = "text";
                input.id = field.id;
                input.placeholder = field.label;
                formFields.appendChild(input);
            }
        });
    }

    generateButton.addEventListener("click", () => {
        const selectedType = document.querySelector(".citation-btn.active")?.getAttribute("data-type");
        if (!selectedType) return;

        const isInTextCitation = document.getElementById("inTextCitation").checked;

        const values = {};
        citationTemplates[selectedType].forEach(field => {
            if (["authorLast", "authorFirst", "chapterAuthorLast", "chapterAuthorFirst", "editorLast", "editorFirst"].includes(field.id)) {
                // Collect all values for dynamically added inputs
                const inputs = Array.from(formFields.querySelectorAll(`.name-input[placeholder="${field.label}"]`));
                if (field.id.includes("Last")) {
                    values[field.id] = inputs.map(input => input.value.trim());
                } else if (field.id.includes("First")) {
                    values[field.id] = inputs.map(input => input.value.trim().charAt(0).toUpperCase() + ".");
                }
            } else {
                const input = document.getElementById(field.id);
                values[field.id] = input?.value || "";
            }
        });

        // Combine last names and first initials into the correct format
        if (values.authorLast && values.authorFirst) {
            const authors = values.authorLast.map((lastName, index) => {
                const firstInitial = values.authorFirst[index] || "";
                return `${lastName}, ${firstInitial}`;
            });

            if (authors.length === 2) {
                values.authors = `${authors[0]} & ${authors[1]}`;
            } else if (isInTextCitation && authors.length > 3) {
                values.authors = `${authors.slice(0, 3).join(", ")} et al.`;
            } else {
                values.authors = authors.join(" ");
            }
        }

        if (isInTextCitation) {
            citationOutput.innerHTML = `${values.authors} (${values.year})`;
        } else {
            citationOutput.innerHTML = formatCitation(selectedType, values);
        }
    });

    function formatCitation(type, values) {
        const formats = {
            book: `${values.authors} (${values.year}). <i>${values.title} (${values.edition})</i>. ${values.publisher}.`,
            chapter: `${values.authors} (${values.year}). ${values.chapterTitle}. In ${values.editorLast}, ${values.editorFirst} (ed.), <i>${values.bookTitle} (${values.edition})</i> (pp.: ${values.pages}). ${values.publisher}.`,
            thesis: `${values.authors} (${values.year}). <i>${values.title}</i>. (${values.reference}) [${getThesisTypeText()}, ${values.university}].`,
            journal: `${values.authors} (${values.year}). ${values.title}. <i>${values.journalTitle}</i>, ${values.volume}(${values.issue}), ${values.pages}.`,
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
    
    const categorySelect = document.createElement("select");
    categorySelect.id = "categorySelect";
    categorySelect.innerHTML = `<option value="">No Category</option>`;

    const newCategoryInput = document.createElement("input");
    newCategoryInput.type = "text";
    newCategoryInput.id = "newCategoryInput";
    newCategoryInput.placeholder = "New Category";

    const categoryContainer = document.createElement("div");
    categoryContainer.className = "category-container";
    categoryContainer.appendChild(categorySelect);
    categoryContainer.appendChild(newCategoryInput);

    const modalContent = bookmarkModal.querySelector(".modal-content");
    modalContent.insertBefore(categoryContainer, modalContent.querySelector(".button-row"));

    await bookmarkManager.loadBookmarks();

    function populateCategorySelect() {
        categorySelect.innerHTML = `<option value="">No Category</option>`;
        const categories = bookmarkManager.getCategories();
        Object.keys(categories).forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    populateCategorySelect();

    saveBookmarkBtn.addEventListener("click", () => {
        const citation = citationOutput.innerHTML;
        const selectedType = document.querySelector(".citation-btn.active")?.getAttribute("data-type");
        const title = bookmarkTitle.value.trim() || `Citation ${Date.now()}`;
        const url = savePageUrl.checked ? bookmarkUrl.value : null;

        let category = categorySelect.value;
        if (!category && newCategoryInput.value.trim()) {
            category = newCategoryInput.value.trim();
            bookmarkManager.addCategory(category);
        } else if (!category && !newCategoryInput.value.trim()) {
            category = null; // No category if nothing is selected or written
        }

        bookmarkManager.addBookmark(citation, selectedType, title, url, category);

        bookmarkTitle.value = "";
        bookmarkUrl.value = "";
        newCategoryInput.value = "";
        bookmarkModal.classList.add("hidden");
        populateCategorySelect();
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
        const categories = bookmarkManager.getCategories();

        // Automatically delete empty categories
        Object.keys(categories).forEach(category => {
            if (categories[category].length === 0) {
                bookmarkManager.deleteCategory(category);
            }
        });

        bookmarksList.innerHTML = "";

        if (bookmarks.length === 0) {
            bookmarksList.innerHTML = "<p class='no-bookmarks'>No bookmarks yet. Create some citations and bookmark them!</p>";
            return;
        }

        // Create a section for uncategorized bookmarks
        const uncategorizedSection = document.createElement("div");
        uncategorizedSection.className = "category-section";

        const uncategorizedHeader = document.createElement("div");
        uncategorizedHeader.className = "category-header";
        uncategorizedHeader.innerHTML = `<span>Uncategorized</span> <span class="arrow">▶</span>`;
        uncategorizedSection.appendChild(uncategorizedHeader);

        const uncategorizedList = document.createElement("div");
        uncategorizedList.className = "bookmark-list hidden";
        bookmarks
            .filter(bookmark => !bookmark.category)
            .forEach(bookmark => uncategorizedList.appendChild(createBookmarkItem(bookmark)));
        uncategorizedSection.appendChild(uncategorizedList);

        bookmarksList.appendChild(uncategorizedSection);

        // Add toggle functionality for uncategorized bookmarks
        uncategorizedHeader.addEventListener("click", () => {
            uncategorizedList.classList.toggle("hidden");
            const arrow = uncategorizedHeader.querySelector(".arrow");
            arrow.textContent = uncategorizedList.classList.contains("hidden") ? "▶" : "▼";
        });

        // Create sections for each category
        Object.keys(categories).forEach(category => {
            const categorySection = document.createElement("div");
            categorySection.className = "category-section";

            const categoryHeader = document.createElement("div");
            categoryHeader.className = "category-header";
            categoryHeader.innerHTML = `<span>${category}</span> <span class="arrow">▶</span>`;
            categorySection.appendChild(categoryHeader);

            const categoryList = document.createElement("div");
            categoryList.className = "bookmark-list hidden";
            bookmarks
                .filter(bookmark => bookmark.category === category)
                .forEach(bookmark => categoryList.appendChild(createBookmarkItem(bookmark)));
            categorySection.appendChild(categoryList);

            bookmarksList.appendChild(categorySection);

            // Add toggle functionality for category bookmarks
            categoryHeader.addEventListener("click", () => {
                categoryList.classList.toggle("hidden");
                const arrow = categoryHeader.querySelector(".arrow");
                arrow.textContent = categoryList.classList.contains("hidden") ? "▶" : "▼";
            });
        });
    }
    
    function createBookmarkItem(bookmark) {
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
    
        const editBtn = document.createElement("button");
        editBtn.className = "bookmark-edit-btn";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", (e) => {
            e.stopPropagation();
    
            // Save the bookmark data to storage and redirect to the edit page
            chrome.storage.sync.set({ editingBookmark: bookmark }, () => {
                window.location.href = "editBookmark.html";
            });
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
        controls.appendChild(editBtn);
    
        content.appendChild(title);
        content.appendChild(date);
        content.appendChild(citation);
    
        bookmarkItem.appendChild(typeIcon);
        bookmarkItem.appendChild(content);
        bookmarkItem.appendChild(controls);
    
        return bookmarkItem;
    }
    
    const firstCitationBtn = document.querySelector(".citation-btn");
    // Remove the logic that sets the first citation button as active
    // if (firstCitationBtn) {
    //     firstCitationBtn.classList.add("active");
    //     renderFormFields(firstCitationBtn.getAttribute("data-type"));
    // }

    const connectApiKeyButton = document.getElementById("connectApiKeyButton");
    const apiKeyModal = document.getElementById("apiKeyModal");
    const apiKeyInput = document.getElementById("apiKeyInput");
    const apiKeyStatus = document.getElementById("apiKeyStatus");
    const cancelApiKey = document.getElementById("cancelApiKey");
    const saveApiKey = document.getElementById("saveApiKey");

    connectApiKeyButton.addEventListener("click", () => {
        apiKeyModal.classList.remove("hidden");
        chrome.storage.sync.get("openAiApiKey", (result) => {
            apiKeyInput.value = result.openAiApiKey || "";
            apiKeyStatus.textContent = "";
        });
    });

    cancelApiKey.addEventListener("click", () => {
        apiKeyModal.classList.add("hidden");
    });

    saveApiKey.addEventListener("click", () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            apiKeyStatus.textContent = "API key cannot be empty.";
            apiKeyStatus.style.color = "red";
            return;
        }

        // Save the API key
        chrome.storage.sync.set({ openAiApiKey: apiKey }, () => {
            apiKeyStatus.textContent = "Validating API key...";
            apiKeyStatus.style.color = "blue";

            // Validate the API key
            fetch("https://api.openai.com/v1/models", {
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            })
                .then((response) => {
                    if (response.ok) {
                        apiKeyStatus.textContent = "API key is valid!";
                        apiKeyStatus.style.color = "green";
                    } else {
                        apiKeyStatus.textContent = "Invalid API key. Please try again.";
                        apiKeyStatus.style.color = "red";
                    }
                })
                .catch(() => {
                    apiKeyStatus.textContent = "Error validating API key. Please check your connection.";
                    apiKeyStatus.style.color = "red";
                });
        });
    });

    const smallGreenButton = document.getElementById("smallGreenButton");

    smallGreenButton.addEventListener("click", () => {
        alert("Small green button clicked!");
        // Add your desired functionality here
    });

    const aiButton = document.getElementById("aiButton");

    aiButton.addEventListener("click", () => {
        alert("AI Button clicked!");
        // Add your desired functionality here
    });
});