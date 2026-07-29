-- CreateTable
CREATE TABLE "public"."classes" (
    "id" SERIAL NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "classes_schoolId_idx" ON "public"."classes"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "classes_schoolId_code_key" ON "public"."classes"("schoolId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "classes_schoolId_name_key" ON "public"."classes"("schoolId", "name");

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
