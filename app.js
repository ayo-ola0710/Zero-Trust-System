import express from "express";
import authRouter from "./api/routes/authRoute.js";
const app = express();

app.get('/health', (req, res) => {
    res.send({
     message: "Server is healthy",
    })
})

app.use(express.json());



app.use("/api/auth", authRouter);



export default app;
