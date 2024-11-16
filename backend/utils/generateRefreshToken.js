const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");
const generateRefreshToken = async (userId) => {
  const token = jwt.sign({ id: userId }, process.env.SECRET_KEY_REFRESH_TOKEN, {
    expiresIn: "7d",
  });
  const updateRefreshToken = await UserModel.updateOne(
    { _id: userId },
    { refresh_token: token }
  );
  return token;
};

module.exports = generateRefreshToken;
