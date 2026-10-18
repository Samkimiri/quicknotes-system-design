# QuickNotes REST API Design

## 1. Overview

The QuickNotes REST API allows users to create, view, update, delete, and organize their notes.

**Base URL:** `https://api.quicknotes.example/v1`

All authenticated endpoints require a valid bearer token. Requests and responses use JSON unless otherwise specified.

Example authentication header:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

## 2. Endpoints

| Method | Endpoint | Description | Success Status |
|---|---|---|---|
| GET | `/notes` | List the authenticated user's notes | 200 OK |
| GET | `/notes/{id}` | Retrieve a specific note | 200 OK |
| POST | `/notes` | Create a new note | 201 Created |
| PUT | `/notes/{id}` | Replace an existing note | 200 OK |
| DELETE | `/notes/{id}` | Delete a note | 204 No Content |
| GET | `/notes?tag={tag}` | Filter notes by tag | 200 OK |
| GET | `/users/me` | Retrieve the authenticated user's profile | 200 OK |

## 3. List Notes

**Request**

```http
GET /v1/notes
Authorization: Bearer <access_token>
```

Returns a paginated list of notes belonging to the authenticated user.

**Success response: `200 OK`**

```json
{
  "data": [
    {
      "id": 42,
      "userId": 7,
      "title": "Meeting notes",
      "body": "Prepare the project update.",
      "createdAt": "2026-10-18T10:00:00Z",
      "updatedAt": "2026-10-18T10:00:00Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

Clients can use query parameters such as `page` and `limit` to navigate through results.

## 4. Retrieve a Single Note

**Request**

```http
GET /v1/notes/42
Authorization: Bearer <access_token>
```

Returns the note with ID `42` if it exists and belongs to the authenticated user.

**Success response: `200 OK`**

```json
{
  "id": 42,
  "userId": 7,
  "title": "Meeting notes",
  "body": "Prepare the project update.",
  "createdAt": "2026-10-18T10:00:00Z",
  "updatedAt": "2026-10-18T10:00:00Z"
}
```

## 5. Create a Note

**Request**

```http
POST /v1/notes
Authorization: Bearer <access_token>
Content-Type: application/json
```

Request body:

```json
{
  "title": "Shopping list",
  "body": "Milk, bread and fruit",
  "tagIds": [2, 3]
}
```

The server validates the input and associates the new note with the authenticated user.

**Success response: `201 Created`**

```json
{
  "id": 43,
  "userId": 7,
  "title": "Shopping list",
  "body": "Milk, bread and fruit",
  "tagIds": [2, 3],
  "createdAt": "2026-10-18T10:05:00Z",
  "updatedAt": "2026-10-18T10:05:00Z"
}
```

The response includes the ID assigned to the newly created note.

## 6. Update a Note

**Request**

```http
PUT /v1/notes/43
Authorization: Bearer <access_token>
Content-Type: application/json
```

Request body:

```json
{
  "title": "Updated shopping list",
  "body": "Milk, bread, fruit and eggs",
  "tagIds": [2]
}
```

Replaces the editable fields of the specified note. The server verifies that the note exists and belongs to the authenticated user.

**Success response: `200 OK`**

```json
{
  "id": 43,
  "userId": 7,
  "title": "Updated shopping list",
  "body": "Milk, bread, fruit and eggs",
  "tagIds": [2],
  "createdAt": "2026-10-18T10:05:00Z",
  "updatedAt": "2026-10-18T10:15:00Z"
}
```

## 7. Delete a Note

**Request**

```http
DELETE /v1/notes/43
Authorization: Bearer <access_token>
```

Deletes the specified note if it exists and the authenticated user has permission to delete it.

**Success response: `204 No Content`**

The response has no body because the deletion succeeded.

## 8. Filter Notes by Tag

**Request**

```http
GET /v1/notes?tag=work
Authorization: Bearer <access_token>
```

Returns the authenticated user's notes associated with the tag `work`.

**Success response: `200 OK`**

```json
{
  "data": [
    {
      "id": 44,
      "title": "Project planning",
      "body": "Prepare the next sprint.",
      "tags": ["work"]
    }
  ],
  "total": 1
}
```

If no notes match the tag, the API returns `200 OK` with an empty `data` array.

## 9. Retrieve the Current User

**Request**

```http
GET /v1/users/me
Authorization: Bearer <access_token>
```

Returns the profile of the authenticated user.

**Success response: `200 OK`**

```json
{
  "id": 7,
  "name": "Alex Kim",
  "email": "alex@example.com",
  "createdAt": "2026-10-01T08:00:00Z"
}
```

## 10. Error Handling

The API uses standard HTTP status codes to communicate failures.

| Status Code | Name | When It Occurs |
|---|---|---|
| 400 | Bad Request | The JSON is malformed or required input is invalid. |
| 401 | Unauthorized | The access token is missing, invalid, or expired. |
| 403 | Forbidden | The user is authenticated but lacks permission to perform an operation. |
| 404 | Not Found | The requested note or resource does not exist or is not accessible to the user. |
| 422 | Unprocessable Entity | The request is valid JSON but violates a documented business rule. |
| 500 | Internal Server Error | An unexpected server-side failure occurs. |

### Example: 400 Bad Request

A note request is missing its required title.

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

### Example: 401 Unauthorized

The request does not include a valid access token.

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "A valid access token is required."
  }
}
```

### Example: 403 Forbidden

An authenticated user attempts an operation they are not permitted to perform.

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action."
  }
}
```

### Example: 404 Not Found

A requested note does not exist or is not accessible to the user.

```json
{
  "error": {
    "code": "NOTE_NOT_FOUND",
    "message": "The requested note was not found."
  }
}
```

### Example: 422 Unprocessable Entity

Assuming the application prohibits duplicate note titles for the same user, creating a note with an existing title violates that business rule.

```json
{
  "error": {
    "code": "DUPLICATE_NOTE_TITLE",
    "message": "A note with this title already exists."
  }
}
```

### Example: 500 Internal Server Error

An unexpected failure occurs while processing a request.

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred. Please try again later."
  }
}
```

Error responses use a consistent structure so clients can display useful messages without exposing internal server details.

## 11. Validation and Security

- Note titles are required and must not exceed 100 characters.
- The server validates request bodies before creating or updating notes.
- Authenticated endpoints require a valid bearer token.
- Users can only access or modify notes they own.
- User IDs are derived from the authenticated identity rather than trusted from client input.
- Pagination limits response size and helps protect server resources.
- The server must not expose passwords, access tokens, or internal error details in API responses.