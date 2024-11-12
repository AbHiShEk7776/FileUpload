const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

// Helper function to get userId from token
const getUserIdFromToken = (req) => {
  const token = req.headers.authorization?.split(' ')[1]; // Get the token from the header
  if (!token) throw new Error("No token provided.");
  return jwt.verify(token, process.env.JWT_SECRET).id; // Verify and get userId
};

// Get all contacts for the authenticated user
exports.getContacts = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req); // Get user ID from token
    db.query('SELECT * FROM contacts WHERE user_id = ?', [userId], (err, results) => {
      if (err) return res.status(500).send("Error retrieving contacts.");
      res.status(200).json(results);
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: error.message });
  }
};

// Create a new contact for the authenticated user
exports.createContact = async (req, res) => {
  const { name, phone, email, address } = req.body;

  try {
    const userId = getUserIdFromToken(req); // Get user ID from token

    // Validate the input
    if (!name || !phone || !email || !address) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Insert contact into the database
    db.query(
      'INSERT INTO contacts (name, phone, email, address, user_id) VALUES (?, ?, ?, ?, ?)',
      [name, phone, email, address, userId],
      (err, results) => {
        if (err) {
          console.error('Error inserting contact:', err); // Log the error
          return res.status(500).send("There was a problem adding the contact.");
        }
        return res.status(201).send({ id: results.insertId, name, phone, email, address });
      }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: "Unauthorized access." });
  }
};

// Update a contact for the authenticated user
exports.updateContact = async (req, res) => {
  const { id } = req.params; // Get contact ID from the URL
  const { name, phone, email, address } = req.body; // Get updated contact data

  try {
    // Retrieve user ID from the JWT token
    const userId = getUserIdFromToken(req); // Assumed helper function for extracting user ID from token

    // Validate the input
    if (!name || !phone || !email || !address) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Update contact details in the database
    db.query(
      'UPDATE contacts SET name = ?, phone = ?, email = ?, address = ? WHERE id = ? AND user_id = ?',
      [name, phone, email, address, id, userId],
      (err, result) => {
        if (err) {
          console.error("Error updating contact:", err);
          return res.status(500).json({ message: "Error updating contact." });
        }

        if (result.affectedRows === 0) {
          // If no rows were affected, the contact either doesn't exist or the user isn't authorized to update it
          return res.status(404).json({ message: "Contact not found or unauthorized." });
        }

        // Respond with success message
        res.status(200).json({ message: "Contact updated successfully." });
      }
    );
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Unauthorized access." });
  }
};

// Delete a contact for the authenticated user
exports.deleteContact = async (req, res) => {
  const { id } = req.params;

  try {
    const userId = getUserIdFromToken(req); // Get user ID from token

    db.query('DELETE FROM contacts WHERE id = ? AND user_id = ?', [id, userId], (err, result) => {
      if (err) {
        console.error("Error deleting contact:", err);
        return res.status(500).send("Error deleting contact.");
      }
      if (result.affectedRows === 0) {
        return res.status(404).send("Contact not found or unauthorized.");
      }
      res.status(200).send("Contact deleted successfully.");
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: "Unauthorized access." });
  }
};

// Multer setup for handling CSV uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Import CSV for the authenticated user
exports.importCSV = (req, res) => {
  const csvFilePath = req.file?.path; // Safely access the file path

  // Check if file is uploaded
  if (!csvFilePath) {
    console.error('No file uploaded.');
    return res.status(400).send('No file uploaded.');
  }

  try {
    const userId = getUserIdFromToken(req); // Get user ID from the token

    // Log for debugging purposes
    console.log('UserId:', userId); 
    console.log('CSV File Path:', csvFilePath); 

    // Read and parse the CSV file
    fs.readFile(csvFilePath, 'utf8', (err, csvData) => {
      if (err) {
        console.error('Error reading CSV file:', err); // Log error
        return res.status(500).send('Error reading CSV file.');
      }

      // Split CSV by rows and remove header row
      const rows = csvData.trim().split('\n').slice(1);

      if (rows.length === 0) {
        console.error('No contacts found in the CSV file.');
        return res.status(400).send('CSV file is empty or incorrectly formatted.');
      }

      // Parse rows into contact objects (name, phone, email, address, userId)
      const contacts = rows.map((row, index) => {
        const [name, phone, email, address] = row.split(',').map(field => field.trim());

        // Check for missing fields
        if (!name || !phone || !email || !address) {
          console.error(`Row ${index + 2} has missing fields. Skipping row.`);
          return null; // Skip this row
        }

        return [name, phone, email, address, userId]; // Add user ID to each contact
      }).filter(contact => contact !== null); // Filter out any null rows

      // Log parsed contacts for debugging
      console.log('Contacts to insert:', contacts);

      if (contacts.length === 0) {
        console.error('No valid contacts to insert.');
        return res.status(400).send('No valid contacts to import.');
      }

      // SQL query to insert contacts
      const sql = 'INSERT INTO contacts (name, phone, email, address, user_id) VALUES ?';
      
      // Execute the query
      db.query(sql, [contacts], (err) => {
        if (err) {
          console.error('Database Error:', err); // Log the error if query fails
          return res.status(500).send('Error importing CSV data.');
        }

        // Success response
        res.status(200).send('CSV data imported successfully');
      });
    });
  } catch (error) {
    // Catch and log token verification error
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Unauthorized access.' });
  }
};

// Export contacts to CSV for the authenticated user
exports.exportCSV = (req, res) => {
  try {
    const userId = getUserIdFromToken(req); // Get user ID from token

    db.query('SELECT * FROM contacts WHERE user_id = ?', [userId], (err, results) => {
      if (err) {
        console.error("Error retrieving contacts for CSV export:", err);
        return res.status(500).send("Error retrieving contacts.");
      }

      if (results.length === 0) {
        return res.status(404).send("No contacts found.");
      }

      const csvData = ['Name,Phone,Email,Address'];
      results.forEach(contact => {
        csvData.push(`${contact.name},${contact.phone},${contact.email},${contact.address}`);
      });

      const csvContent = csvData.join('\n');
      const filePath = path.join(__dirname, '../exports', `contacts_${userId}.csv`);

      // Write CSV data to a file
      fs.writeFile(filePath, csvContent, (err) => {
        if (err) {
          console.error("Error writing CSV file:", err);
          return res.status(500).send("Error writing CSV file.");
        }

        // Download the file and delete after sending
        res.download(filePath, 'contacts.csv', (err) => {
          if (err) {
            console.error("Error downloading CSV file:", err);
          }
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error("Error deleting temporary CSV file:", unlinkErr);
          });
        });
      });
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: "Unauthorized access." });
  }
};
