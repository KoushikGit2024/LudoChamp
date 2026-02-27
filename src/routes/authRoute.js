import express from "express";
import { tokenCheker } from "../handlers/tokenCheker.js";

const authRoute = express.Router();

authRoute.post("/register", (req, res) => {
    res.send("Register");
});

authRoute.post("/login",tokenCheker, (req, res) => {
    res.send("Login");
});

export default authRoute;