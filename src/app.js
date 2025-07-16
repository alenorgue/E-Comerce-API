// Entry point for the Express app
import express from 'express';
import path from 'path';
import hbs from 'hbs';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from '../config/db.js';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// HBS setup
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../public/views'));
hbs.registerPartials(path.join(__dirname, '../public/partials'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// ...routes will be added here

// Connect to MongoDB
connectDB();

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
