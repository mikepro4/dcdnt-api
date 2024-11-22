const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        // Retrieve the token from the Authorization header
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user information from the token to the request
        req.user = decoded;

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({ error: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;
