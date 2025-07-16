// src/config/db.js
import mongoose from 'mongoose';

export default async function connectDB() {
  try {
    console.log('Intentando conectar a MongoDB...');
    const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DATABASE
    });
    console.log('Conexión a MongoDB establecida');
  } catch (error) {
    console.error('Error de conexión a MongoDB:', error);
    console.error('Variables de entorno:', {
      user: process.env.MONGODB_USER ? 'definido' : 'indefinido',
      password: process.env.MONGODB_PASSWORD ? 'definido' : 'indefinido',
      cluster: process.env.MONGODB_CLUSTER ? 'definido' : 'indefinido',
      database: process.env.MONGODB_DATABASE ? 'definido' : 'indefinido'
    });
  }
}
