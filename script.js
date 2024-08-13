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

function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        document.getElementById('noResults').style.display = 'block';
        document.getElementById('noResults').textContent = 'No results found. Showing closest matches:';
    } else {
        document.getElementById('noResults').style.display = 'none';
        results.forEach(result => {
            const tr = document.createElement('tr');
            Object.keys(result).forEach(key => {
                const cell = document.createElement('td');
                cell.innerHTML = highlight(result[key], document.getElementById('searchBar').value);
                tr.appendChild(cell);
            });
            resultsContainer.appendChild(tr);
        });
    }
}

function highlight(text, query) {
    if (!query) return text;
    const regex = new RegExp(query, 'gi');
    return text.toString().replace(regex, match => `<mark>${match}</mark>`);
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
    themeIcon.classList.toggle('fa-moon');
    themeIcon.classList.toggle('fa-sun');
}

function showAddListingForm() {
    document.getElementById('addListingForm').style.display = 'flex';
}

function checkPassword() {
    const password = document.getElementById('listingPassword').value;
    if (password === 'your_password_here') {
        document.getElementById('listingFormFields').style.display = 'block';
    } else {
        alert('Incorrect password');
    }
}

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
        Price: price,
        BuyerAgencyCompensation: compensation
    };

    data.push(newListing);
    alert('Listing added successfully!');
    clearFormFields();
}

function clearFormFields() {
    document.getElementById('agentOrHomeowner').value = 'Agent';
    document.getElementById('agentName').value = '';
    document.getElementById('licenseNumber').value = '';
    document.getElementById('address').value = '';
    document.getElementById('city').value = '';
    document.getElementById('price').value = '';
    document.getElementById('compensation').value = '';
    document.getElementById('listingFormFields').style.display = 'none';
    document.getElementById('listingPassword').value = ''; // Clear the password field also
}
