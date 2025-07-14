// services/authService.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../users/models/user"); 
const {getSequelize} = require('../../shared/config/db');

// Función para generar un token JWT
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
  };

  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: "6h" };

  return jwt.sign(payload, secret, options);
};

// Función para manejar el login
const loginUser = async (email, password) => {
  //const user = await User.findOne({ where: { email } });
  const user = await getSequelize().query("CALL uspget_user_login(:p_email)", {
    replacements: { p_email: email },
    type: getSequelize().QueryTypes.RAW,
  });

  if (user.length < 1 ) {
    throw new Error("El usuario no existe");
  }

  const isMatch = await bcrypt.compare(password, user[0].password);
  if (!isMatch) {
    throw new Error("Contraseña incorrecta");
  }

  const token = generateToken(user[0]);

  const userWithoutPassword = {
    id: user[0].id,
    username: user[0].username,
    email: user[0].email,
    profile: user[0].profile,
    profile_id: user[0].profile_id,
    establishment_id: user[0].establishment_id,
    warehouse_id: user[0].warehouse_id,
  };
 // const userResponse = user[0]
  return { user: userWithoutPassword, token };
};

module.exports = { loginUser };
