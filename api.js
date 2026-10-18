
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const submitButton = document.getElementById("submit-btn");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const notesList = document.getElementById("notes-list");
const statusMessage = document.getElementById("status");

let notes = [];

function showStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = type;
}

// Reusable API helper: checks HTTP status and handles empty responses.
async function request(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();

  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("The server returned an invalid response.");
    }
  }

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}).`);
  }

  return { data, status: response.status };
}

function renderNotes() {
  notesList.replaceChildren();

  if (notes.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No notes to display. Load notes or create one.";
    notesList.appendChild(item);
    return;
  }

  notes.forEach((note) => {
    const item = document.createElement("li");
    const title = document.createElement("h3");
    const body = document.createElement("p");
    const deleteButton = document.createElement("button");

    title.textContent = note.title || "(Untitled)";
    body.textContent = note.body || "";

    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteNote(note.id, deleteButton));

    item.append(title, body, deleteButton);
    notesList.appendChild(item);
  });
}

async function loadNotes() {
  loadButton.disabled = true;
  showStatus("Loading notes...");

  try {
    const result = await request(`${API_URL}?_limit=10`);
    notes = result.data || [];
    renderNotes();

    if (notes.length === 0) {
      showStatus("No notes found.", "success");
    } else {
      showStatus(`Loaded ${notes.length} notes from the server.`, "success");
    }
  } catch (error) {
    console.error(error);
    showStatus("Sorry, we couldn't load notes. Please try again.", "error");
    notesList.replaceChildren();
    const item = document.createElement("li");
    item.textContent = "Notes could not be loaded.";
    notesList.appendChild(item);
  } finally {
    loadButton.disabled = false;
  }
}

async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    showStatus("Please enter a title.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    showStatus("The title must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
  }

  submitButton.disabled = true;
  showStatus("Creating note...");

  try {
    const result = await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, userId: 1 })
    });

    const newNote = result.data;
    notes.unshift(newNote);
    renderNotes();
    noteForm.reset();
    showStatus(
      `Note created (status ${result.status}, id ${newNote.id}).`,
      "success"
    );
  } catch (error) {
    console.error(error);
    showStatus("Sorry, we couldn't create the note. Please try again.", "error");
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteNote(id, button) {
  button.disabled = true;
  showStatus("Deleting note...");

  try {
    await request(`${API_URL}/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });

    // JSONPlaceholder simulates deletion but does not persist changes.
    // Remove the note from our local display after a successful response.
    notes = notes.filter((note) => String(note.id) !== String(id));
    renderNotes();
    showStatus("Note deleted from this page.", "success");
  } catch (error) {
    console.error(error);
    showStatus("Sorry, we couldn't delete the note. Please try again.", "error");
    button.disabled = false;
  }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);

// Show the required empty state before the first request.
renderNotes();
