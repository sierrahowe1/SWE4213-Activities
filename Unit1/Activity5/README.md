# Activity 5
The goal of this activity is to teach you the fundamentals of PostgreSQL. You will create a database, define tables, and perform basic CRUD (Create, Read, Update, Delete) operations.

**Prerequisites:** Make sure you have PostgreSQL installed and running. You can connect using `psql` in your terminal.

---

**Todo 1:** Create a new database called `bookstore`.

<details>
  <summary>Reveal Answer</summary>

```sql
CREATE DATABASE bookstore;
```

Then connect to it:
```sql
\c bookstore
```
</details>
<br>

**Todo 2:** Create two tables with the following structure:

**authors**
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| country | VARCHAR(50) | |

**books**
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| title | VARCHAR(200) | NOT NULL |
| author_id | INTEGER | FOREIGN KEY references authors(id) |
| price | DECIMAL(10,2) | |
| published_year | INTEGER | |

<details>
  <summary>Reveal Answer</summary>

```sql
CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(50)
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author_id INTEGER REFERENCES authors(id),
    price DECIMAL(10,2),
    published_year INTEGER
);
```
</details>
<br>

**Todo 3:** Insert the following authors into the `authors` table:
- Margaret Atwood from Canada
- George Orwell from United Kingdom
- Haruki Murakami from Japan

<details>
  <summary>Reveal Answer</summary>

```sql
INSERT INTO authors (name, country) VALUES
    ('Margaret Atwood', 'Canada'),
    ('George Orwell', 'United Kingdom'),
    ('Haruki Murakami', 'Japan');
```
</details>
<br>

**Todo 4:** Insert the following books into the `books` table:
- "The Handmaid's Tale" by Margaret Atwood (author_id: 1), $15.99, published 1985
- "1984" by George Orwell (author_id: 2), $12.99, published 1949
- "Animal Farm" by George Orwell (author_id: 2), $10.99, published 1945
- "Norwegian Wood" by Haruki Murakami (author_id: 3), $14.99, published 1987

<details>
  <summary>Reveal Answer</summary>

```sql
INSERT INTO books (title, author_id, price, published_year) VALUES
    ('The Handmaid''s Tale', 1, 15.99, 1985),
    ('1984', 2, 12.99, 1949),
    ('Animal Farm', 2, 10.99, 1945),
    ('Norwegian Wood', 3, 14.99, 1987);
```
</details>
<br>

**Todo 5:** Write a query to select all books that cost less than $14.00.

<details>
  <summary>Reveal Answer</summary>

```sql
SELECT * FROM books WHERE price < 14.00;
```

Expected result:
| id | title | author_id | price | published_year |
|----|-------|-----------|-------|----------------|
| 2 | 1984 | 2 | 12.99 | 1949 |
| 3 | Animal Farm | 2 | 10.99 | 1945 |
</details>
<br>

**Todo 6:** Write a query to display all books along with their author's name using a JOIN. The result should show the book title, author name, and price.

<details>
  <summary>Reveal Answer</summary>

```sql
SELECT books.title, authors.name AS author, books.price
FROM books
JOIN authors ON books.author_id = authors.id;
```

Expected result:
| title | author | price |
|-------|--------|-------|
| The Handmaid's Tale | Margaret Atwood | 15.99 |
| 1984 | George Orwell | 12.99 |
| Animal Farm | George Orwell | 10.99 |
| Norwegian Wood | Haruki Murakami | 14.99 |
</details>
<br>

**Todo 7:** The price of "1984" has increased. Update it to $13.99.

<details>
  <summary>Reveal Answer</summary>

```sql
UPDATE books SET price = 13.99 WHERE title = '1984';
```

Verify with:
```sql
SELECT * FROM books WHERE title = '1984';
```
</details>
<br>

**Todo 8:** Delete the book "Animal Farm" from the database.

<details>
  <summary>Reveal Answer</summary>

```sql
DELETE FROM books WHERE title = 'Animal Farm';
```

Verify with:
```sql
SELECT * FROM books;
```
</details>
<br>

---

**Bonus Challenge:** Write a query to find the average price of all books by each author, showing only authors with more than one book.

<details>
  <summary>Reveal Answer</summary>

```sql
SELECT authors.name, AVG(books.price) AS average_price, COUNT(*) AS book_count
FROM books
JOIN authors ON books.author_id = authors.id
GROUP BY authors.name
HAVING COUNT(*) > 1;
```

Note: After completing Todo 8, George Orwell will only have 1 book, so this query will return no results. Try this query before doing Todo 8!
</details>
<br>