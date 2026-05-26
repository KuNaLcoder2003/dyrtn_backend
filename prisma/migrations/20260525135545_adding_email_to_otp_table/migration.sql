/*
  Warnings:

  - You are about to drop the column `student_id` on the `OneTimePass` table. All the data in the column will be lost.
  - Added the required column `student_email` to the `OneTimePass` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OneTimePass" DROP CONSTRAINT "OneTimePass_student_id_fkey";

-- AlterTable
ALTER TABLE "OneTimePass" DROP COLUMN "student_id",
ADD COLUMN     "student_email" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "OneTimePass" ADD CONSTRAINT "OneTimePass_student_email_fkey" FOREIGN KEY ("student_email") REFERENCES "Student"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
