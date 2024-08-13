let data = [];

// Show the loading spinner
document.getElementById('loadingSpinner').style.display = 'block';

// Fetch the JSON data
fetch('tri_county_data.json')
    .then(response => response.json())
    .then(jsonData => {
        data = jsonData;
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('searchBar').addEventListener('input', search);
        document.getElementById('sort').addEventListener('change', search);
        document.getElementById('clearSearch').addEventListener('click', clearSearch);
        document.getElementById('theme-icon').addEventListener('click', toggleTheme);
    });

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
        results.sort((a, b) => (a[sortField] > b[sortField]) ? 1 : -1);
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
        noResults.textContent = 'No results found.';
    } else {
        noResults.style.display = 'none';
        results.forEach(result => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${highlight(result.ListAgentFullName)}</td>
                <td>${highlight(result.ListAgentDirectPhone)}</td>
                <td>${highlight(result.Address)}</td>
                <td>${highlight(result.BuyerAgencyCompensation)}</td>
            `;
            resultsContainer.appendChild(tr);
        });
    }
}

// Highlight the search term in results
function highlight(text) {
    const query = document.getElementById('searchBar').value.toLowerCase();
    if (!query) return text;
    return text ? text.toString().replace(new RegExp(query, "gi"), match => `<mark>${match}</mark>`) : '';
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
