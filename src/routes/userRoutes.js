import express from "express";
import { tokenValidation, register, login, getUserProfile, updateUserProfile, deleteUserProfile } from '../controllers/authController';
import isAdmin from '../middlewares/isAdmin.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Protected route to get user profile
router.get('/profile/:id', tokenValidation, getUserProfile);
router.put('/profile/:id', tokenValidation, updateUserProfile);

//Protected route for admin only
router.delete('/profile/:id', tokenValidation, isAdmin, deleteUserProfile);

export default router;

