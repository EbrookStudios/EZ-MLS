let data = []; // Ensure 'data' is declared only once

// Show the loading spinner
document.getElementById('loadingSpinner').style.display = 'block';

// Fetch the JSON data
fetch('tri_county_data.json')
    .then(response => response.json())
    .then(jsonData => {
        data = jsonData;
        document.getElementById('loadingSpinner').style.display = 'none';
        initializeEventListeners();
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('noResults').style.display = 'block';
        document.getElementById('noResults').textContent = 'Failed to load data.';
    });

// Initialize event listeners
function initializeEventListeners() {
    document.getElementById('searchBar').addEventListener('input', search);
    document.getElementById('sort').addEventListener('change', search);
    document.getElementById('clearSearch').addEventListener('click', clearSearch);
    document.getElementById('theme-icon').addEventListener('click', toggleTheme);
    document.getElementById('addListingButton').addEventListener('click', showAddListingForm);
    document.getElementById('checkPasswordButton').addEventListener('click', checkPassword);
    document.getElementById('submitListing').addEventListener('click', addNewListing);
}

// Search function
function search() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    const sortField = document.getElementById('sort').value;

    // Filter results based on query
    let results = data.filter(item => 
        Object.values(item).some(val => 
            String(val).toLowerCase().includes(query)
        )
    );

    // If no results, try finding close matches
    if (results.length === 0 && query) {
        results = findCloseMatches(query);
    }

    // Sort results if a sort field is selected
    if (sortField) {
        results.sort((a, b) => {
            if (typeof a[sortField] === 'string') {
                return a[sortField].localeCompare(b[sortField]);
            }
            return a[sortField] - b[sortField];
        });
    }

    displayResults(results);
}

// Display the search results
function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    const noResults = document.getElementById('noResults');
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        noResults.style.display = 'block';
        noResults.textContent = 'No results found. Showing closest matches:';
    } else {
        noResults.style.display = 'none';
        results.forEach(result => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${highlight(result.ListAgentFullName)}</td>
                <td>${highlight(result.ListAgentDirectPhone)}</td>
                <td>${highlight(result.Address)}</td>
                <td>${highlight(result.City)}</td>
                <td>${highlight(result.BuyerAgencyCompensation)}</td>
            `;
            resultsContainer.appendChild(tr);
        });
    }
}

// Highlight the search term in results
function highlight(text) {
    const query = document.getElementById('searchBar').value.toLowerCase();
    if (!query || !text) return text;
    return text.toString().replace(new RegExp(query, "gi"), match => `<mark>${match}</mark>`);
}

// Find close matches by checking for partial matches
function findCloseMatches(query) {
    const threshold = 0.3;  // Set a threshold for what constitutes a "close" match
    return data.filter(item => 
        Object.values(item).some(val => 
            calculateSimilarity(query, String(val).toLowerCase()) > threshold
        )
    );
}

// Calculate basic similarity between two strings (e.g., Jaccard similarity)
function calculateSimilarity(str1, str2) {
    const intersection = new Set([...str1].filter(x => new Set([...str2]).has(x)));
    return intersection.size / (new Set([...str1]).size + new Set([...str2]).size - intersection.size);
}

// Clear the search input and results
function clearSearch() {
    document.getElementById('searchBar').value = '';
    document.getElementById('sort').value = '';
    search();
}

// Toggle between dark and light mode
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    body.classList.toggle('dark-theme');
    themeIcon.classList.toggle('fa-moon');
    themeIcon.classList.toggle('fa-sun');
}

// Show the Add Listing form
function showAddListingForm() {
    document.getElementById('addListingForm').style.display = 'flex';
}

// Check the password before showing the listing form fields
function checkPassword() {
    const password = document.getElementById('listingPassword').value;
    if (password === 'ezmoney') { // Replace with your actual password
        document.getElementById('listingFormFields').style.display = 'block';
    } else {
        alert('Incorrect password');
    }
}

// Add a new listing
function addNewListing() {
    const agentOrHomeowner = document.getElementById('agentOrHomeowner').value;
    const agentName = document.getElementById('agentName').value;
    const licenseNumber = document.getElementById('licenseNumber').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const price = document.getElementById('price').value;
    const compensation = document.getElementById('compensation').value;

    if (!agentName || !address || !city || !price || !compensation) {
        alert('Please fill out all required fields.');
        return;
    }

    const newListing = {
        ListAgentFullName: agentName,
        ListAgentDirectPhone: agentOrHomeowner === 'Agent' ? licenseNumber : 'N/A',
        Address: address,
        City: city,
        BuyerAgencyCompensation: compensation,
        Price: price
    };

    data.push(newListing);
    clearFormFields();
    alert('Listing added successfully!');
}

// Clear the form fields after adding a listing
function clearFormFields() {
    document.getElementById('agentOrHomeowner').value = 'Agent';
    document.getElementById('agentName').value = '';
    document.getElementById('licenseNumber').value = '';
    document.getElementById('address').value = '';
    document.getElementById('city').value = '';
    document.getElementById('price').value = '';
    document.getElementById('compensation').value = '';
    document.getElementById('listingFormFields').style.display = 'none';
}
