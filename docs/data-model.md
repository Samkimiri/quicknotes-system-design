# QuickNotes Data Model

## 1. Overview

QuickNotes uses PostgreSQL, a relational database, to store users, notes, tags, and the relationships between notes and tags.

## 2. Entities and Relationships

The database contains four tables:

- **users:** Stores user account information. One user can own many notes.
- **notes:** Stores notes. Each note belongs to one user through `user_id`.
- **tags:** Stores reusable labels that can categorize notes.
- **note_tags:** A join table that connects notes and tags.

### Relationships

- **One-to-many:** One user can own many notes, but each note belongs to one user. This is implemented by `notes.user_id` referencing `users.id`.
- **Many-to-many:** A note can have multiple tags, and a tag can be associated with multiple notes. The `note_tags` table implements this relationship using `note_id` and `tag_id`.

## 3. Tables, Columns, and Data Types

### users

| Column | Data Type | Constraints |
|---|---|---|
| id | BIGINT | Primary key, auto-generated |
| email | VARCHAR(255) | Required, unique |
| display_name | VARCHAR(100) | Required |
| created_at | TIMESTAMP | Required, defaults to current timestamp |

### notes

| Column | Data Type | Constraints |
|---|---|---|
| id | BIGINT | Primary key, auto-generated |
| user_id | BIGINT | Required, foreign key to users.id |
| title | VARCHAR(100) | Required |
| body | TEXT | Required, defaults to an empty string |
| created_at | TIMESTAMP | Required, defaults to current timestamp |
| updated_at | TIMESTAMP | Required, defaults to current timestamp |

### tags

| Column | Data Type | Constraints |
|---|---|---|
| id | BIGINT | Primary key, auto-generated |
| name | VARCHAR(50) | Required, unique |

### note_tags

| Column | Data Type | Constraints |
|---|---|---|
| note_id | BIGINT | Required, foreign key to notes.id |
| tag_id | BIGINT | Required, foreign key to tags.id |

The combination of `note_id` and `tag_id` forms the composite primary key of `note_tags`. It prevents the same tag from being assigned to the same note more than once.

## 4. SQL Schema

The following PostgreSQL statements create the four tables and their constraints.

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE note_tags (
    note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);
```

### Schema design decisions

- Primary keys uniquely identify rows.
- Foreign keys maintain valid relationships between tables.
- `NOT NULL` prevents required fields from being left empty.
- `UNIQUE` prevents duplicate email addresses and tag names.
- `ON DELETE CASCADE` removes a user's notes when the user is deleted, and removes associated tag links when a note or tag is deleted.
- The composite primary key on `note_tags` prevents duplicate note-tag associations.

## 5. Example SQL Queries

### Query 1: List a user's notes

Returns notes belonging to user ID 1, ordered by most recently updated.

```sql
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 1
ORDER BY updated_at DESC;
```

### Query 2: Create a note

Creates a note for user ID 1 and returns the generated ID and note details. The user must already exist.

```sql
INSERT INTO notes (user_id, title, body)
VALUES (1, 'Meeting', 'Prepare the report')
RETURNING id, title, body, created_at;
```

### Query 3: Find notes with their tags (JOIN)

Joins notes, note_tags, and tags to show the tags associated with a user's notes.

```sql
SELECT n.title, t.name AS tag
FROM notes n
JOIN note_tags nt ON nt.note_id = n.id
JOIN tags t ON t.id = nt.tag_id
WHERE n.user_id = 1;
```

### Query 4: Count notes per user

Uses a LEFT JOIN so users with no notes are included.

```sql
SELECT u.id, u.display_name, COUNT(n.id) AS note_count
FROM users u
LEFT JOIN notes n ON n.user_id = u.id
GROUP BY u.id, u.display_name
ORDER BY note_count DESC;
```

## 6. Indexes

The following index supports queries that retrieve a user's notes in recently updated order.

```sql
CREATE INDEX idx_notes_user_updated
ON notes (user_id, updated_at DESC);
```

The index helps PostgreSQL find rows for a particular user and sort them by update time more efficiently, especially as the notes table grows.

Primary keys and unique constraints also create indexes in PostgreSQL where required.

## 7. SQL Versus NoSQL

I recommend PostgreSQL, a relational SQL database, for the initial QuickNotes service.

QuickNotes has clear relationships between users, notes, and tags. Foreign keys, unique constraints, and transactions help maintain data integrity. SQL JOIN queries also make it straightforward to retrieve notes together with their tags.

A NoSQL database could offer flexible document structures and may be suitable for some future use cases. However, that flexibility is less important for the initial service than maintaining these relationships and constraints.

PostgreSQL therefore provides a good balance of reliability, data consistency, and query capabilities for QuickNotes.