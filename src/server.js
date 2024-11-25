const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // Using mysql2/promise for async/await support
const cors = require('cors');
const fs = require('fs');



const app = express();
const PORT = 8080;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files from the same directory
app.use(cors());

// Serve HTML file
app.get('/', (req, res) => { 
    res.sendFile(path.join(__dirname, 'Login/LoginPage.html'));
});

// Store entries
const entries = {};


// // Database configuration
// const config = {
//     host: '127.0.0.1',
//     user: 'root',
//     password: '123456789',
//     database: 'grat_db',
//     port: 3306 // MySQL default port
// };

// Database configuration (with SSL)
const config = { 
    host: 'gratitiudeapp.mysql.database.azure.com',  // Your Azure MySQL server hostname 
    user: 'riad@gratitiudeapp',  // Admin username (Azure MySQL format: username@server-name) 
    password: '123456789Rr',  // Your MySQL password 
    database: 'grat_db',  // Your actual database name (grat_db) 
    port: 3306,  // Default MySQL port 
    ssl: {
        ca: fs.readFileSync(path.join(__dirname, 'DigiCertGlobalRootCA.crt.pem'))  // Path to the Azure MySQL SSL certificate
    }  // SSL configuration required for Azure MySQL
};



// Handle entry submission and save to database
app.post('/submit', async (req, res) => {
    const { entry, mood, date } = req.body;

    if (!entries[date]) {
        entries[date] = [];
    }
    entries[date].push({ entry, mood });

    // Validate input
    if (!entry || !mood || !date) {
        return res.status(400).json({ error: 'Entry, mood, and date are required.' });
    }

    let connection;

    try {
        // Create a connection to the database
        connection = await mysql.createConnection(config);

        // Insert the entry into the database
        const sql = 'INSERT INTO mood_entries (entry, mood, date) VALUES (?, ?, ?)';
        await connection.execute(sql, [entry, mood, date]); // Execute the insert

        res.status(201).send(); // Respond with a status code indicating successful creation
    } catch (error) {
        console.error('Database insertion failed:', error); // Log the error
        return res.status(500).json({ error: 'Internal Server Error' }); // Send an error response
    } finally {
        // Ensure the connection is closed
        if (connection) {
            await connection.end();
        }
    }
});



app.get('/entries', async (req, res) => {
    const date = req.query.date;

    // Validate date format (optional)
    const isValidDate = (date) => {
        const datePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/([0-9]{4})$/;
        return datePattern.test(date);
    };

    if (!isValidDate(date)) {
        return res.status(400).json({ error: 'Invalid date format. Please use MM/DD/YYYY.' });
    }

    let connection;

    try {
        // Create a connection to the database
        connection = await mysql.createConnection(config);

        // Query to get all entries for the specified date
        const sql = 'SELECT * FROM mood_entries WHERE date = ?';
        const [rows] = await connection.execute(sql, [date]); // Execute the query

        res.status(200).json(rows); // Respond with the entries found
    } catch (error) {
        console.error('Error retrieving entries from database:', error.stack);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        // Ensure the connection is closed
        if (connection) {
            await connection.end();
        }
    }
});



// Start server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});




