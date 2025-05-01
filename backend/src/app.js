import express from 'express';
import connect from './DB/dbconnection.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRoutes from './Routes/userRoutes.js';
import { Server } from 'socket.io';
import http from 'http';
import configureSocket from './config/socket.js';
import aiRoutes from './Routes/aiRoutes.js';
import passwordResetRoutes from './Routes/passwordResetRoutes.js';
import punycode from 'punycode';
import path from 'path';
import { fileURLToPath } from 'url';

// Suppress punycode deprecation warning
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('punycode')) {
    return;
  }
  console.warn(warning);
});

dotenv.config();
connect();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = configureSocket(server);

// Only needed if using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/user', userRoutes);

app.use('/api/auth', passwordResetRoutes);

app.use('/ai',aiRoutes);
//dummy route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Catch-all route to serve index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});


export { app, server };
