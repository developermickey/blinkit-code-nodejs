const jwt = require("jsonwebtoken");
// In auth.js (middleware)
const auth = async (req, res, next) => {
  // Your token validation logic
  const token =
    req.cookies.accessToken || req.headers?.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decode = await jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

  if (!decode) {
    return res.status(401).json({
      message: "Unauthorized",
      error: true,
      success: false,
    });
  }

  req.userId = decode.id;
  // If token is valid, call next() to continue to the next middleware or route handler
  next();
};

module.exports = auth; // Make sure to export the function
