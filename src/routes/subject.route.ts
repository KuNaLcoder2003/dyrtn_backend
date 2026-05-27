import express from "express"
import { createNewSubject } from "../controllers/subject.controller.js";
const subjectRouter = express.Router()

subjectRouter.post('/newSubject', createNewSubject)


export default subjectRouter;