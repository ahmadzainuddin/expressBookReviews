const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  // Check if user already exists
  const userExists = users.find((u) => u.username === username);
  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop (Task 10: async/await/Promise)
public_users.get('/', async function (req, res) {
  try {
    // Simulate async retrieval using a Promise (could be Axios/db in real app)
    const data = await new Promise((resolve) => resolve(books));
    return res.status(200).send(JSON.stringify(data, null, 4));
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching books' });
  }
});

// Get book details based on ISBN (Task 11: async/await/Promise)
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const { isbn } = req.params;
    const book = await new Promise((resolve) => resolve(books[isbn]));
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json(book);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching book by ISBN' });
  }
});

// Get book details based on author (Task 12: async/await/Promise)
public_users.get('/author/:author', async function (req, res) {
  try {
    const { author } = req.params;
    const result = await new Promise((resolve) => {
      const filtered = Object.fromEntries(
        Object.entries(books).filter(([, book]) => (book.author || "").toLowerCase() === author.toLowerCase())
      );
      resolve(filtered);
    });
    if (Object.keys(result).length === 0) {
      return res.status(404).json({ message: "No books found for this author" });
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching books by author' });
  }
});

// Get all books based on title (Task 13: async/await/Promise)
public_users.get('/title/:title', async function (req, res) {
  try {
    const { title } = req.params;
    const result = await new Promise((resolve) => {
      const filtered = Object.fromEntries(
        Object.entries(books).filter(([, book]) => (book.title || "").toLowerCase() === title.toLowerCase())
      );
      resolve(filtered);
    });
    if (Object.keys(result).length === 0) {
      return res.status(404).json({ message: "No books found with this title" });
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching books by title' });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(book.reviews || {});
});

module.exports.general = public_users;
