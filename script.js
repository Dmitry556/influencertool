let analysisData = {};

async function analyzeProfile() {
    const urlInput = document.getElementById('instagramUrl');
    const url = urlInput.value.trim();
    
    if (!url) {
        showStatus('Please enter an Instagram URL', 'error');
        return;
    }

    showStatus('Analyzing profile...', 'loading');
    document.getElementById('results').innerHTML = '';

    // Generate unique ID for this analysis
    const analysisId = Date.now().toString();

    // Send to Clay webhook #1
    try {
        await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                instagram_url: url,
                callback_url: `${window.location.origin}/api/webhook`,
                analysis_id: analysisId
            })
        });
        
        showStatus('Processing... This may take 30 seconds', 'loading');
        
        // Start polling for results
        pollForResults(analysisId);
        
    } catch (error) {
        showStatus('Error sending request', 'error');
    }
}

async function pollForResults(analysisId) {
    const pollInterval = setInterval(async () => {
        try {
            const response = await fetch(`/api/webhook?id=${analysisId}`);
            const data = await response.json();
            
            if (response.status === 200 && data.username) {
                clearInterval(pollInterval);
                displayResults(data);
            }
        } catch (error) {
            console.error('Polling error:', error);
        }
    }, 2000); // Poll every 2 seconds
    
    // Stop after 60 seconds
    setTimeout(() => {
        clearInterval(pollInterval);
        showStatus('Analysis timed out. Please try again.', 'error');
    }, 60000);
}

function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = type;
}

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    const table = document.createElement('table');
    table.className = 'results-table';
    
    // Create table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Profile</th>
            <th>Generated Email</th>
            <th>Actions</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Create row for each influencer
    const row = document.createElement('tr');
    
    // Profile column
    const profileCell = document.createElement('td');
    profileCell.innerHTML = `
        <div class="profile-info">
            <div class="username">@${data.username}</div>
            <div class="followers">${formatNumber(data.follower_count)} followers</div>
        </div>
    `;
    row.appendChild(profileCell);
    
    // Email column
    const emailCell = document.createElement('td');
    if (data.error) {
        emailCell.innerHTML = `
            <div class="error-message">${data.error}</div>
        `;
    } else if (data.outreach_email) {
        emailCell.innerHTML = `
            <div class="email-content">${data.outreach_email.replace(/\n/g, '<br>')}</div>
        `;
    } else {
        emailCell.innerHTML = `
            <div class="email-content">No email found - Use Instagram DM</div>
        `;
    }
    row.appendChild(emailCell);
    
    // Actions column
    const actionsCell = document.createElement('td');
    actionsCell.innerHTML = `
        <div class="action-buttons">
            ${data.outreach_email ? `
                <button class="action-btn btn-copy" onclick="copyToClipboard('${data.username}')">
                    Copy Message
                </button>
                <button class="action-btn btn-edit" onclick="editEmail('${data.username}')">
                    Edit
                </button>
                <button class="action-btn btn-regenerate" onclick="regenerateEmail('${data.username}')">
                    Regenerate
                </button>
            ` : ''}
            <button class="action-btn btn-instagram" onclick="openInstagram('${data.username}')">
                Open Instagram
            </button>
            <button class="action-btn btn-reject" onclick="rejectInfluencer('${data.username}')">
                Reject
            </button>
        </div>
    `;
    row.appendChild(actionsCell);
    
    tbody.appendChild(row);
    table.appendChild(tbody);
    
    // Clear previous results and append new table
    resultsDiv.innerHTML = '';
    resultsDiv.appendChild(table);
    
    // Show success status
    showStatus('Analysis complete!', 'success');
}

function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function approveInfluencer(username) {
    alert(`Approved ${username} - Send to Clay webhook for Instantly.ai`);
    // Send approval to Clay
}

function rejectInfluencer(username) {
    alert(`Rejected ${username}`);
}

function copyToClipboard(username) {
    const emailContent = document.querySelector(`tr:has(.username:contains('@${username}')) .email-content`).textContent;
    navigator.clipboard.writeText(emailContent).then(() => {
        showStatus('Email copied to clipboard!', 'success');
    }).catch(() => {
        showStatus('Failed to copy email', 'error');
    });
}

function editEmail(username) {
    // Implement email editing functionality
    showStatus('Email editing coming soon!', 'info');
}

function regenerateEmail(username) {
    // Implement email regeneration functionality
    showStatus('Email regeneration coming soon!', 'info');
}

function openInstagram(username) {
    window.open(`https://www.instagram.com/${username}`, '_blank');
}
