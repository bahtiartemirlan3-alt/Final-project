const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });
  if (!isValid(username))
    return res.status(409).json({ message: "User already exists" });
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get all books
public_users.get('/', (req, res) => {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book by ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book
    ? res.status(200).json(book)
    : res.status(404).json({ message: "Book not found" });
});

// Get books by author
public_users.get('/author/:author', (req, res) => {
  const result = Object.entries(books)
    .filter(([, b]) => b.author.toLowerCase() === req.params.author.toLowerCase())
    .map(([isbn, b]) => ({ isbn, ...b }));
  return res.status(200).json({ booksbyauthor: result });
});

// Get books by title
public_users.get('/title/:title', (req, res) => {
  const result = Object.entries(books)
    .filter(([, b]) => b.title.toLowerCase() === req.params.title.toLowerCase())
    .map(([isbn, b]) => ({ isbn, ...b }));
  return res.status(200).json({ booksbytitle: result });
});

// Get book reviews
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book
    ? res.status(200).json(book.reviews)
    : res.status(404).json({ message: "Book not found" });
});

// ---------- Axios client functions (async/await and promise callbacks) ----------
const BASE_URL = "http://localhost:5000";

// All books - async/await
const getAllBooks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching books:", error.message);
  }
};

// By ISBN - promise callbacks
const getBookByISBN = (isbn) => {
  return axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then(response => response.data)
    .catch(error => console.error("Error fetching book by ISBN:", error.message));
};

// By author - async/await
const getBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching books by author:", error.message);
  }
};

// By title - async/await
const getBooksByTitle = async (title) => {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching books by title:", error.message);
  }
};

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
