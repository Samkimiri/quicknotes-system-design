
# QuickNotes Data Model

## Entities and relationships

- **users:** One user can own many notes (one-to-many).
- **notes:** Each note belongs to one user.
- **tags:** Tags can be reused across notes.
- **note_tags:** Join table implementing the many-to-many relationship between notes and tags.

## SQL schema

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

## Example SQL queries

### 1. List a user's notes

```sql
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 1
ORDER BY updated_at DESC;
```

### 2. Create a note

```sql
INSERT INTO notes (user_id, title, body)
VALUES (1, 'Meeting', 'Prepare the report')
RETURNING id, title, body, created_at;
```

### 3. Find notes with their tags (JOIN)

```sql
SELECT n.title, t.name AS tag
FROM notes n
JOIN note_tags nt ON nt.note_id = n.id
JOIN tags t ON t.id = nt.tag_id
WHERE n.user_id = 1;
```

## Indexes

```sql
CREATE INDEX idx_notes_user_updated
ON notes (user_id, updated_at DESC);
```

This index speeds up listing a user's notes in recently updated order.

## SQL versus NoSQL

I recommend PostgreSQL, a relational SQL database. QuickNotes has clear relationships between users, notes and tags, and requires foreign keys, unique constraints and reliable transactions. A relational database makes these integrity rules and JOIN queries straightforward. A NoSQL database could offer flexible documents, but that flexibility is less important than these relationships for the initial service.
