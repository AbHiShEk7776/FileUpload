const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register user
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Hash the password asynchronously
    const hashedPassword = await bcrypt.hash(password, 8);

    // Insert user into the database
    db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], (err, results) => {
      if (err) {
        console.error('Error inserting user:', err);  // Log the error for debugging
        return res.status(500).send({ message: "There was a problem registering the user." });
      }

      // Generate JWT token with user ID
      const token = jwt.sign({ id: results.insertId }, process.env.JWT_SECRET, { expiresIn: '1h' });  // Token valid for 1 hour

      return res.status(201).send({ auth: true, token });
    });

  } catch (error) {
    console.error('Error during registration:', error);  // Log the error
    res.status(500).send({ message: 'Internal server error. Please try again.' });
  }
};

// Login user
exports.login = (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email });

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send("Error on the server.");}
    if (results.length === 0) return res.status(404).send("No user found.");

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

    // Generate JWT token with user ID
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });  // Token valid for 1 hour
    console.log('Token generated for user:', user.id);
    // Send token to client
    res.status(200).send({ auth: true, token });
  });
};
