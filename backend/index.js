// backend/index.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const driver = require("./config/db");
const authRoutes = require('./routes/authRoutes')
const recipeRoutes = require('./routes/recipeRoutes');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes)
app.use('/api', recipeRoutes)

// Test route to check DB connection
app.get("/test-db", async(req, res) => {
    const session = driver.session();
    try {
        const result = await session.run(
            "CREATE (u:User {name: $name}) RETURN u", { name: "Aadesh" }
        );
        const user = result.records[0].get("u").properties;
        res.json({ message: "User created", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    } finally {
        await session.close();
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});