let data = [];

document.addEventListener('DOMContentLoaded', () => {
    initializeVisitorCounter();
    fetchData();
    initializeEventListeners();
});

function initializeVisitorCounter() {
    const visitCount = localStorage.getItem('visitCount') || 0;
    localStorage.setItem('visitCount', Number(visitCount) + 1);
    document.getElementById('visitCount').textContent = localStorage.getItem('visitCount');
}

async function fetchData() {
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = 'block';
    try {
        const response = await fetch('tri_county_data.json');
        data = await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('noResults').textContent = 'Failed to load data.';
        document.getElementById('noResults').style.display = 'block';
    } finally {
        spinner.style.display = 'none';
    }
}

function initializeEventListeners() {
    document.getElementById('searchBar')?.addEventListener('input', searchAndUpdateUI);
    document.getElementById('sort')?.addEventListener('change', searchAndUpdateUI);
    document.getElementById('clearSearch')?.addEventListener('click', clearSearch);
    document.getElementById('theme-icon')?.addEventListener('click', toggleTheme);
    document.getElementById('addListingButton')?.addEventListener('click', toggleAddListingFormVisibility);
    document.getElementById('checkPasswordButton')?.addEventListener('click', checkPassword);
    document.getElementById('submitListing')?.addEventListener('click', addNewListing);
}

function searchAndUpdateUI() {
    const query = document.getElementById('searchBar').value;
    const sortField = document.getElementById('sort').value;
    const results = search(query, sortField);
    displayResults(results);
}

function search(query, sortField) {
    query = query.toLowerCase();
    let filteredResults = data.filter(item =>
        Object.values(item).some(val => (val?.toString() ?? "").toLowerCase().includes(query))
    );
    if (sortField && filteredResults.length > 0 && filteredResults[0][sortField] !== undefined) {
        filteredResults.sort((a, b) => {
            let aValue = a[sortField]?.toString() ?? '';
            let bValue = b[sortField]?.toString() ?? '';
            return aValue.localeCompare(bValue);
        });
    }
    return filteredResults;
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    document.getElementById('noResults').style.display = results.length ? 'none' : 'block';
    results.forEach(result => {
        const row = document.createElement('tr');
        Object.keys(result).forEach(key => {
            const cell = document.createElement('td');
            cell.innerHTML = highlight(result[key], document.getElementById('searchBar').value);
            row.appendChild(cell);
        });
        resultsContainer.appendChild(row);
    });
}

function highlight(text, query) {
    if (!query) return text;
    const pattern = new RegExp(`(${query})`, 'gi');
    return text.toString().replace(pattern, '<mark>$1</mark>');
}

function clearSearch() {
    document.getElementById('searchBar').value = '';
    document.getElementById('sort').value = '';
    searchAndUpdateUI();
}

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    body.classList.toggle('dark-theme');
    themeIcon.classList.toggle('fa-sun', body.classList.contains('dark-theme'));
    themeIcon.classList.toggle('fa-moon', !body.classList.contains('dark-theme'));
}

function toggleAddListingFormVisibility() {
    const form = document.getElementById('addListingForm');
    form.style.display = form.style.display === 'flex' ? 'none' : 'flex';
}

function checkPassword() {
    const passwordField = document.getElementById('listingPassword');
    if (passwordField.value === 'ezmoney') {
        document.getElementById('listingFormFields').style.display = 'block';
    } else {
        alert('Incorrect password. Please try again.');
        passwordField.value = '';
    }
}

function addNewListing() {
    const fields = ['agentOrHomeowner', 'agentName', 'licenseNumber', 'address', 'city', 'price', 'compensation'].map(id => document.getElementById(id));
    if (fields.some(field => !field.value.trim())) {
        alert('Please fill out all required fields.');
        return;
    }

    const newListing = fields.reduce((acc, field) => {
        acc[field.id] = field.value;
        return acc;
    }, {});

    data.push(newListing);
    alert('Listing added successfully!');
    document.getElementById('addListingForm').reset();
    toggleAddListingFormVisibility();
}
