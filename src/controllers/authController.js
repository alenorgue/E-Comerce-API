import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi'; // Joi se usa para validar los datos recibidos en las peticiones

// authController.js
export const register = async (req, res) => {
  const { name, email, password, role, phoneNumber } = req.body;

  // Definimos el esquema de validación para el registro
  const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]:;"'<>?,./]).{8,}$/)
      .required(),
    role: Joi.string().valid('user', 'admin'),
    phoneNumber: Joi.string().pattern(/^[0-9\-\+\s\(\)]{7,20}$/)
  });

  // Validamos los datos recibidos en la petición
  const { error } = registerSchema.validate(req.body);
  if (error) {
    // Si los datos no cumplen el esquema, devolvemos un error
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne ({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    } else {
      // Create new user
      const newUser = new User({ name, email, password, role, phoneNumber });
      await newUser.save();

      // Generate JWT token
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(201).json({ message: 'User registered successfully', token });
    }
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  // Definimos el esquema de validación para login
  const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  });

  // Validamos los datos recibidos en la petición
  const { error } = loginSchema.validate(req.body);
  if (error) {
    // Si los datos no cumplen el esquema, devolvemos un error
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;

  try {
    // Buscamos el usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email' });
    } else {
      // Comprobamos la contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid password' });
      }

      // Generamos el token JWT con el id del usuario
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Respondemos con el token y datos básicos del usuario
      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const tokenValidation = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to authenticate token' });
    }
    req.userId = decoded.id;
    next();
  });
};
