const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

// Load environment variables FIRST
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS Middleware - MUST come BEFORE routes
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: "✅ Travel Booking API is running!",
        status: "active",
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/booking', require('./routes/bookingRoutes'));
app.use('/api/destinations', require('./routes/destinationRoutes'));

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        message: `Route ${req.originalUrl} not found` 
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    res.status(err.status || 500).json({ 
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 CORS enabled for frontend\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err.message);
    console.error(err.stack);
});