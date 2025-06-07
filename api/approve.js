export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Forward to Clay approval webhook
        const response = await fetch('https://api.clay.com/v3/sources/webhook/pull-in-data-from-a-webhook-055a9ff4-1188-427e-a549-4412c7728613', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send approval' });
    }
}
