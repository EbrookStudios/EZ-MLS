document.addEventListener('DOMContentLoaded', function() {
    initializeVisitorCounter();
    fetchData();
    initializeEventListeners();
});

let data = [];

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
            search(); // Display data after loading
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

    // Filter results based on query
    let results = data.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(query)
        )
    );

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
                <td>${highlight(result.City)}</td>
                <td>${highlight(result.BuyerAgencyCompensation)}</td>
            `;
            resultsContainer.appendChild(tr);
        });
    }
}

function highlight(text) {
    const query = document.getElementById('searchBar').value.toLowerCase();
    if (!query || !text) return text;
    return text.toString().replace(new RegExp(query, "gi"), match => `<mark>${match}</mark>`);
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
    if (password === 'your_password_here') { // Replace with your actual password
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

    // Send the new listing to the server
    fetch('/add-listing', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newListing),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(() => {
        data.push(newListing); // Update the local array
        alert('Listing added successfully!');
        clearFormFields();
        search(); // Re-run search to include the new listing
    })
    .catch(error => {
        console.error('There was a problem with the add listing request:', error);
        alert('Failed to add listing. Please try again later.');
    });
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

// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoVNP1YO8eysX5uhoINMupFqOf1tsuN20",
  authDomain: "ezmls-d3192.firebaseapp.com",
  projectId: "ezmls-d3192",
  storageBucket: "ezmls-d3192.appspot.com",
  messagingSenderId: "797326463919",
  appId: "1:797326463919:web:6e66e8a26f5dcea7db555a",
  measurementId: "G-4YRXCQ83ZD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
