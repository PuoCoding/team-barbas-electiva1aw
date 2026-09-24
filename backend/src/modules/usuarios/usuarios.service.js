const Usuario = require('./usuarios.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/env');

class UsuariosService {
  static async register(data) {
    const existingUser = await Usuario.findOne({ email: data.email });
    if (existingUser) {
      throw new Error('Email is already registered');
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    
    const newUser = new Usuario({
      ...data,
      password: hashedPassword
    });
    
    await newUser.save();
    
    // Omit password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;
    
    return userResponse;
  }

  static async login(email, password) {
    const user = await Usuario.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    
    const token = jwt.sign(
      { id: user._id, rol: user.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return { user: userResponse, token };
  }
  
  static async getUserById(id) {
    return Usuario.findById(id).select('-password');
  }
}

module.exports = UsuariosService;
