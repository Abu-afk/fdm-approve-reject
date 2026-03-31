import express from 'express';
import approvalRoutes from './routes/approvalRoutes';

const app = express();
const PORT = 3001;

// Middleware to parse JSON
app.use(express.json());

// Allow requests from the frontend (CORS)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Routes - all manager approval routes go under /api/manager
app.use('/api/manager', approvalRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'FDM Approve/Reject API is running!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});