document.addEventListener("DOMContentLoaded", () => {
    const formFields = document.getElementById("formFields");
    const citationOutput = document.getElementById("citationOutput");
    const generateButton = document.getElementById("generateCitation");
    const copyButton = document.getElementById("copyButton");

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

        citationOutput.value = formatCitation(selectedType, values);
    });

    function formatCitation(type, values) {
        const formats = {
            book: `${values.authorLast}, ${values.authorFirst}. (${values.year}). ${values.title} (${values.edition}). ${values.publisher}.`,
            chapter: `${values.chapterAuthorLast}, ${values.chapterAuthorFirst}. (${values.year}). ${values.chapterTitle}. In ${values.editorLast}, ${values.editorFirst} (ed.), ${values.bookTitle} (${values.edition}) (pp.: ${values.pages}). ${values.publisher}.`,
            thesis: `${values.authorLast}, ${values.authorFirst}. (${values.year}). ${values.title}. (${values.reference}) [Doctoral thesis, ${values.university}].`,
            journal: `${values.authorLast}, ${values.authorFirst}. (${values.year}). ${values.title}. ${values.journalTitle}, ${values.volume}(${values.issue}), ${values.pages}.`,
            webpage: `${values.website}. ${values.title}. ${values.url}. (Accessed on ${values.accessDate}).`
        };
        return formats[type] || "";
    }

    copyButton.addEventListener("click", () => {
        citationOutput.select();
        document.execCommand("copy");
    });
});