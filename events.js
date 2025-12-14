/* ===== Event-related API helpers =====
These call your backend via apiCall() (defined in utils.js).
If you change your API Gateway URL, only update API_BASE_URL in utils.js (or your config). */
async function fetchEvents() {
  return await apiCall('/events');
}

async function fetchEventDetails(eventId) {
  return await apiCall(`/event/${eventId}`);
}

async function fetchEventStats(eventId) {
  return await apiCall(`/stats/${eventId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
}

async function fetchEventAttendees(eventId) {
  return await apiCall(`/attendees/${eventId}`);
}

/* ===== Handle Add Event Form Submission ===== */
async function handleAddEvent(event) {
  event.preventDefault();

  if (!isAdmin()) {
    showTopMessage('Unauthorized: Only admins can create events', 'error');  // ✅
    return;
  }

  const formData = new FormData(event.target);
  const eventData = {
    title: formData.get('title'),
    description: formData.get('description'),
    venue: formData.get('venue'),
    start_at: formData.get('start_at'),
    banner_url: formData.get('banner_url')
  };

  // Show loading
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating...';
  submitBtn.style.opacity = '0.7';

  try {
    await apiCall('/events', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData)
    });

    // Close modal smoothly
    const modal = document.getElementById('addEventModal');
    modal.style.transition = 'opacity 0.2s ease-out';
    modal.style.opacity = '0';

    setTimeout(() => {
      modal.style.display = 'none';
      modal.style.opacity = '1';
      event.target.reset();
    }, 200);

    // Show success at top with event name ✅
    showTopMessage(`✓ Event "${eventData.title}" created successfully!`, 'success');

    // Reload events
    setTimeout(() => loadEvents(), 500);

  } catch (error) {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    submitBtn.style.opacity = '1';

    // Show error at top ✅
    showTopMessage(error.message || 'Failed to create event', 'error');
  }
}

/* ===== Handle RSVP form submission =====
- Prevents page reload
- Sends the user's RSVP to the backend
- Shows a success/error message and refreshes modal stats */
async function submitRSVP(event, eventId) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const rsvpData = {
    event_id: eventId,
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    response: formData.get('response')
  };

  // Get event name from modal title
  const eventTitle = document.querySelector('.modal-title')?.textContent || 'this event';

  // Show loading state on button
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';
  submitBtn.style.opacity = '0.7';

  try {
    const result = await apiCall('/rsvp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rsvpData)
    });

    // Close modal smoothly
    const modal = document.getElementById('eventModal');
    modal.style.transition = 'opacity 0.2s ease-out';
    modal.style.opacity = '0';

    setTimeout(() => {
      modal.style.display = 'none';
      modal.style.opacity = '1'; // Reset for next time
    }, 200);

    // Show success message at top with event name
    const responseText = rsvpData.response === 'Yes' ? 'registered for' : 'declined';
    showTopMessage(`✓ Successfully ${responseText} "${eventTitle}"`, 'success');

    // If admin, silently update stats in background
    if (isAdmin()) {
      setTimeout(() => {
        loadEventStats(eventId);
      }, 500);
    }

  } catch (error) {
    // Re-enable button on error
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    submitBtn.style.opacity = '1';

    // Show error in modal (don't close)
    const errorMessage = error.message || 'RSVP failed';
    showMessage(errorMessage, 'error');
  }
}

/* ===== Lightweight in-page alert message (success/error) =====
Inserts a styled message near the RSVP section. */
function showMessage(message, type) {
  const existingMessage = document.querySelector('.form-message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create message element
  const messageDiv = document.createElement('div');
  messageDiv.className = `form-message ${type}`;
  messageDiv.textContent = message;
  messageDiv.style.padding = '12px 16px';
  messageDiv.style.margin = '16px 0';
  messageDiv.style.borderRadius = '8px';
  messageDiv.style.fontWeight = '500';
  messageDiv.style.fontSize = '0.95rem';

  if (type === 'error') {
    messageDiv.style.backgroundColor = '#fef2f2';
    messageDiv.style.color = '#dc2626';
    messageDiv.style.border = '1px solid #fecaca';
  } else {
    messageDiv.style.backgroundColor = '#f0fdf4';
    messageDiv.style.color = '#16a34a';
    messageDiv.style.border = '1px solid #bbf7d0';
  }

  const form = document.querySelector('.rsvp-form');
  const sectionTitle = form.closest('.section').querySelector('.section-title');

  if (sectionTitle) {
    sectionTitle.parentNode.insertBefore(messageDiv, sectionTitle.nextSibling);
  } else {
    form.parentNode.insertBefore(messageDiv, form);
  }

  if (type === 'success') {
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 5000);
  }
}

/* ===== Render the event cards on the homepage grid =====
Dynamic bits you'll likely change per project:
- Card markup (classes and layout)
- Fallback banner image URL */
function displayEvents(events) {
  const grid = document.getElementById('eventsGrid');

  if (events.length === 0) {
    grid.innerHTML = '<div class="loading">No events found</div>';
    return;
  }

  grid.innerHTML = events.map(event => `
        <div class="event-card" onclick="openEventModal('${event.event_id}')">
            <div class="event-banner" style="background-image: url('${event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}')"></div> 
            <div class="event-content">
                <div class="event-title">${event.title}</div>
                <div class="event-description">${event.description || 'Join us for an amazing event!'}</div>
                <div class="event-details">
                    <div class="event-detail">📍 ${event.venue || 'TBA'}</div>
                    <div class="event-detail">📅 ${formatDate(event.start_at)}</div>
                </div>
            </div>
        </div>
    `).join('');
}

/* ===== Load and display simple Yes/No counts =====
// Called from within the modal to keep stats fresh after an RSVP. */
async function loadEventStats(eventId) {
  // Only load stats if user is admin
  if (!isAdmin()) {
    return;
  }

  try {
    const stats = await fetchEventStats(eventId);
    const yesElement = document.getElementById(`yes-${eventId}`);
    const noElement = document.getElementById(`no-${eventId}`);

    if (yesElement) yesElement.textContent = stats.Yes || 0;
    if (noElement) noElement.textContent = stats.No || 0;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}


/* ===== Open the event details modal =====
Checks authentication first, then fetches details.
Stats only for admins. */
async function openEventModal(eventId) {
  // Check if user is logged in FIRST
  if (!isAuthenticated()) {
    // User not logged in - show message and prompt to login
    showTopMessage('Please login or register to view event details and RSVP', 'info');

    // Wait a moment then open login modal
    setTimeout(() => {
      showAuthModal('login');
    }, 500);

    return; // Stop here - don't open event modal
  }

  // User is logged in - proceed as normal
  try {
    const modal = document.getElementById('eventModal');
    const modalContent = document.getElementById('modalContent');

    modalContent.innerHTML = '<div class="loading">Loading event details...</div>';
    modal.style.display = 'block';

    // Fetch event details and attendees for all users
    // Stats only for admins
    const userIsAdmin = isAdmin();

    let event, attendees, stats = null;

    if (userIsAdmin) {
      // Admin: Fetch everything including stats
      [event, attendees, stats] = await Promise.all([
        fetchEventDetails(eventId),
        fetchEventAttendees(eventId),
        fetchEventStats(eventId)
      ]);
    } else {
      // Regular user: Skip stats
      [event, attendees] = await Promise.all([
        fetchEventDetails(eventId),
        fetchEventAttendees(eventId)
      ]);
    }

    const banner = event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200';

    // Build stats section only for admins
    const statsSection = userIsAdmin ? `
            <div class="section rsvp-section">
              <h2 class="section-title">Event Statistics (Admin Only)</h2>
                <!-- Full-width stats bar -->
                <div class="stats-bar">
                  <div class="stat-card yes-card">
                    <span class="stat-number" id="yes-${eventId}">${stats.Yes || 0}</span>
                    <span class="stat-label">Yes Responses</span>
                  </div>
                  <div class="stat-card no-card">
                    <span class="stat-number" id="no-${eventId}">${stats.No || 0}</span>
                    <span class="stat-label">No Responses</span>
                  </div>
                </div>

              <!-- Simple Attendees Table -->
              <div class="attendees-table">
                <table>
                  <thead>
                    <tr>
                      <th>Going</th>
                      <th>Not Going</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        ${attendees
        .filter(a => a.response.toLowerCase() === 'yes')
        .map(a => `<div>${a.full_name}</div>`)
        .join('') || '<em>No confirmed attendees yet.</em>'
      }
                      </td>
                      <td>
                        ${attendees
        .filter(a => a.response.toLowerCase() === 'no')
        .map(a => `<div>${a.full_name}</div>`)
        .join('') || '<em>No declines yet.</em>'
      }
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
        ` : '';

    modalContent.innerHTML = `
      <div class="modal-banner" style="background-image:url('${banner}')"></div>

      <div class="modal-header">
        <h1 class="modal-title" style="margin-bottom:10px;">${event.title}</h1>
        <p class="event-description" style="color:#4b5563;margin:10px 0 18px;">
          ${event.description || ''}
        </p>
        <div class="modal-details" style="margin-top:10px;">
          <div class="event-detail">📍 <span>${event.venue || 'TBA'}</span></div>
          <div class="event-detail">📅 <span>${formatDate(event.start_at)}</span></div>
          <div class="event-detail">⏰ <span>${formatTime(event.start_at)}</span></div>
        </div>
      </div>

      <div class="modal-body">

        <!-- RSVP form -->
        <div class="section">
          <h2 class="section-title">RSVP to this Event</h2>
          <form class="rsvp-form" onsubmit="submitRSVP(event, '${eventId}')">
            <div class="form-group">
              <label for="fullName">Full Name *</label>
              <input type="text" id="fullName" name="full_name" required>
            </div>
            <div class="form-group">
              <label for="email">Email *</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="response">Response *</label>
              <select id="response" name="response" required>
                <option value="">Select your response</option>
                <option value="Yes">Yes, I'll be there!</option>
                <option value="No">No, I can't make it</option>
              </select>
            </div>
            <button type="submit" class="submit-btn">Submit RSVP</button>
          </form>
        </div>

        <!-- Event Statistics (Admin Only) -->
        ${statsSection}
      </div>
    `;
  } catch (error) {
    document.getElementById('modalContent').innerHTML =
      `<div class="error">Error loading event details: ${error.message}</div>`;
  }
}