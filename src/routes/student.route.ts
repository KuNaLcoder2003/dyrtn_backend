import express from "express"
import { createNewStudent } from "../controllers/auth.controller.js";
import type { Student } from "../utils/types.js";
import { getErrorWrapper, getSuccessWrapper, STATUS_CODES } from "../config.js";
import { prisma } from "../utils/db.js";
import { authMiddleWare } from "../middlewares/authMiddleware.js";
import { getStudentsProfileDetails } from "../controllers/student.controller.js";

const studentRouter = express.Router()

studentRouter.post('/register', async (req: express.Request, res: express.Response) => {
    try {
        const student_details = req.body.student_details as Student
        if (!student_details) {
            const error_object = getErrorWrapper("ERR_010", "Please fill all the fields")
            res.status(STATUS_CODES.BAD_REQUEST).json(error_object)
            return
        }
        let error_obj = {}

        const response = await prisma.$transaction(async (tx) => {
            const { action, message } = await createNewStudent(tx, student_details)
            if (!action) {
                error_obj = getErrorWrapper("ERR_211", message)
            }
            return action

        }, { maxWait: 5000, timeout: 10000 })
        if (!response) {
            res.status(STATUS_CODES.FORBIDDEN).json(error_obj)
            return
        }
        const student = await prisma.student.findFirst({
            where: {
                email: student_details.email
            },
            select: {
                id: true,
                email: true,
                mobile: true,
                name: true,
                created_at: true,
                updated_at: true,
                gender: true,
                batch_id: true,
                subjects: {
                    select: {
                        subject_id: true
                    }
                }
            }
        })
        const success_Object = getSuccessWrapper(JSON.stringify(student))
        res.status(STATUS_CODES.CREATED).json(success_Object)
        return
    } catch (error) {
        const errorObj = getErrorWrapper("ERR_500", "Internal Server error")
        res.status(STATUS_CODES.SERVER_ERROR).json(errorObj)
        return
    }
})


studentRouter.get('/me', authMiddleWare, async (req: any, res: express.Response) => {

    try {
        const email = req.email;
        const { obj, valid } = await getStudentsProfileDetails(email)
        if (!valid) {
            res.status(STATUS_CODES.NOT_FOUND).json(obj)
            return
        }
        res.status(STATUS_CODES.OK).json(obj)
    } catch (error) {
        const errorObject = getErrorWrapper("ERR_500", `Internal Server Error : ${error}`)
        res.status(STATUS_CODES.SERVER_ERROR).json(errorObject)
        return
    }
})


export default studentRouter;