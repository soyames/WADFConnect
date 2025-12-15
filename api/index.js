// Vercel serverless function with Neon PostgreSQL
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';

  // Handle /api/ticket-options
  if (url.includes('ticket-options') || url === '/api' || url === '/') {
    try {
      if (!process.env.DATABASE_URL) {
        return res.status(500).json({ error: 'DATABASE_URL not configured' });
      }

      const sql = neon(process.env.DATABASE_URL);
      
      // Query ticket options from PostgreSQL
      const tickets = await sql`
        SELECT * FROM ticket_options 
        WHERE available = true 
        ORDER BY price ASC
      `;
      
      return res.status(200).json(tickets);
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch tickets',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Health check
  if (url.includes('health')) {
    return res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: process.env.DATABASE_URL ? 'configured' : 'missing'
    });
  }

  return res.status(404).json({ error: 'Not found', url });
}
