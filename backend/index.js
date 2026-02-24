require('dotenv').config();

process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

const express = require('express');
const cors = require('cors');

const resourceRoutes = require('./routes/resources');
const videoRoutes = require('./routes/videos');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use((req, res, next) => {
    console.log(`>>> ${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
});

app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'FTS Backend API' });
});

app.get('/api/health', async (req, res) => {
    try {
        const supabase = require('./lib/supabase');
        const { data, error } = await supabase.from('resources').select('id').limit(1);
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: !error,
            db_detail: error ? error.message : 'Connection successful'
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Routes
app.use('/api/resources', resourceRoutes);
app.use('/api/videos', videoRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error at:', req.path, err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        path: req.path
    });
});

// Start server (local dev only — Vercel uses the exported app)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
