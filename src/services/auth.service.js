import UserRepository from '../repository/user.repository.js';
import { validPassword } from '../utils/hashPassword.js';
import jwt from 'jsonwebtoken';
import  config  from '../config/config.js';
import UserService from './user.service.js';

class AuthService {
  async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const isValid = await validPassword(password, user.password);
    if (!isValid) {
      throw new Error('Contraseña incorrecta');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      config.JWT_SECRET, 
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    };
  }

  async registerUser(userData) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await UserRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('El correo electrónico ya está registrado');
      }
      
      return await UserService.createUser(userData);
    } catch (error) {
      throw new Error(`Error al registrar usuario: ${error.message}`);
    }
  }
}

export default new AuthService();