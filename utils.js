// Base URL of your AWS API Gateway endpoint.
const API_BASE_URL = 'https://your-api-gateway-endpoint.amazonaws.com/prod';

/* Converts a date string (e.g. 2025-11-07T00:00:00Z)
  into a readable format like “Friday, November 7, 2025”.
  If no date is available, it shows “Date TBA”. */
function formatDate(dateString) {
    if (!dateString) return 'Date TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/* Converts a date string into a readable time (e.g. “10:30 AM”).
  Returns “Time TBA” if there’s no time data. */
function formatTime(dateString) {
    if (!dateString) return 'Time TBA';
    return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/* Closes the event modal popup by hiding it from view.
  This is called when the user clicks outside the modal or closes it manually. */
function closeModal() {
    document.getElementById('eventModal').style.display = 'none';
}

/* Detects clicks outside the modal window and closes it automatically.
  This makes the modal easier to exit for users. */
window.onclick = function (event) {
    const modal = document.getElementById('eventModal');
    if (event.target === modal) {
        closeModal();
    }
}

/* Generic helper function for calling your AWS API Gateway endpoints.
  It handles:
  - Making GET/POST/etc. requests with `fetch`
  - Converting responses to JSON
  - Catching and displaying API errors in the console */
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.message || `API error: ${response.status}`;
            throw new Error(errorMessage);
        }
        return data;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

/* Show top success/error/info message
   Displays a floating message bar at the top of the page */
function showTopMessage(message, type) {
    const existing = document.querySelector('.top-message');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.className = `top-message ${type}`;
    msg.textContent = message;
    msg.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        padding: 16px 32px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1rem;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        opacity: 0;
        transition: all 0.3s ease-out;
        max-width: 90%;
        text-align: center;
    `;

    if (type === 'success') {
        msg.style.backgroundColor = '#10b981';
        msg.style.color = 'white';
    } else if (type === 'error') {
        msg.style.backgroundColor = '#ef4444';
        msg.style.color = 'white';
    } else if (type === 'info') {
        msg.style.backgroundColor = '#3b82f6';  // Blue for info
        msg.style.color = 'white';
    }

    document.body.appendChild(msg);

    setTimeout(() => {
        msg.style.opacity = '1';
        msg.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);

    setTimeout(() => {
        msg.style.opacity = '0';
        msg.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => msg.remove(), 300);
    }, 3000);
}