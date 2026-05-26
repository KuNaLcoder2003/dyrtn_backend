-- CreateTable
CREATE TABLE "OneTimePass" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OneTimePass_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OneTimePass" ADD CONSTRAINT "OneTimePass_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
