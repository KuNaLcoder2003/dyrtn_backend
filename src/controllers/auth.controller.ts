import express from "express"
import { generateToken, mailOTP } from "../utils/otp.js"
import { getErrorWrapper, getSuccessWrapper, STATUS_CODES } from "../config.js"
import crypto from "crypto"
import { prisma } from "../utils/db.js"
import type { Student, DBClient } from "../utils/types.js"

const generateOTP = async (tx: DBClient, email: string) => {
    const otp = crypto.randomInt(100000, 999999).toString();
    const response = await tx.oneTimePass.create({
        data: {
            otp: otp,
            student_email: email,
            created_at: new Date(),
            updated_at: new Date(),
            status: "VALID"
        }
    })
    if (!response) {
        return false
    }
    return { otp, id: response.id };
}

export const createNewStudent = async (tx: DBClient, student_details: Student) => {
    try {
        if (!student_details.subject_one_id) {
            return {
                action: false,
                message: "Please select atleast one subject"
            }
        }
        const otp_count = await tx.oneTimePass.count({
            where: {
                AND: [
                    {
                        student_email: student_details.email
                    },
                    {
                        status: "VALID"
                    }
                ]
            }
        })
        if (otp_count > 0) {
            return {
                action: false,
                message: "OTP Verification pending"
            }
        }
        const student = await tx.student.create({
            data: {
                ...student_details,
                created_at: new Date(),
                updated_at: new Date(),
                payment: "UNPAID",
                account_verified: true
            }
        })
        if (!student) {
            return {
                action: false,
                message: "Unable to create account"
            }
        }

        const student_subjects = await tx.studentSubjects.create({
            data: {
                student_id: student.id,
                subject_id: student_details.subject_one_id
            }
        })
        if (!student_subjects) {
            return {
                action: false,
                message: "Unable to create account"
            }
        }
        return {
            action: true,
            message: "Account created successfully , procced to OTP verification"
        }

    } catch (error) {
        return {
            action: false,
            message: "Something went wrong"
        }
    }
}

const validateUser = async (tx: DBClient, email: string) => {
    try {
        const student = await tx.student.findFirst({
            where: {
                email: email
            }
        })
        if (!student) {
            return {
                _action: false,
                _message: "Student account not found"
            }
        }
        return {
            _action: true,
            _message: "Found"
        }
    } catch (error) {
        return {
            _action: false,
            _message: "Something went wrong"
        }
    }
}

export const requestOTP = async (req: express.Request, res: express.Response) => {
    try {
        const { email, flow } = req.body
        if (!email) {
            const error_object = getErrorWrapper("ERR_010", "Email Missing, Please provide email")
            res.status(STATUS_CODES.BAD_REQUEST).json(error_object)
            return
        }
        if (!flow) {
            const error_object = getErrorWrapper("ERR_011", "Flow Missing")
            res.status(STATUS_CODES.BAD_REQUEST).json(error_object)
            return
        }

        const response = await prisma.$transaction(async (tx) => {
            let flag: boolean = false
            switch (flow) {
                case "signup":
                    flag = true;
                    break;
                case "signin":
                    // validate user
                    const { _action, _message } = await validateUser(tx, email)
                    if (!_action) {
                        throw new Error(_message)
                    }
                    flag = true
                    break;
                default:
                    throw new Error("Invalid flow")
            }
            return flag
        }, { maxWait: 5000, timeout: 10000 })
        if (!response) {
            const errorObj = getErrorWrapper("ERR_012", "Authentication Error")
            res.status(STATUS_CODES.UNAUTHORIZED).json(errorObj)
        }
        const otp = await generateOTP(prisma, email)
        if (!otp) {
            const errorObj = getErrorWrapper("ERR_002", "Error generating otp")
            res.status(STATUS_CODES.UNAUTHORIZED).json(errorObj)
            return
        }

        const sent = await mailOTP(email, otp.otp)
        if (!sent) {
            const errorObj = getErrorWrapper("ERR_003", "OTP not sent on mail")
            res.status(STATUS_CODES.UNAUTHORIZED).json(errorObj)
            return
        }
        let success_object = getSuccessWrapper(JSON.stringify({ otpId: otp.id, flow: flow }))
        res.status(STATUS_CODES.CREATED).json(success_object)
    } catch (error) {
        const errorObj = getErrorWrapper("ERR_500", "Internal Server error")
        res.status(STATUS_CODES.SERVER_ERROR).json(errorObj)
        return
    }
}

export const validateOtp = async (req: express.Request, res: express.Response) => {
    try {
        const { otpID, otp, email, flow } = req.body
        if (!otpID || !otp) {
            const errorObject = getErrorWrapper("ERR_010", "Invalid attempt")
            res.status(STATUS_CODES.BAD_REQUEST).json(errorObject)
            return
        }
        // validate otp

        const response = await prisma.$transaction(async (tx) => {
            let flag: boolean = false
            const storedOtp = await tx.oneTimePass.findFirst({
                where: {
                    AND: [{ student_email: email }, { status: "VALID" }]
                }
            })
            if (!storedOtp) {
                flag = false
                throw new Error("Auth Error")
            }
            if (storedOtp !== otp) {
                flag = false
                throw new Error("Invalid OTP")
            }
            flag = true
            await tx.oneTimePass.update({
                where: {
                    id: storedOtp.id
                },
                data: {
                    status: "EXPIRED"
                }
            })
            return flag
        })

        if (!response) {
            const errorObject = getErrorWrapper("ERR_014", "Error authenticating")
            res.status(STATUS_CODES.UNAUTHORIZED).json(errorObject)
            return
        }
        const token = generateToken(email)
        const isNewUser = flow == "signup"
        const successObject = getSuccessWrapper(JSON.stringify({ token: token, isNewUser }))
        res.status(STATUS_CODES.CREATED).json(successObject)
    } catch (error) {
        const errorObj = getErrorWrapper("ERR_500", "Internal Server error")
        res.status(STATUS_CODES.SERVER_ERROR).json(errorObj)
        return
    }
}
