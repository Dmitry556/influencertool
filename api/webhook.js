export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const data = req.body;

    // Send data to frontend via Server-Sent Events or WebSocket
    // For now, we'll use a simple approach
    
    // Store in a temporary place (in production, use a database)
    // For this simple version, we'll return HTML that posts a message
    
    res.status(200).send(`
        <script>
            window.opener.postMessage({
                type: 'analysis-complete',
                data: ${JSON.stringify(data)}
            }, '*');
            window.close();
        </script>
    `);
}
