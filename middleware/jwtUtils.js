const jwt = require("jsonwebtoken");


// token generate for the reservation comfirmation
const generateTokenReservation = (reservation)=>{
    const secretKey = process.env.JWT_SECRET;
    const payload = {
      iss: "hamda",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 * 2, // 2 hours
      resid: reservation._id,
    };
    return jwt.sign(payload, secretKey);
};

const checkToken = (token)=>{
  const secretKey = process.env.JWT_SECRET;
  let result = {
    valid: true,
    message: null,
    payload: null,
  };

  try {
    const decoded = jwt.verify(token, secretKey);
    result.payload = decoded;
  } catch (err) {
    result.valid = false;
    result.message = err.message;
  }

  return result;
};

module.exports = {generateTokenReservation, checkToken}