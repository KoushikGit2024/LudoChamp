import express from "express";
import jwt from "jsonwebtoken";

export const tokenCheker = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        req.code=401;
        req.msg="Token unavailable"
        return next()
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            req.code=401;
            req.msg="Token is not valid"
            return next();
        } 
        req.code=200;
        req.msg="Token is valid"
        req.user = user;
        return next();
    })
}
