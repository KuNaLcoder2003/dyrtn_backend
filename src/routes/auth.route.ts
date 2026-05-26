import express from "express"
import { requestOTP, validateOtp } from "../controllers/auth.controller.js";

const authRouter = express.Router()

authRouter.post('/otp/request', requestOTP)
authRouter.post('/otp/verify', validateOtp)
export default authRouter;