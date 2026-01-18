const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const bookmarksGrid = document.getElementById("bookmarksGrid");
const addBookmarkBtn = document.getElementById("addBookmarkBtn");
const bookmarkModal = document.getElementById("bookmarkModal");
const closeModal = document.getElementById("closeModal");
const cancelBookmark = document.getElementById("cancelBookmark");
const saveBookmark = document.getElementById("saveBookmark");
const bookmarkForm = document.querySelector(".modal-body");
const bookmarkName = document.getElementById("bookmarkName");
const bookmarkUrl = document.getElementById("bookmarkUrl");
const dateElement = document.getElementById("date");

let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [
	{ name: "Google", url: "https://www.google.com" },
	{ name: "GitHub", url: "https://www.github.com" },
	{ name: "YouTube", url: "https://www.youtube.com" },
	{ name: "Reddit", url: "https://www.reddit.com" },
];

function init() {
	updateDate();
	renderBookmarks();
	setupEventListeners();
	searchInput.focus();
}

function updateDate() {
	const options = {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	};
	const today = new Date();
	dateElement.textContent = today.toLocaleDateString("en-US", options);
}

function renderBookmarks() {
	const containerWidth = document.querySelector(
		".bookmarks-container"
	).offsetWidth;
	const itemWidth = 95;
	const maxColumns = Math.max(1, Math.floor(containerWidth / itemWidth));
	bookmarksGrid.style.gridTemplateColumns = `repeat(${maxColumns}, 80px)`;

	if (bookmarks.length === 0) {
		bookmarksGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 2rem 0;">
                <p>No bookmarks yet. Click the + button to add some!</p>
            </div>
        `;
		return;
	}

	let bookmarksHtml = bookmarks
		.map(
			(bookmark, index) => `
        <div class="bookmark" data-index="${index}">
            <a href="${bookmark.url}" target="_blank" class="bookmark-link">
                <div class="bookmark-icon">
                    ${getFavicon(bookmark.url)}
                </div>
                <span class="bookmark-name">${bookmark.name}</span>
            </a>
            <button class="bookmark-remove" title="Remove bookmark">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `
		)
		.join("");

	bookmarksHtml += `
        <div class="bookmark add-bookmark" id="gridAddBookmarkBtn">
            <div class="bookmark-icon">
                <i class="fas fa-plus"></i>
            </div>
            <span class="bookmark-name">Add</span>
        </div>
    `;

	bookmarksGrid.innerHTML = bookmarksHtml;

	document.querySelectorAll(".bookmark-remove").forEach(btn => {
		btn.addEventListener("click", e => {
			e.preventDefault();
			e.stopPropagation();
			const index = parseInt(btn.closest(".bookmark").dataset.index);
			removeBookmark(index);
		});
	});

	const addBtn = document.getElementById("gridAddBookmarkBtn");
	if (addBtn) {
		addBtn.addEventListener("click", e => {
			e.preventDefault();
			openBookmarkModal();
		});
	}
}

function getFavicon(url) {
	try {
		const domain = new URL(url).hostname;
		return `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64" alt="" onerror="this.src='assets/no-icon.webp'">`;
	} catch (e) {
		return '<i class="fas fa-globe"></i>';
	}
}

function addBookmark(name, url) {
	if (!url.match(/^https?:\/\//)) {
		url = "https://" + url;
	}

	bookmarks.unshift({ name, url });
	saveBookmarks();
	renderBookmarks();
	closeBookmarkModal();
}

function removeBookmark(index) {
	if (confirm(`Remove "${bookmarks[index].name}" from bookmarks?`)) {
		bookmarks.splice(index, 1);
		saveBookmarks();
		renderBookmarks();
	}
}

function saveBookmarks() {
	localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}

function handleSearch() {
	const query = searchInput.value.trim();
	if (query) {
		if (query.includes(".") || query.includes("://")) {
			let url = query;
			if (!query.match(/^https?:\/\//)) {
				url = "https://" + query;
			}
			window.open(url, "_blank");
		} else {
			window.open(
				`https://www.google.com/search?q=${encodeURIComponent(query)}`,
				"_blank"
			);
		}
		searchInput.value = "";
	}
}

function openBookmarkModal() {
	bookmarkModal.classList.add("show");
	document.body.style.overflow = "hidden";
	bookmarkName.focus();
}

function closeBookmarkModal() {
	bookmarkModal.classList.remove("show");
	document.body.style.overflow = "";
	bookmarkForm.reset();
}

function setupEventListeners() {
	searchInput.addEventListener("keypress", e => {
		if (e.key === "Enter") {
			handleSearch();
		}
	});
	searchBtn.addEventListener("click", handleSearch);

	closeModal.addEventListener("click", closeBookmarkModal);
	cancelBookmark.addEventListener("click", closeBookmarkModal);

	saveBookmark.addEventListener("click", e => {
		e.preventDefault();
		const name = bookmarkName.value.trim();
		let url = bookmarkUrl.value.trim();

		if (name && url) {
			addBookmark(name, url);
		}
	});

	window.addEventListener("click", e => {
		if (e.target === bookmarkModal) {
			closeBookmarkModal();
		}
	});

	let resizeTimer;
	window.addEventListener("resize", () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => {
			renderBookmarks();
		}, 250);
	});
}

document.addEventListener("DOMContentLoaded", init);
