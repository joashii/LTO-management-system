// server.js
/*


*/


import "dotenv/config";
import express from 'express';
import cors from 'cors';
import route from './router.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173' // allow requests from the frontend (5173 vite default port)
}));
app.use(express.json());
app.use(route)

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});