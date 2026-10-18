
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const statusMessage = document.getElementById("status");
const notesList = document.getElementById("notes-list");

// Display a status message on the page.
function showStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = type;
}

// Create a note element safely using textContent.
function displayNote(note) {
  const listItem = document.createElement("li");
  const title = document.createElement("h3");
  const body = document.createElement("p");

  title.textContent = note.title;
  body.textContent = note.body;

  listItem.append(title, body);
  notesList.appendChild(listItem);
}

// Load the first 10 notes from JSONPlaceholder.
async function loadNotes() {
  loadButton.disabled = true;
  showStatus("Loading notes...");
  notesList.replaceChildren();

  try {
    const response = await fetch(`${API_URL}?_limit=10`);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const notes = await response.json();

    if (notes.length === 0) {
      const emptyMessage = document.createElement("li");
      emptyMessage.textContent = "No notes found. Try again later.";
      notesList.appendChild(emptyMessage);

      showStatus("No notes were found.", "success");
      return;
    }

    notes.forEach(displayNote);

    showStatus(
      `Loaded ${notes.length} notes from the server.`,
      "success"
    );
  } catch (error) {
    console.error("Could not load notes:", error);
    showStatus(
      "Sorry, we couldn't load your notes. Please try again.",
      "error"
    );
  } finally {
    loadButton.disabled = false;
  }
}

// Run loadNotes when the button is clicked.
loadButton.addEventListener("click", loadNotes);
