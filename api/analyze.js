export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Forward request to Clay
        const response = await fetch('https://api.clay.com/v3/sources/webhook/pull-in-data-from-a-webhook-79994b2d-1b6d-48f3-961c-cd1666cdd6db', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.text();
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send to Clay' });
    }
}
