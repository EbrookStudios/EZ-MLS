const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files (index.html, style.css, script.js)

// API endpoint to add a new listing
app.post('/add-listing', (req, res) => {
    const newListing = req.body;

    // Read the existing data from the JSON file
    fs.readFile('tri_county_data.json', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file');
            return;
        }

        let listings = JSON.parse(data);

        // Add the new listing with a timestamp
        newListing.timestamp = new Date().toISOString();
        listings.push(newListing);

        // Write the updated data back to the JSON file
        fs.writeFile('tri_county_data.json', JSON.stringify(listings, null, 2), err => {
            if (err) {
                res.status(500).send('Error writing file');
                return;
            }

            res.status(200).send('Listing added successfully');
        });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
