// server/src/routes/sync.ts
import { Router } from 'express';

const router = Router();

// Health check for sync
router.get('/sync/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'TinyBase Sync Server',
    timestamp: new Date().toISOString() 
  });
});

export default router;