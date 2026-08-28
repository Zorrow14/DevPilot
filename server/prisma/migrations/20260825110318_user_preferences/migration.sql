-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferredStack" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "targetRole" TEXT;
