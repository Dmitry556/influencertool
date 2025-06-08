// Store results in memory (resets when server restarts)
const results = new Map();

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        // Receive data from Clay
        const { analysis_id, ...data } = req.body;
        
        console.log(`Storing result for ID: ${analysis_id}`);
        console.log(`Data received:`, JSON.stringify(data).substring(0, 200) + '...');
        
        // Store the result with the analysis_id as key
        results.set(analysis_id, data);
        
        // Clean up after 5 minutes
        setTimeout(() => {
            results.delete(analysis_id);
            console.log(`Cleaned up ID: ${analysis_id}`);
        }, 300000);
        
        return res.status(200).json({ received: true, id: analysis_id });
    }
    
    if (req.method === 'GET') {
        // Frontend polls for results
        const { id } = req.query;
        console.log(`Polling for ID: ${id}`);
        console.log(`Currently stored IDs: ${Array.from(results.keys()).join(', ')}`);
        
        const data = results.get(id);
        
        if (data) {
            console.log(`Found data for ID: ${id}, username: ${data.username}`);
            results.delete(id); // Remove after retrieving
            return res.status(200).json(data);
        }
        
        console.log(`No data yet for ID: ${id}`);
        return res.status(202).json({ status: 'pending' });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}
