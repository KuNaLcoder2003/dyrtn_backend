/*
  Warnings:

  - You are about to drop the column `subject_id` on the `Student` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_subject_id_fkey";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "subject_id";

-- CreateTable
CREATE TABLE "StudentSubjects" (
    "student_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,

    CONSTRAINT "StudentSubjects_pkey" PRIMARY KEY ("student_id","subject_id")
);

-- AddForeignKey
ALTER TABLE "StudentSubjects" ADD CONSTRAINT "StudentSubjects_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubjects" ADD CONSTRAINT "StudentSubjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
