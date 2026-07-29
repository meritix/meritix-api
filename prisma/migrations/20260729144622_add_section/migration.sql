-- CreateTable
CREATE TABLE "public"."sections" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sections_classId_idx" ON "public"."sections"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "sections_classId_code_key" ON "public"."sections"("classId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "sections_classId_name_key" ON "public"."sections"("classId", "name");

-- AddForeignKey
ALTER TABLE "public"."sections" ADD CONSTRAINT "sections_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
