
# QuickNotes REST API Design

Base URL: `https://api.quicknotes.example/v1`

All authenticated endpoints use a bearer token. JSON responses use `application/json`.

## Endpoints

| Method | Path | Description | Success status |
|---|---|---|---|
| GET | /notes | List the authenticated user's notes | 200 OK |
| GET | /notes/{id} | Retrieve one note | 200 OK |
| POST | /notes | Create a note | 201 Created |
| PUT | /notes/{id} | Replace a note | 200 OK |
| DELETE | /notes/{id} | Delete a note | 204 No Content |
| GET | /notes?tag={tag} | Filter notes by tag | 200 OK |
| GET | /users/me | Get the current user's profile | 200 OK |

## List notes request and response

`GET /v1/notes`

Response: `200 OK`

```json
{
  "data": [
    {
      "id": 42,
      "title": "Meeting notes",
      "body": "Prepare the project update.",
      "createdAt": "2026-10-18T10:00:00Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

## Create note request and response

`POST /v1/notes`

Request:

```json
{
  "title": "Shopping list",
  "body": "Milk, bread and fruit",
  "tagIds": [2, 3]
}
```

Response: `201 Created`

```json
{
  "id": 43,
  "title": "Shopping list",
  "body": "Milk, bread and fruit",
  "createdAt": "2026-10-18T10:05:00Z"
}
```

## Error status codes

- `400 Bad Request`: malformed JSON or invalid request format.
- `401 Unauthorized`: missing or invalid authentication token.
- `403 Forbidden`: authenticated user lacks permission.
- `404 Not Found`: note does not exist or is not accessible to the user.
- `500 Internal Server Error`: unexpected server failure.

Example error body:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The title is required.",
    "details": {
      "field": "title"
    }
  }
}
```

The API validates input, authenticates users, and ensures users can only access their own notes. Pagination limits response size.
