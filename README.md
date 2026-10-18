
# QuickNotes System Design

QuickNotes is a browser-based API client and system-design project demonstrating how a notes application can evolve into an online service for one million registered users.

## Features

- Load ten notes using GET.
- Create notes using POST with title validation.
- Delete notes using DELETE.
- Display loading, success, error and empty states.
- Document the REST API, relational data model and scalable architecture.

## How to run the API client

1. Clone or download this repository.
2. Open the project folder in Visual Studio Code.
3. Open `index.html` with the Live Server extension, or open it in a browser.
4. Click **Load notes** to retrieve example posts from JSONPlaceholder.
5. Use the form to create a note and its Delete button to remove a note from the current display.

The client uses the JSONPlaceholder practice API. Created and deleted posts are simulated and are not permanently stored by that service. A production implementation would use the real QuickNotes API described in the design documents.

## Design documents

- [API Design](docs/api-design.md)
- [Data Model](docs/data-model.md)
- [Architecture](docs/architecture.md)

## What I learned

- How to use asynchronous JavaScript and Fetch API requests with GET, POST and DELETE.
- How to validate user input and handle loading, success, error and empty states.
- How REST endpoints, relational database tables and foreign keys fit together.
- How caching, load balancing, replicas and background workers support scalability.
- How Git commits and GitHub support version control and project submission.
