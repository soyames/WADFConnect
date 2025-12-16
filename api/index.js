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

  // ONE-TIME ADMIN CREATION (REMOVE AFTER USE!)
  if (url.includes('create-admin')) {
    try {
      const urlObj = new URL(req.url, `http://${req.headers.host}`);
      const secret = urlObj.searchParams.get('secret');
      const EXPECTED_SECRET = process.env.ADMIN_CREATE_SECRET || 'create-admin-2026';
      
      if (secret !== EXPECTED_SECRET) {
        return res.status(403).json({ error: 'Unauthorized - Invalid secret' });
      }

      const ADMIN_EMAIL = 'admin@wadf.org';
      const ADMIN_PASSWORD = 'WADF@Admin2026!';
      const ADMIN_NAME = 'WADF Administrator';

      if (!process.env.DATABASE_URL) {
        return res.status(500).json({ error: 'DATABASE_URL not configured' });
      }

      const sql = neon(process.env.DATABASE_URL);
      
      // Import bcryptjs for password hashing
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      
      // Check if admin exists
      const existingAdmin = await sql`
        SELECT * FROM users WHERE email = ${ADMIN_EMAIL} LIMIT 1
      `;
      
      if (existingAdmin.length > 0) {
        // Update existing admin
        await sql`
          UPDATE users 
          SET password = ${hashedPassword}, role = 'admin'
          WHERE email = ${ADMIN_EMAIL}
        `;
        
        return res.status(200).json({
          success: true,
          message: 'Admin password reset successfully',
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          loginUrl: 'https://wadfc-onnect.vercel.app/login',
          note: 'IMPORTANT: Remove admin creation code from api/index.js after use!'
        });
      } else {
        // Create new admin
        await sql`
          INSERT INTO users (email, name, password, role, firebase_uid, created_at)
          VALUES (${ADMIN_EMAIL}, ${ADMIN_NAME}, ${hashedPassword}, 'admin', NULL, NOW())
        `;
        
        return res.status(200).json({
          success: true,
          message: 'Admin user created successfully!',
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          loginUrl: 'https://wadfc-onnect.vercel.app/login',
          note: 'IMPORTANT: Remove admin creation code from api/index.js after use!'
        });
      }
    } catch (error) {
      console.error('Admin creation error:', error);
      return res.status(500).json({ 
        error: 'Failed to create admin',
        message: error.message 
      });
    }
  }

  return res.status(404).json({ error: 'Not found', url });
}
