const express = require('express'); 
const path = require('path'); 
const bodyParser = require('body-parser'); 
const mysql = require('mysql2/promise'); // Using mysql/promise for async/await support
const cors = require('cors'); 

const app = express(); 
const PORT = 8080; 

// Middleware 
app.use(bodyParser.json()); 
app.use(express.static(path.join(__dirname))); // Serve static files from the same directory 
app.use(cors()); 
  
// Serve HTML file 
app.get('/', (req, res) => {  
    res.sendFile(path.join(__dirname, 'Gratitude.html')); 
}); 


// Database configuration 
const config = { 
    host: '127.0.0.1', 
    user: 'root', 
    password: 'ogvYi70u#',  
    database: 'grat_db', 
    port: 3306 // MySQL default port 
}; 

// Handle entry submission and save to database 
app.post('/submit', async (req, res) => { 
    const { entry, mood, date } = req.body; 

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

  
// Get entries for a specific date
app.get('/entries', async (req, res) => { 
    const { date } = req.query;
  

    // Validate the parameter for date 
    if (!date) {
	return res.status(400).json({error: 'A Date is required.' });
    }

    // Create MySQL Connection
    let connection; 
    try { 
        connection = await mysql.createConnection(config); 

        // Query database for the entries that match specified date 
        const sql = 'SELECT * FROM mood_entries WHERE date = ?'; 
        const [rows] = await connection.execute(sql, [date]); 

        // Return an error message if no entries were found for a certain date	
	if (rows.length === 0) {
		return res.status(404).json({ error: 'No entries have been found for the selected date.' });
  	}

        // Return entries found by the system 
	res.json(rows);
    } catch (error) { 
        console.error('Error fetching entries:', error.stack); 
        return res.status(500).json({ error: 'Internal Server Error' }); 
    } finally { 
        // Ensure the connection is closed 
        if (connection) { 
            await connection.end(); 
        } 
    } 
}); 

// Fetch events for FullCalendar 
app.get('/events', async (req, res) => {
	let connection;
	try {
	connection = await mysql.createConnection(config)

	const sql = 'SELECT * FROM mood_entries';
	const[rows] = await connection.execute(sql);

        // Format events for FullCalendar 
	const entries = rows.map(entry => ({
		title: entry.entry,
		start: entry.date,
		color: entry.mood === 'Happy' ? 'green' : entry.mood === 'Sad' ? 'red' : 'gray'
	}));

	res.json(entries); // Return entries to FullCalendar
    } catch (error) { 
        console.error('Error fetching events:', error.stack); 
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
