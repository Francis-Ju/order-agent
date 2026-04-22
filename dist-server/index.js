import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { loadData } from './data/loader.js';
import { storesRouter } from './routes/stores.js';
import { agentRouter } from './routes/agent.js';
import { chatRouter } from './routes/chat.js';
import { skillChatRouter } from './routes/skill-chat.js';
import { agentChatRouter } from './routes/agent-chat.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/stores', storesRouter);
app.use('/api/agent', agentRouter);
app.use('/api/chat', chatRouter);
app.use('/api/skill-chat', skillChatRouter);
app.use('/api/agent-chat', agentChatRouter);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', ts: new Date().toISOString() });
});
// Serve the Vite-built frontend in production
const distPath = IS_PROD
    ? join(__dirname, '..', 'dist')
    : join(__dirname, '..', 'dist');
if (IS_PROD && existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
        res.sendFile(join(distPath, 'index.html'));
    });
}
try {
    loadData();
}
catch (err) {
    console.error('❌ Failed to load data files:', err);
    console.error('DATA_DIR may not contain the required JSON files. Check your build output.');
    process.exit(1);
}
app.listen(PORT, () => {
    console.log(`🚀 Order Agent server running on http://localhost:${PORT}`);
});
