let data = [];

document.addEventListener('DOMContentLoaded', () => {
    initializeVisitorCounter();
    fetchData();
    initializeEventListeners();
});

function initializeVisitorCounter() {
    const visitCountKey = 'visitCount';
    const visits = Number(localStorage.getItem(visitCountKey) || 0) + 1;
    localStorage.setItem(visitCountKey, visits);
    document.getElementById('visitCount').textContent = visits;
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
    document.getElementById('searchBar').addEventListener('input', () => searchAndUpdateUI());
    document.getElementById('sort').addEventListener('change', () => searchAndUpdateUI());
    document.getElementById('clearSearch').addEventListener('click', clearSearch);
    document.getElementById('theme-icon').addEventListener('click', toggleTheme);
    document.getElementById('addListingButton').addEventListener('click', toggleAddListingFormVisibility);
    document.getElementById('checkPasswordButton').addEventListener('click', checkPassword);
    document.getElementById('submitListing').addEventListener('click', addNewListing);
}

function searchAndUpdateUI() {
    const results = search(document.getElementById('searchBar').value, document.getElementById('sort').value);
    displayResults(results);
}

function search(query, sortField) {
    query = query.toLowerCase();
    let results = data.filter(item => Object.values(item).some(val => val.toString().toLowerCase().includes(query)));
    return sortField ? results.sort((a, b) => sortComparator(a[sortField], b[sortField])) : results;
}

function sortComparator(a, b) {
    return typeof a === 'string' ? a.localeCompare(b) : a - b;
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = results.map(result => createTableRow(result)).join('');
    document.getElementById('noResults').style.display = results.length ? 'none' : 'block';
}

function createTableRow(result) {
    return `<tr>
                <td>${highlight(result.ListAgentFullName)}</td>
                <td>${highlight(result.ListAgentDirectPhone)}</td>
                <td>${highlight(result.Address)}</td>
                <td>${highlight(result.City)}</td>
                <td>${highlight(result.BuyerAgencyCompensation)}</td>
            </tr>`;
}

function highlight(text) {
    const query = document.getElementById('searchBar').value.toLowerCase();
    return query ? text.replace(new RegExp(query, 'gi'), match => `<mark>${match}</mark>`) : text;
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
    form.style.display = form.style.display === 'none' ? 'flex' : 'none';
}

function checkPassword() {
    const password = document.getElementById('listingPassword').value;
    if (password === 'ezmoney') {
        document.getElementById('listingFormFields').style.display = 'block';
    } else {
        alert('Incorrect password. Please try again.');
    }
}

function addNewListing() {
    const fields = ['agentOrHomeowner', 'agentName', 'licenseNumber', 'address', 'city', 'price', 'compensation'].map(id => document.getElementById(id));
    if (fields.some(field => !field.value.trim())) {
        alert('Please fill out all required fields.');
        return;
    }

    data.push(createListingObject(fields));
    alert('Listing added successfully!');
    clearFormFields();
}

function createListingObject(fields) {
    return {
        ListAgentFullName: fields[1].value,
        ListAgentDirectPhone: fields[0].value === 'Agent' ? fields[2].value : 'N/A',
        Address: fields[3].value,
        City: fields[4].value,
        Price: fields[5].value,
        BuyerAgencyCompensation: fields[6].value
    };
}

function clearFormFields() {
    document.querySelectorAll('#addListingForm input, #addListingForm select').forEach(input => input.value = '');
    document.getElementById('listingFormFields').style.display = 'none';
}
