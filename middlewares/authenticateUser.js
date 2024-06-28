const jwt = require("jsonwebtoken");
require("dotenv").config();
const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // Replace 'your_jwt_secret' with your actual secret
    req.user = { id: decoded._id, username: decoded.username };
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = authenticateUser;
