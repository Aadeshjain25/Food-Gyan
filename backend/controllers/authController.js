const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const driver = require('../config/db')
const User = require('../models/User')

const register = async(req, res) => {
    const { username, email, password } = req.body
    const session = driver.session()
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const result = await session.run(
            `CREATE (u:User {username: $username, email: $email, password: $password}) RETURN u`, { username, email, password: hashedPassword }
        )
        const token = jwt.sign({ email }, 'aadeshSecret', { expiresIn: '1h' });

        res.status(201).json({ message: "User registered successfully" })
    } catch (err) {
        console.log('Register error', err)
        res.status(500).json({ error: "Registration failed!" })
    } finally {
        session.close()
    }
}
const login = async(req, res) => {
    const { email, password } = req.body
    const session = driver.session()
    try {
        const result = await session.run(
            "MATCH (u:User {email : $email}) RETURN u ", { email }
        )
        if (result.records.length === 0) {
            return res.status(404).json({ error: "User not found" })
        }
        const user = result.records[0].get("u").properties
        const isMatch = await bcrypt.compareSync(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid Credentials" })
        }
        const token = jwt.sign({ email: user.email }, "aadeshSecret", {
            expiresIn: "1h"
        })
        res.json({ message: "Login successful", token })
    } catch (err) {
        console.log("Login error", err)
        res.status(500).json({ error: "Login failed!" })
    } finally {
        await session.close()
    }
}
module.exports = { register, login }