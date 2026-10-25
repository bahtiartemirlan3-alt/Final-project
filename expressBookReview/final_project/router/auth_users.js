const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => !users.some(u => u.username === username);

const authenticatedUser = (username, password) =>
  users.some(u => u.username === username && u.password === password);

// Login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });
  if (!authenticatedUser(username, password))
    return res.status(401).json({ message: "Invalid login. Check username and password" });

  const accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 3600 });
  req.session.authorization = { accessToken, username };
  return res.status(200).json({ message: "User successfully logged in" });
});

// Add / modify review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  const review = req.query.review || (req.body && req.body.review);
  if (!review) return res.status(400).json({ message: "Review text required" });
  book.reviews[req.session.authorization.username] = review;
  return res.status(200).json({
    message: `Review for book ${req.params.isbn} added/updated`,
    reviews: book.reviews
  });
});

// Delete review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  delete book.reviews[req.session.authorization.username];
  return res.status(200).json({ message: `Review for ISBN ${req.params.isbn} deleted` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
