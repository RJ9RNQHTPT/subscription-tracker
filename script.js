const API_BASE_URL = 'http://127.0.0.1:5000';
const token = localStorage.getItem('authToken');
console.log('Retrieved token from localStorage:', token);

document.addEventListener('DOMContentLoaded', () => {
    fetchSubscriptions();
    applyDarkModeSetting();
});

async function fetchSubscriptions() {
    console.log('Fetching subscriptions...');
    const subscriptionsList = document.getElementById('subscriptionsList');
    subscriptionsList.innerHTML = '';
    
    if (!token) {
        console.error('No token found. Please log in.');
        document.getElementById('authMessage').innerHTML = '<span class="error-message">No token found. <a href="#" id="loginLink">Please log in.</a></span>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/subscriptions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const subscriptions = await response.json();
        
        if (subscriptions.length === 0) {
            subscriptionsList.innerHTML = '<p>No subscriptions found.</p>';
            return;
        }

        subscriptions.forEach(sub => {
            const div = document.createElement('div');
            div.className = 'subscription-card';
            div.innerHTML = `
                <strong>${sub.serviceName}</strong>
                <p>Start Date: ${new Date(sub.startDate).toLocaleDateString()}</p>
                <p>End Date: ${new Date(sub.endDate).toLocaleDateString()}</p>
                <button onclick="deleteSubscription('${sub._id}')">Delete</button>
            `;
            subscriptionsList.appendChild(div);
        });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        subscriptionsList.innerHTML = '<p>Error loading subscriptions.</p>';
    }
}

document.getElementById('addSubscription').addEventListener('click', async () => {
    const serviceName = document.getElementById('serviceName').value.trim();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!serviceName || !startDate || !endDate) {
        alert('Please fill in all fields before adding a subscription.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/subscriptions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ serviceName, startDate, endDate })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        alert('Subscription added successfully');
        fetchSubscriptions();
    } catch (error) {
        console.error('Error adding subscription:', error);
        alert('Failed to add subscription');
    }
});

document.getElementById('darkModeToggle').addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

function applyDarkModeSetting() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
}

document.getElementById('loginLink')?.addEventListener('click', () => {
    alert('Redirecting to login page... (Functionality to be implemented)');
});
