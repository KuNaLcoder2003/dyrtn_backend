import { Prisma, PrismaClient } from '@prisma/client';

export type Student = {
    id?: string
    name: string
    age: string
    mobile: string
    email: string
    password?: string
    gender: string
    batch_id: string,
    subject_one_id?: string,
    subject_two_id?: string
}

export type DBClient = Prisma.TransactionClient | PrismaClient