const express = require('express');
const router = express.Router();
const multer = require('multer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// user registration
router.post('/users', (req, res) => {
    const { name, email, gender, phone, password } = req.body;
  
    // Default status is 'pending'
    const status = 'pending';
  
    // Insert the user into the database
    const query = 'INSERT INTO users (name, email, gender, phone, password, status) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [name, email, gender, phone, password, status], (err, result) => {
      if (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Error registering user');
        return;
      }
  
      // Generate a unique user ID
      const userId = result.insertId;
  
      // Return the user ID and a success message
      res.status(201).json({ userId, message: 'User registered successfully' });
    });
  });

  // user login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
  
    // Check the user's status in the database
    const statusQuery = 'SELECT status FROM users WHERE email = ? AND password = ?';
    db.query(statusQuery, [email, password], (err, result) => {
      if (err) {
        console.error('Error checking user status:', err);
        res.status(500).send('Error checking user status');
        return;
      }
  
      if (result.length === 0) {
        res.status(404).send('User not found');
        return;
      }
  
      const { status } = result[0];
  
      // Display different messages based on the user's status
      let message;
      switch (status) {
        case 'pending':
          message = 'Your account is pending approval.';
          break;
        case 'active':
          message = 'Your account is active.';
          break;
        case 'de-active':
          message = 'Your account is deactivated.';
          break;
        default:
          message = 'Invalid status.';
          break;
      }
  
      res.status(200).json({ message });
    });
  });
  

// user profile update
router.put('/users/:id', upload.single('profile_pic'), (req, res) => {
  const userId = req.params.id;
  const { name, email, gender, phone } = req.body;

  // Update the user's profile data in the database
  const query = 'UPDATE users SET name = ?, email = ?, gender = ?, phone = ? WHERE id = ?';
  db.query(query, [name, email, gender, phone, userId], (err, result) => {
    if (err) {
      console.error('Error updating user profile:', err);
      res.status(500).send('Error updating user profile');
      return;
    }

    res.status(200).json({ message: 'User profile updated successfully' });
  });
});

// Password change
router.put('/users/:id/password', (req, res) => {
    const userId = req.params.id;
    const { newPassword } = req.body;
  
    // Update the user's password in the database
    const query = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(query, [newPassword, userId], (err, result) => {
      if (err) {
        console.error('Error changing password:', err);
        res.status(500).send('Error changing password');
        return;
      }
  
      res.status(200).json({ message: 'Password changed successfully' });
    });
  });
  
  // Account deletion
router.delete('/users/:id', (req, res) => {
    const userId = req.params.id;
  
    // Delete the user's account from the database
    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [userId], (err, result) => {
      if (err) {
        console.error('Error deleting user:', err);
        res.status(500).send('Error deleting user');
        return;
      }
  
      res.status(200).json({ message: 'Account deleted successfully' });
    });
  });
  
  // User list retrieval
router.get('/users', (req, res) => {
    const { page, limit, sort, search } = req.query;
    const offset = (page - 1) * limit;
  
    // Construct the SQL query with pagination, sorting, and searching
    let query = 'SELECT id, name, email, gender, phone FROM users';
    let countQuery = 'SELECT COUNT(*) AS count FROM users';
  
    if (search) {
      query += ` WHERE name LIKE '%${search}%'`;
      countQuery += ` WHERE name LIKE '%${search}%'`;
    }
  
    if (sort) {
      query += ` ORDER BY ${sort}`;
    }
  
    query += ` LIMIT ${limit} OFFSET ${offset}`;
  
    // Fetch the paginated user list and total count from the database
    db.query(query, (err, users) => {
      if (err) {
        console.error('Error retrieving user list:', err);
        res.status(500).send('Error retrieving user list');
        return;
      }
  
      db.query(countQuery, (countErr, countResult) => {
        if (countErr) {
          console.error('Error retrieving user count:', countErr);
          res.status(500).send('Error retrieving user count');
          return;
        }
  
        const totalCount = countResult[0].count;
  
        res.status(200).json({ users, totalCount });
      });
    });
  });
  
  // Handle CSV download
  router.get('/users/download-csv', (req, res) => {
    // Fetch all users from the database
    const query = 'SELECT id, name, email, gender, phone FROM users';
    db.query(query, (err, users) => {
      if (err) {
        console.error('Error retrieving user list:', err);
        res.status(500).send('Error retrieving user list');
        return;
      }
  
      // Create a CSV writer
      const csvWriter = createCsvWriter({
        path: 'userList.csv',
        header: [
          { id: 'id', title: 'ID' },
          { id: 'name', title: 'Name' },
          { id: 'email', title: 'Email' },
          { id: 'gender', title: 'Gender' },
          { id: 'phone', title: 'Phone' },
        ],
      });
  
      // Write the users to the CSV file
      csvWriter
        .writeRecords(users)
        .then(() => {
          console.log('CSV file created successfully');
          res.download('userList.csv', 'userList.csv', (downloadErr) => {
            if (downloadErr) {
              console.error('Error downloading CSV:', downloadErr);
              res.status(500).send('Error downloading CSV');
              return;
            }
  
            // Delete the CSV file after download
            fs.unlink('userList.csv', (unlinkErr) => {
              if (unlinkErr) {
                console.error('Error deleting CSV file:', unlinkErr);
              }
            });
          });
        })
        .catch((writeErr) => {
          console.error('Error writing CSV:', writeErr);
          res.status(500).send('Error writing CSV');
        });
    });
  });
  
  
  module.exports = router;