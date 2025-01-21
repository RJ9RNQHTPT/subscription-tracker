const API_BASE_URL = 'http://127.0.0.1:5000'; // Adjust if needed

// Function to display messages
function showMessage(message, type = 'success') {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
    messageBox.style.display = 'block';

    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 3000);
}

// Validate date logic
function validateDates(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
        showMessage('End date must be after start date.', 'error');
        return false;
    }
    return true;
}

// Add new subscription
async function addSubscription() {
    const serviceName = document.getElementById('serviceName').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const token = localStorage.getItem('authToken');

    if (!token) {
        showMessage('Auth token is missing', 'error');
        console.error('Auth token is missing');
        return;
    }

    if (!serviceName || !startDate || !endDate) {
        showMessage('All fields are required', 'error');
        return;
    }

    if (!validateDates(startDate, endDate)) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/subscriptions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ serviceName, startDate, endDate })
        });

        if (!response.ok) {
            throw new Error("Failed to add subscription");
        }

        showMessage('Subscription added successfully', 'success');
        fetchSubscriptions();
    } catch (error) {
        console.error("Error adding subscription:", error);
        showMessage('Failed to add subscription', 'error');
    }
}

// Function to format date based on selection
function formatDate(dateString, format = 'british') {
    const date = new Date(dateString);
    if (format === 'british') {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } else {
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
}

// Fetch and display subscriptions
async function fetchSubscriptions(dateFormat = 'british') {
    console.log("Fetching subscriptions...");
    const token = localStorage.getItem('authToken');

    if (!token) {
        showMessage('Auth token is missing', 'error');
        console.error('Auth token is missing');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/subscriptions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch subscriptions");
        }

        const data = await response.json();
        showMessage('Subscriptions loaded successfully', 'success');

        const subscriptionsList = document.getElementById('subscriptionsList');
        subscriptionsList.innerHTML = data.length ? '' : 'No subscriptions found.';
        
        data.forEach(sub => {
            const subElement = document.createElement('div');
            subElement.innerHTML = `<strong>${sub.serviceName}</strong><br>
            Start Date: ${formatDate(sub.startDate, dateFormat)}<br>
            End Date: ${formatDate(sub.endDate, dateFormat)}
            <br><button onclick="deleteSubscription('${sub._id}')">Delete</button>`;
            subscriptionsList.appendChild(subElement);
        });

    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        showMessage('Failed to fetch subscriptions', 'error');
    }
}

// Function to delete a subscription
async function deleteSubscription(id) {
    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch(`${API_BASE_URL}/api/subscriptions/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to delete subscription");
        }

        showMessage('Subscription deleted successfully', 'success');
        fetchSubscriptions();
    } catch (error) {
        console.error("Error deleting subscription:", error);
        showMessage('Failed to delete subscription', 'error');
    }
}

// Handle date format change
function updateDateFormat() {
    const selectedFormat = document.getElementById('dateFormat').value;
    fetchSubscriptions(selectedFormat);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded.');
    fetchSubscriptions();
    document.getElementById('dateFormat').addEventListener('change', updateDateFormat);

    const addSubscriptionButton = document.getElementById('addSubscriptionButton');
    if (addSubscriptionButton) {
        addSubscriptionButton.addEventListener('click', addSubscription);
    } else {
        console.error('Add Subscription button not found.');
    }
});


