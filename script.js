const API_BASE_URL = 'https://my-subscription-reminder.herokuapp.com/api'; // Add /api prefix

// Fetch and display subscriptions
async function fetchSubscriptions() {
  const subscriptionsList = document.getElementById('subscriptionsList');
  subscriptionsList.innerHTML = 'Loading subscriptions...';

  try {
    const response = await fetch(`${API_BASE_URL}/subscriptions`);
    const subscriptions = await response.json();

    if (subscriptions.length === 0) {
      subscriptionsList.innerHTML = '<p>No subscriptions found.</p>';
      return;
    }

    subscriptionsList.innerHTML = '';
    subscriptions.forEach((sub) => {
      const div = document.createElement('div');
      div.className = 'subscription';
      div.innerHTML = `
        <strong>${sub.serviceName}</strong>
        <p>Start Date: ${new Date(sub.startDate).toLocaleDateString()}</p>
        <p>End Date: ${new Date(sub.endDate).toLocaleDateString()}</p>
      `;
      subscriptionsList.appendChild(div);
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    subscriptionsList.innerHTML = '<p>Error loading subscriptions.</p>';
  }
}

// Add a new subscription
document.getElementById('addSubscriptionForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const serviceName = document.getElementById('serviceName').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  try {
    const response = await fetch(`${API_BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ serviceName, startDate, endDate }),
    });

    if (response.ok) {
      alert('Subscription added successfully!');
      fetchSubscriptions(); // Refresh the list
      event.target.reset(); // Clear the form
    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  } catch (error) {
    console.error('Error adding subscription:', error);
    alert('Error adding subscription.');
  }
});

// Load subscriptions on page load
fetchSubscriptions();
