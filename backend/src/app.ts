import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupSocket } from './socket/SocketManager.js';
import { adminRoutes } from './routes/admin.routes.js';
import { teamRoutes } from './routes/team.routes.js'; 
import { AuthController } from './controllers/auth.controller.js';


dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// ROUTES
const authController = new AuthController();
app.post('/api/auth/login', authController.login);
app.post('/api/auth/seed', authController.seedUsers); // Run once

app.use('/api/admin', adminRoutes);
app.use('/api', teamRoutes);

app.get('/health', (req, res) => {
  res.send('IPL Auction Backend is Healthy');
});

// Socket Setup
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

setupSocket(io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`
   Server ready at: http://localhost:${PORT}
   Health Check: http://localhost:${PORT}/health
   Teams API: http://localhost:${PORT}/api/teams
  `);
});