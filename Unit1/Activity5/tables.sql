CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(50)
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    author_id INTEGER REFERENCES authors(id),
    price DECIMAL(10,2),
    published_year INTEGER
);

INSERT INTO authors (name, country) VALUES 
('Margret Atwood', 'Canada'),
('George Orwell', 'United Kingdom'),
('Haruki Murakami', 'Japan');

INSERT INTO books (title, author_id, price, published_year) VALUES
('The Handmaids Tale', 1, 15.99, 1985),
('1984', 2, 12.99, 1949),
('Animal Farm', 2, 10.99, 1945),
('Norwegian Wood', 3, 14.99, 1987);

SELECT * FROM books WHERE price < 14.00;

SELECT books.title, books.price, authors.name FROM books JOIN authors ON books.author_id = authors.id;

UPDATE books SET price = 13.99 WHERE title;

DELETE FROM books WHERE title='Animal Farm';