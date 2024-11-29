const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files from the same directory

// Serve HTML file
app.get('/', (req, res) => { 
    res.sendFile(path.join(__dirname, 'Gratitude.html'));
});

// Store entries
const entries = {};

// Handle entry submission
app.post('/submit', (req, res) => {
    const { entry, mood, date } = req.body;

    if (!entries[date]) {
        entries[date] = [];
    }
    entries[date].push({ entry, mood });
    
    res.status(201).send(); // Respond with a status code indicating successful creation
});

// Get entries for a specific date
app.get('/entries', (req, res) => {
    const date = req.query.date;
    res.json(entries[date] || []); // Respond with the entries for the specified date
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
