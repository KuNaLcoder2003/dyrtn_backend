import express from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"
import dotenv from "dotenv"
import { getErrorWrapper, STATUS_CODES } from "../config.js"
dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET_KEY as string

export const authMiddleWare = (req: any, res: express.Response, next: express.NextFunction) => {
    const authToken = req.headers.authorization;
    if (!authToken || !authToken.startsWith('Bearer ')) {
        const errorObject = getErrorWrapper("ERR_011", "Unauthorized")
        res.status(STATUS_CODES.UNAUTHORIZED).json(errorObject)
        return
    }
    const token = authToken.split('Bearer ')[1]
    const verfied = jwt.verify(token, JWT_SECRET) as JwtPayload
    if (!verfied) {
        const errorObject = getErrorWrapper("ERR_011", "Unauthorized")
        res.status(STATUS_CODES.UNAUTHORIZED).json(errorObject)
        return
    }
    else {
        req.email = verfied.email
        next()
    }
}