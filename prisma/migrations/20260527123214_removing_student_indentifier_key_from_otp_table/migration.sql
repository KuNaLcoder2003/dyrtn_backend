/*
  Warnings:

  - You are about to drop the column `student_email` on the `OneTimePass` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OneTimePass" DROP CONSTRAINT "OneTimePass_student_email_fkey";

-- AlterTable
ALTER TABLE "OneTimePass" DROP COLUMN "student_email";
