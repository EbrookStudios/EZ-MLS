let data = [];

// Fetch the JSON data
fetch('tri_county_data.json')
    .then(response => response.json())
    .then(jsonData => {
        data = jsonData;
        document.getElementById('searchBar').addEventListener('input', search);
    });

function search(event) {
    const query = event.target.value.toLowerCase();
    const results = data.filter(item => 
        Object.values(item).some(val => 
            String(val).toLowerCase().includes(query)
        )
    );
    
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    
    results.forEach(result => {
        const li = document.createElement('li');
        li.textContent = JSON.stringify(result, null, 2);
        resultsContainer.appendChild(li);
    });
}
