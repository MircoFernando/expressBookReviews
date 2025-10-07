const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
// const { use } = require('react');
const regd_users = express.Router();

const users = [{
  username: "user1",
  password: "password1"
}];

const isValid = (username)=>{ //returns boolean
  const userswithsamename = users.filter((user) => user.username === username);
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}


//only registered users can login
regd_users.post("/login", (req,res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    if(!isValid(username)){
      return res.status(404).json({ message: "User not found. Please register first." });
    }
    if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken
    }
    return res.status(200).json({ message: "User successfully logged in" });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in user.", error: error.message });
  }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  try {
    const { isbn } = req.params;
    const { review } = req.body;
    const username = req.session.username;
    // Validate review input
    if (!review) {
      return res.status(400).json({ message: "Review content is required." });
    }

    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    // Initialize reviews object if not present
    if (!book.reviews) {
      book.reviews = {};
    }

    if (book.reviews[username]) {
      book.reviews[username] = review; // Update existing review
      return res.status(200).json({
        message: "Review updated successfully.",
        reviews: book.reviews,
      });
    } else {
      book.reviews[username] = review; // Add new review
      return res.status(201).json({
        message: "Review added successfully.",
        reviews: book.reviews,
      });
    }

  } catch (error) {
    return res.status(500).json({
      message: "Error adding or updating review.",
      error: error.message,
    });
  }
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
  try {
    const { isbn } = req.params;
    const username = req.session.username;

    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    if (book.reviews && book.reviews[username]) {
      delete book.reviews[username]; // Remove the user's review
      return res.status(200).json({
        message: "Review deleted successfully.",
        reviews: book.reviews,
      });
    } else {
      return res.status(404).json({
        message: "No review found for this user to delete.",
      });
    }

  } catch (error) {
    return res.status(500).json({
      message: "Error deleting review.",
      error: error.message,
    });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
