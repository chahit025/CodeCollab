import dotenv from 'dotenv';
dotenv.config();
import { server } from './app.js';

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});