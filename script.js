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
    
    // Store in memory (in production, you might want localStorage)
    window.pendingAnalysis = analysisId;

    // Send to Clay webhook #1
    try {
        await fetch('YOUR_CLAY_WEBHOOK_URL', {
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
    } catch (error) {
        showStatus('Error sending request', 'error');
    }
}

function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = type;
}

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    
    resultsDiv.innerHTML = `
        <div class="influencer-card">
            <div class="profile-header">
                <img src="${data.profile_pic_url}" alt="${data.username}" class="profile-pic">
                <div>
                    <h2>${data.full_name || data.username}</h2>
                    <p>@${data.username}</p>
                </div>
            </div>
            
            <div class="stats">
                <div class="stat">
                    <div class="stat-value">${formatNumber(data.follower_count)}</div>
                    <div>Followers</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${formatNumber(data.following_count)}</div>
                    <div>Following</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${data.engagement_rate}%</div>
                    <div>Engagement</div>
                </div>
            </div>
            
            ${data.biography ? `
            <div class="section">
                <h3>Bio</h3>
                <p>${data.biography}</p>
            </div>
            ` : ''}
            
            ${data.recent_posts ? `
            <div class="section">
                <h3>Recent Posts</h3>
                <div class="posts-grid">
                    ${data.recent_posts.map(url => `
                        <img src="${url}" class="post-thumb" onclick="window.open('${url}', '_blank')">
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${data.ai_analysis ? `
            <div class="section">
                <h3>AI Analysis</h3>
                <p>${data.ai_analysis}</p>
            </div>
            ` : ''}
            
            ${data.outreach_email ? `
            <div class="section">
                <h3>Generated Email</h3>
                <p>${data.outreach_email.replace(/\n/g, '<br>')}</p>
            </div>
            ` : ''}
            
            <div class="action-buttons">
                <button class="btn-approve" onclick="approveInfluencer('${data.username}')">
                    Approve & Send to Instantly
                </button>
                <button class="btn-reject" onclick="rejectInfluencer('${data.username}')">
                    Reject
                </button>
            </div>
        </div>
    `;
    
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

// Listen for webhook data
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'analysis-complete') {
        displayResults(event.data.data);
    }
});
