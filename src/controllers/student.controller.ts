import express from "express"
import { prisma } from "../utils/db.js"
import { getErrorWrapper } from "../config.js"

export const getStudentsProfileDetails = async (student_email: string) => {
    const response = await prisma.$transaction(async (tx) => {
        const student = await tx.student.findUnique({
            where: {
                email: student_email
            }
        })
        return student
    }, { maxWait: 5000, timeout: 10000 })
    if (!response) {
        const errorObject = getErrorWrapper("ERR_404", "Unable to find student")
        return {
            obj: errorObject,
            valid: false
        }
    }
    return {
        obj: response,
        valid: true
    }
}