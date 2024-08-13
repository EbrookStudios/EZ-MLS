 let data = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeVisitorCounter();
    fetchData();
    initializeEventListeners();
});

function initializeVisitorCounter() {
    const visitCount = localStorage.getItem('visitCount') || 0;
    localStorage.setItem('visitCount', Number(visitCount) + 1);
    document.getElementById('visitCount').textContent = localStorage.getItem('visitCount');
}

function fetchData() {
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = 'block';

    fetch('tri_county_data.json')
        .then(response => response.json())
        .then(jsonData => {
            data = jsonData;
            spinner.style.display = 'none';
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            spinner.style.display = 'none';
            document.getElementById('noResults').style.display = 'block';
            document.getElementById('noResults').textContent = 'Failed to load data.';
        });
}

function initializeEventListeners() {
    document.getElementById('searchBar').addEventListener('input', search);
    document.getElementById('sort').addEventListener('change', search);
    document.getElementById('clearSearch').addEventListener('click', clearSearch);
    document.getElementById('theme-icon').addEventListener('click', toggleTheme);
    document.getElementById('addListingButton').addEventListener('click', showAddListingForm);
    document.getElementById('checkPasswordButton').addEventListener('click', checkPassword);
    document.getElementById('submitListing').addEventListener('click', addNewListing);
}

function search() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    const sortField = document.getElementById('sort').value;

    let results = data.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(query)
        )
    );

    if (!results.length && query) {
        results = findCloseMatches(query);
    }

    if (sortField) {
        results.sort((a, b) => typeof a[sortField] === 'string' ?
            a[sortField].localeCompare(b[sortField]) :
            a[sortField] - b[sortField]);
    }

    displayResults(results);
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    const noResults = document.getElementById('noResults');
    resultsContainer.innerHTML = '';

    if (!results.length) {
        noResults.style.display = 'block';
        noResults.textContent = 'No results found. Showing closest matches:';
    } else {
        noResults.style.display = 'none';
        results.forEach(result => {
            const tr = document.createElement('tr');
            tr.innerHTML = 
                <td>${highlight(result.ListAgentFullName)}</td>
                <td>${highlight(result.ListAgentDirectPhone)}</td>
                <td>${highlight(result.Address)}</td>
                <td>${highlight(result.City)}</td>
                <td>${highlight(result.BuyerAgencyCompensation)}</td>
            ;
            resultsContainer.appendChild(tr);
        });
    }
}

function highlight(text) {
    const query = document.getElementById('searchBar').value.toLowerCase();
    return query ? text.toString().replace(new RegExp(query, "gi"), match => <mark>${match}</mark>) : text;
}

function findCloseMatches(query) {
    const threshold = 0.3;
    return data.filter(item =>
        Object.values(item).some(val =>
            calculateSimilarity(query, String(val).toLowerCase()) > threshold
        )
    );
}

function calculateSimilarity(str1, str2) {
    const intersection = new Set([...str1].filter(x => str2.includes(x)));
    return intersection.size / (new Set([...str1]).size + new Set([...str2]).size - intersection.size);
}

function clearSearch() {
    document.getElementById('searchBar').value = '';
    document.getElementById('sort').value = '';
    search();
}

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    body.classList.toggle('dark-theme');
    themeIcon.classList.toggle('fa-sun', body.classList.contains('dark-theme'));
    themeIcon.classList.toggle('fa-moon', !body.classList.contains('dark-theme'));
}

function showAddListingForm() {
    const form = document.getElementById('addListingForm');
    form.style.display = form.style.display === 'none' ? 'flex' : 'none';
}

function checkPassword() {
    const password = document.getElementById('listingPassword').value;
    if (password === 'ezmoney') {
        document.getElementById('listingFormFields').style.display = 'block';
    } else {
        alert('Incorrect password');
    }
}

function addNewListing() {
    const fields = ['agentOrHomeowner', 'agentName', 'licenseNumber', 'address', 'city', 'price', 'compensation'].map(id => document.getElementById(id));
    if (fields.some(field => !field.value)) {
        alert('Please fill out all required fields.');
        return;
    }

    const newListing = {
        ListAgentFullName: fields[1].value,
        ListAgentDirectPhone: fields[0].value === 'Agent' ? fields[2].value : 'N/A',
        Address: fields[3].value,
        City: fields[4].value,
        Price: fields[5].value,
        BuyerAgencyCompensation: fields[6].value
    };

    data.push(newListing);
    alert('Listing added successfully!');
    clearFormFields();
}

function clearFormFields() {
    document.querySelectorAll('#addListingForm input, #addListingForm select').forEach(input => input.value = '');
    document.getElementById('listingFormFields').style.display = 'none';
}
