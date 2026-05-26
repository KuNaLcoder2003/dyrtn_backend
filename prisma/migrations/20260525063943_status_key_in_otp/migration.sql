/*
  Warnings:

  - Added the required column `status` to the `OneTimePass` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OTP_STATUS" AS ENUM ('EXPIRED', 'VALID');

-- AlterTable
ALTER TABLE "OneTimePass" ADD COLUMN     "status" "OTP_STATUS" NOT NULL;
