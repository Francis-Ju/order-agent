import { Router } from 'express';
import { executeAgent } from '../orchestrator/index.js';
export const agentRouter = Router();
agentRouter.post('/trigger', async (req, res) => {
    const { store_id } = req.body;
    if (!store_id) {
        res.status(400).json({ error: 'store_id is required' });
        return;
    }
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
    });
    const send = (event, data) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };
    try {
        await executeAgent(store_id, send);
    }
    catch (err) {
        send('error', { message: err instanceof Error ? err.message : 'Unknown error' });
    }
    finally {
        res.end();
    }
});
