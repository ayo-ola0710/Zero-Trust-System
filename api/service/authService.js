import bycrypt from "bcrypt";
import { query } from "../config/db.js";
import { generateToken } from "../utils/token.js";



export const registerUser = async (username,role,password) => {
    try {
        const doesExisit = await query("SELECT * FROM users WHERE username = ?", [username]);
        if(doesExisit.rows.length > 0) {
            throw new Error("User already exists");
        }

        const hashedpassword = bycrypt.hashSync(password, 12);

        
        const  newUser = {
            username,
            role,
            status: "active",  
            password: hashedpassword
        }
     
        const result = await query(
            "INSERT INTO users (username, role, status, password) VALUES (?, ?, ?, ?)", 
            [newUser.username, newUser.role, newUser.status, newUser.password]
        );
        
        return { ...newUser, id: result.lastID };
    } catch (error) {
        throw new Error(error.message);
    }

}

export const loginUser = async (username, password) => {
    try {
        const user = await query("SELECT * FROM users WHERE username = ?", [username]);
        if(user.rows.length === 0) {
            throw new Error("User not found");
        }

        const isPasswordValid = bycrypt.compareSync(password, user.rows[0].password);
        if(!isPasswordValid) {
            throw new Error("Invalid password");
        }

       if(user.rows[0].status !== "active") {
        throw new Error("User is not active");
       }

       const token = generateToken({ id: user.rows[0].id, username: user.rows[0].username, role: user.rows[0].role });
        return { ...user.rows[0], token };
    } catch (error) {       
        throw new Error(error.message);
    }     
}