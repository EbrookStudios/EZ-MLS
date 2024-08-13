let data = [];

// Fetch the JSON data
fetch('tri_county_data.json')
    .then(response => response.json())
    .then(jsonData => {
        data = jsonData;
        document.getElementById('searchBar').addEventListener('input', search);
        document.getElementById('sort').addEventListener('change', search);
        document.getElementById('clearSearch').addEventListener('click', clearSearch);
    });

function search() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    const sortField = document.getElementById('sort').value;
    let results = data.filter(item => 
        Object.values(item).some(val => 
            String(val).toLowerCase().includes(query)
        )
    );

    if (sortField) {
        results.sort((a, b) => (a[sortField] > b[sortField]) ? 1 : -1);
    }

    displayResults(results);
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    const noResults = document.getElementById('noResults');
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
        results.forEach(result => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${highlight(result.Address)}</td>
                <td>${highlight(result.City)}</td>
                <td>${highlight(result.CurrentPrice)}</td>
                <td>${highlight(result.OnMarketDate)}</td>
            `;
            resultsContainer.appendChild(tr);
        });
    }
}

function highlight(text) {
    const query = document.getElementById('searchBar').value.toLowerCase();
    if (!query) return text;
    return text.toString().replace(new RegExp(query, "gi"), match => `<mark>${match}</mark>`);
}

function clearSearch() {
    document.getElementById('searchBar').value = '';
    document.getElementById('sort').value = '';
    search();
}
