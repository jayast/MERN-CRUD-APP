const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");

const app = express();
const port = 8000;

// Enable JSON parser
app.use(express.json());

// Allow all origins locally to stop CORS preflight failures
app.use(cors());

// MongoDB connection
mongoose
    .connect("mongodb://127.0.0.1:27017/usercrud")
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch((err) => console.error("MongoDB Connection Error:", err.message));

// Routes
app.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch users: " + err.message });
    }
});

app.post("/users", async (req, res) => {
    const { name, age, city } = req.body;
    if (!name || !age || !city) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const newUser = new User({
            name: String(name).trim(),
            age: Number(age),
            city: String(city).trim(),
        });
        await newUser.save();
        res.status(201).json({ message: "User Details Added Successfully", user: newUser });
    } catch (err) {
        res.status(500).json({ message: "Database Error: " + err.message });
    }
});

app.patch("/users/:id", async (req, res) => {
    const { name, age, city } = req.body;
    if (!name || !age || !city) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: String(name).trim(),
                age: Number(age),
                city: String(city).trim(),
            },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User Updated Successfully", user: updatedUser });
    } catch (err) {
        res.status(500).json({ message: "Error updating user: " + err.message });
    }
});

app.delete("/users/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Error deleting user: " + err.message });
    }
});

// Bind to 0.0.0.0 to accept both localhost and 127.0.0.1
app.listen(port, "0.0.0.0", () => {
    console.log(`Backend server running on http://127.0.0.1:${port}`);
});