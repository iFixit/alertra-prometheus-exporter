import express from 'express';
import { Alertra } from './alertra/alertra.js';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello, Express with TypeScript!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

