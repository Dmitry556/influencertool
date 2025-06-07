// Store results in memory (resets when server restarts)
const results = new Map();

export default function handler(req, res) {
    if (req.method === 'POST') {
        // Receive data from Clay
        const { analysis_id, ...data } = req.body;
        results.set(analysis_id, data);
        
        // Clean up after 5 minutes
        setTimeout(() => results.delete(analysis_id), 300000);
        
        return res.status(200).json({ received: true });
    }
    
    if (req.method === 'GET') {
        // Frontend polls for results
        const { id } = req.query;
        const data = results.get(id);
        
        if (data) {
            results.delete(id);
            return res.status(200).json(data);
        }
        
        return res.status(202).json({ status: 'pending' });
    }
}
