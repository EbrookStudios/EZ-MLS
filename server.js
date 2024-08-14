const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to handle the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to add a new listing
app.post('/add-listing', (req, res) => {
    const newListing = req.body;
    console.log('New listing received:', newListing); // Log the received listing data

    // Read the existing data from the JSON file
    fs.readFile(path.join(__dirname, 'tri_county_data.json'), (err, data) => {
        if (err) {
            console.error('Error reading file:', err); // Log an error if file reading fails
            return res.status(500).send('Error reading file');
        }

        let listings = [];

        // Parse the existing JSON data, if available
        try {
            listings = JSON.parse(data);
            console.log('Existing listings:', listings); // Log the current listings before updating
        } catch (err) {
            console.error('Error parsing JSON data:', err); // Log an error if JSON parsing fails
            return res.status(500).send('Error parsing data');
        }

        // Add the new listing with a timestamp
        newListing.timestamp = new Date().toISOString();
        listings.push(newListing);
        console.log('Updated listings:', listings); // Log the updated list with the new listing

        // Write the updated data back to the JSON file
        fs.writeFile(path.join(__dirname, 'tri_county_data.json'), JSON.stringify(listings, null, 2), err => {
            if (err) {
                console.error('Error writing file:', err); // Log an error if file writing fails
                return res.status(500).send('Error writing file');
            }

            console.log('Listing added successfully and file updated.'); // Confirm successful write operation
            res.status(200).send('Listing added successfully');
        });
    });
});

// Serve the JSON data file directly
app.get('/tri_county_data.json', (req, res) => {
    const filePath = path.join(__dirname, 'tri_county_data.json');
    
    // Check if the file exists
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('JSON file not found');
    }
});

// Catch-all route for handling 404s
app.use((req, res) => {
    res.status(404).send('Sorry, page not found');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
