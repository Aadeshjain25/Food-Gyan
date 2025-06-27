const jwt = require('jsonwebtoken')

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Missing Invalid Token" })
    }
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" })
    try {
        const decoded = jwt.verify(token, "aadeshSecret")
        req.user = decoded
        next()
    } catch (err) {
        res.status(401).json({ error: "Invalid token" })
    }
}
module.exports = authenticate;