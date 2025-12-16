// Vercel serverless function - proxy to Express server
let app;

export default async function handler(req, res) {
  try {
    // Lazy load the Express app
    if (!app) {
      const module = await import('../dist/index.js');
      app = module.default;
      
      if (!app) {
        throw new Error('Failed to load Express app');
      }
    }

    // Let Express handle the request
    app(req, res);
    
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
