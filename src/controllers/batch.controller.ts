


import express from "express"
import { getErrorWrapper, getSuccessWrapper, STATUS_CODES } from "../config.js"
import { prisma } from "../utils/db.js"


export const createNewBatch = async (req: express.Request, res: express.Response) => {
    try {
        const { batch_name } = req.body
        if (!batch_name) {
            const errorObject = getErrorWrapper("ERR_011", "Please provide Batch Name")
            res.status(STATUS_CODES.BAD_REQUEST).json(errorObject)
            return
        }
        const response = await prisma.$transaction(async (tx) => {
            const new_batch = await tx.batch.create({
                data: {
                    batch_name: batch_name,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            })
            return { new_batch }
        }, { maxWait: 5000, timeout: 10000 })

        if (!response.new_batch) {
            const errorObject = getErrorWrapper("ERR_211", "Unable to add new batch")
            res.status(STATUS_CODES.FORBIDDEN).json(errorObject)
            return
        }
        const successObject = getSuccessWrapper(JSON.stringify({
            batch_details: response.new_batch
        }))
        res.status(STATUS_CODES.CREATED).json(successObject)
    } catch (error) {
        const errorObject = getErrorWrapper("ERR_500", "Internal server error")
        res.status(STATUS_CODES.FORBIDDEN).json(errorObject)
        return
    }
}