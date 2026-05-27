import express from "express"
import { prisma } from "../utils/db.js"
import { getErrorWrapper, getSuccessWrapper, STATUS_CODES } from "../config.js"

export const createNewSubject = async (req: express.Request, res: express.Response) => {
    try {
        const { batch_id, subject_name } = req.body;
        if (!batch_id) {
            const errorObject = getErrorWrapper("ERR_011", "Please provide Batch to add a subject")
            res.status(STATUS_CODES.BAD_REQUEST).json(errorObject)
            return
        }
        if (!subject_name) {
            const errorObject = getErrorWrapper("ERR_011", "Please provide Subject Name")
            res.status(STATUS_CODES.BAD_REQUEST).json(errorObject)
            return
        }
        const response = await prisma.$transaction(async (tx) => {
            const new_subject = await tx.subjects.create({
                data: {
                    batch_id: batch_id,
                    subject_name: subject_name,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            })
            return { new_subject }
        })
        if (!response.new_subject) {
            const errorOject = getErrorWrapper("ERR_211", "Unable to create subject")
            res.status(STATUS_CODES.FORBIDDEN).json(errorOject)
            return
        }
        const successObject = getSuccessWrapper(JSON.stringify({ subject: response.new_subject }))
        res.status(STATUS_CODES.CREATED).json(successObject)
    } catch (error) {
        const errorObject = getErrorWrapper("ERR_500", "Internal server error")
        res.status(STATUS_CODES.FORBIDDEN).json(errorObject)
        return
    }
}