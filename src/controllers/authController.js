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

export const getUserProfile = async (req, res) => {
  try {
    // Buscamos el usuario por ID y populamos las órdenes
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('orders');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserProfile = async (req, res) => {
  const { name, email, phoneNumber } = req.body;

  // Definimos el esquema de validación para actualizar el perfil
  const updateSchema = Joi.object({
    name: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    phoneNumber: Joi.string().pattern(/^[0-9\-\+\s\(\)]{7,20}$/)
  });

  // Validamos los datos recibidos en la petición
  const { error } = updateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  // Verificamos si el usuario es administrador o si está modificando su propio perfil
  const userId = req.userId; // id del usuario autenticado
  const paramId = req.params.id; // id del perfil a modificar
  const user = await User.findById(userId);

  if (userId !== paramId && user.role !== 'admin') {
    return res.status(403).json({ message: 'You can only modify your own profile.' });
  }
  try {
    // Actualizamos el usuario objetivo (puede ser el propio o cualquier si es admin)
    const updatedUser = await User.findByIdAndUpdate(paramId, { name, email, phoneNumber }, { new: true }).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUserProfile = async (req, res) => {
  const userId = req.userId; // id del usuario autenticado
  const paramId = req.params.id; // id del perfil a modificar

  // Busca el usuario autenticado en la base de datos
  const user = await User.findById(userId);

  if (userId !== paramId && user.role !== 'admin') {
    return res.status(403).json({ message: 'You can only modify your own profile.' });
  }
  try {
    // Buscamos y eliminamos el usuario objetivo (puede ser el propio o cualquier si es admin)
    const deletedUser = await User.findByIdAndDelete(paramId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};