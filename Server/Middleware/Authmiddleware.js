const jwt = require("jsonwebtoken");

// This function runs BEFORE any route it's attached to.
// It checks: "does this request have a valid wristband (JWT)?"
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization; // format: "Bearer <token>"

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, access denied" });
    }

    const token = authHeader.split(" ")[1];

    // Verify the token was signed by us and hasn't expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user id to the request so later code knows "who is this?"
    req.userId = decoded.id;

    next(); // wristband checks out — let them through to the actual route
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = protect;