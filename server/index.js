import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import 'express-async-errors';
import connectDB from './db.js';
import authRoutes    from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes   from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import adminRoutes   from './routes/admin.routes.js';
import { initSocket } from './socket/socket.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
import { fileURLToPath } from 'url';
import { dirname } from 'path';   // add dirname here

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);  // this was missing dirname import

const app        = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

initSocket(io);

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/payment',  paymentRoutes);
app.use('/api/admin',    adminRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.send('QuickKart API running'));
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));