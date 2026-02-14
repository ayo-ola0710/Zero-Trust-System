import { registerUser, loginUser } from "../service/authService.js";


export const register = async (req, res) => {
    try {
        const { username, role, password } = req.body;
        const newUser = await registerUser(username, role, password);
        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await loginUser(username, password);
        res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}