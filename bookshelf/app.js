const API_BASE = "http://localhost:4000"; // change to your backend URL when deployed

let currentShelf = "top";
let currentRating = 0;
let books = [];
let selectedBook = null; // for detail modal
let editingBook = null; // for edit mode

// DOM references
const topShelfEl = document.getElementById("top-shelf");
const bottomShelfEl = document.getElementById("bottom-shelf");
const addModal = document.getElementById("addModal");
const detailModal = document.getElementById("detailModal");

const authorInput = document.getElementById("authorInput");
const titleInput = document.getElementById("titleInput");
const reviewInput = document.getElementById("reviewInput");
const genreInput = document.getElementById("genreInput");
const impactInput = document.getElementById("impactInput");
const whyInput = document.getElementById("whyInput");

const ratingStars = document.querySelectorAll("#ratingInput span");
const addModalTitle = document.getElementById("addModalTitle");
const saveAddBtn = document.getElementById("saveAdd");

// detail fields
const detailTitle = document.getElementById("detailTitle");
const detailAuthor = document.getElementById("detailAuthor");
const detailStars = document.getElementById("detailStars");
const detailGenre = document.getElementById("detailGenre");
const detailImpact = document.getElementById("detailImpact");
const detailWhy = document.getElementById("detailWhy");
const detailReview = document.getElementById("detailReview");

// edit / delete buttons
const editBookBtn = document.getElementById("editBook");
const deleteBookBtn = document.getElementById("deleteBook");

// pastel book colors
const pastelColors = [
  "#f8c8dc", // pink
  "#f7d9c4", // peach
  "#fdf3b7", // soft yellow
  "#cde7be", // mint
  "#c3d6ff", // light blue
  "#e0c9ff", // lavender
];

function randomColor() {
  return pastelColors[Math.floor(Math.random() * pastelColors.length)];
}

/* ---------- MODALS ---------- */

function openAddModal(mode = "create", book = null) {
  addModal.classList.remove("hidden");

  if (mode === "edit" && book) {
    editingBook = book;
    addModalTitle.textContent = "edit book";
    saveAddBtn.textContent = "save changes";

    currentShelf = book.shelf;
    if (book.shelf === "top") {
      topToggle.classList.add("active");
      bottomToggle.classList.remove("active");
    } else {
      bottomToggle.classList.add("active");
      topToggle.classList.remove("active");
    }

    authorInput.value = book.author || "";
    titleInput.value = book.title || "";
    reviewInput.value = book.review || "";
    genreInput.value = book.genre || "";
    impactInput.value = book.impact ?? 40;
    whyInput.value = book.why || "";
    currentRating = book.rating || 0;
    highlightStars(currentRating);
  } else {
    editingBook = null;
    addModalTitle.textContent = "add a book";
    saveAddBtn.textContent = "add to shelf";
    resetForm();
  }
}

function closeAddModal() {
  addModal.classList.add("hidden");
  resetForm();
  editingBook = null;
}

function openDetailModal(book) {
  selectedBook = book;
  detailTitle.textContent = book.title;
  detailAuthor.textContent = book.author ? `by ${book.author}` : "";
  detailGenre.textContent = book.genre || "";
  detailImpact.value = book.impact ?? 40;
  detailWhy.textContent = book.why || "";
  detailReview.textContent = book.review || "";

  // render stars
  detailStars.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const span = document.createElement("span");
    span.textContent = "★";
    if (i <= (book.rating || 0)) span.classList.add("active");
    detailStars.appendChild(span);
  }

  detailModal.classList.remove("hidden");
}

function closeDetailModal() {
  detailModal.classList.add("hidden");
  selectedBook = null;
}

function resetForm() {
  authorInput.value = "";
  titleInput.value = "";
  reviewInput.value = "";
  genreInput.value = "";
  impactInput.value = 40;
  whyInput.value = "";
  currentRating = 0;
  highlightStars(0);

  // default to top shelf
  currentShelf = "top";
  topToggle.classList.add("active");
  bottomToggle.classList.remove("active");
}

/* ---------- RATING STARS ---------- */

function highlightStars(rating) {
  ratingStars.forEach((star) => {
    const value = parseInt(star.dataset.value, 10);
    if (value <= rating) star.classList.add("active");
    else star.classList.remove("active");
  });
}

ratingStars.forEach((star) => {
  star.addEventListener("click", () => {
    currentRating = parseInt(star.dataset.value, 10);
    highlightStars(currentRating);
  });
});

/* ---------- SHELF TOGGLE ---------- */

const topToggle = document.getElementById("topToggle");
const bottomToggle = document.getElementById("bottomToggle");

topToggle.addEventListener("click", () => {
  currentShelf = "top";
  topToggle.classList.add("active");
  bottomToggle.classList.remove("active");
});

bottomToggle.addEventListener("click", () => {
  currentShelf = "bottom";
  bottomToggle.classList.add("active");
  topToggle.classList.remove("active");
});

/* ---------- API ---------- */

async function fetchBooks() {
  const res = await fetch(`${API_BASE}/api/books`);
  books = await res.json();
  renderShelves();
}

async function createBook() {
  const payload = {
    shelf: currentShelf,
    title: titleInput.value.trim(),
    author: authorInput.value.trim(),
    review: reviewInput.value.trim(),
    genre: genreInput.value.trim(),
    rating: currentRating,
    impact: parseInt(impactInput.value, 10),
    why: whyInput.value.trim(),
    color: randomColor(),
  };

  if (!payload.title) {
    alert("Please add a title.");
    return;
  }

  const res = await fetch(`${API_BASE}/api/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const newBook = await res.json();
  books.push(newBook);
  renderShelves();
  closeAddModal();
}

async function updateBook() {
  if (!editingBook) return;

  const payload = {
    shelf: currentShelf,
    title: titleInput.value.trim(),
    author: authorInput.value.trim(),
    review: reviewInput.value.trim(),
    genre: genreInput.value.trim(),
    rating: currentRating,
    impact: parseInt(impactInput.value, 10),
    why: whyInput.value.trim(),
    color: editingBook.color || randomColor(),
  };

  if (!payload.title) {
    alert("Please add a title.");
    return;
  }

  const res = await fetch(`${API_BASE}/api/books/${editingBook.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const updated = await res.json();
  const index = books.findIndex((b) => b.id === editingBook.id);
  if (index !== -1) {
    books[index] = updated;
  }
  renderShelves();
  closeAddModal();
}

async function deleteBook() {
  if (!selectedBook) return;
  const confirmDelete = confirm(
    `Delete "${selectedBook.title}" from your shelf?`
  );
  if (!confirmDelete) return;

  await fetch(`${API_BASE}/api/books/${selectedBook.id}`, {
    method: "DELETE",
  });

  books = books.filter((b) => b.id !== selectedBook.id);
  renderShelves();
  closeDetailModal();
}

/* ---------- RENDER ---------- */

function renderShelves() {
  topShelfEl.innerHTML = "";
  bottomShelfEl.innerHTML = "";

  books.forEach((book) => {
    const el = document.createElement("div");
    el.className = "book";
    el.style.background = book.color || randomColor();

    const text = document.createElement("span");
    text.className = "spine-text";
    text.textContent = book.title;
    el.appendChild(text);

    el.addEventListener("click", () => openDetailModal(book));

    if (book.shelf === "top") {
      topShelfEl.appendChild(el);
    } else {
      bottomShelfEl.appendChild(el);
    }
  });
}

/* ---------- EVENT LISTENERS ---------- */

document
  .getElementById("openAddModal")
  .addEventListener("click", () => openAddModal("create"));

document.getElementById("cancelAdd").addEventListener("click", closeAddModal);

saveAddBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (editingBook) {
    updateBook().catch((err) => console.error(err));
  } else {
    createBook().catch((err) => console.error(err));
  }
});

document.getElementById("closeDetail").addEventListener("click", () => {
  closeDetailModal();
});

// edit/delete from detail modal
editBookBtn.addEventListener("click", () => {
  if (!selectedBook) return;
  const book = books.find((b) => b.id === selectedBook.id);
  closeDetailModal();
  openAddModal("edit", book);
});

deleteBookBtn.addEventListener("click", () => {
  deleteBook().catch((err) => console.error(err));
});

// close modals when clicking backdrop
[addModal, detailModal].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      if (modal === addModal) {
        resetForm();
        editingBook = null;
      } else {
        selectedBook = null;
      }
    }
  });
});

/* ---------- INIT ---------- */

fetchBooks().catch((err) => console.error(err));
