const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  try{
    const {username , password } = req.body;
    if(!isValid(username)){
      res.status(404).json({message: "this user already exists"})
    }
    users.push({username: username, password: password});
    return res.status(200).json({message: "User successfully registered. Now you can login"});
  } catch(error){
    return res.status(500).json({message: "Error registering user.", error: error.message});
  }
});

// Get the book list available in the shop
public_users.get("/", async (req, res) => {
  try {
    const bookList = await Promise.resolve(Object.values(books));
    return res.status(200).json(bookList);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}); 

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  try {
    const { isbn } = req.params;
    const book = await Promise.resolve(books[isbn]);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
  try {
    const { author } = req.params;
    const filteredBooks = await Promise.resolve(
      Object.values(books).filter((book) => book.author.toLowerCase() === author.toLowerCase())
    );
    if (filteredBooks.length === 0) {
      return res.status(404).json({ message: "No books found by this author" });
    }
    return res.status(200).json(filteredBooks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get book details based on title
public_users.get("/title/:title", async (req, res) => {
  try {
    const { title } = req.params;
    const filteredBooks = await Promise.resolve(
      Object.values(books).filter((book) => book.title.toLowerCase() === title.toLowerCase())
    );
    if (filteredBooks.length === 0) {
      return res.status(404).json({ message: "No books found based on the title" });
    }
    return res.status(200).json(filteredBooks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get book reviews
public_users.get("/review/:isbn", async (req, res) => {
  try {
    const { isbn } = req.params;
    const book = await Promise.resolve(books[isbn]);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }
    const reviews = Object.values(book.reviews);
    if (reviews.length === 0) {
      return res.status(404).json({ message: "No reviews found for this book." });
    }
    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book reviews.", error: error.message });
  }
});


module.exports.general = public_users;
