-- CreateTable
CREATE TABLE "public"."Chapter" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "sequence" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subjectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Chapter_subjectId_idx" ON "public"."Chapter"("subjectId");

-- CreateIndex
CREATE INDEX "Chapter_isActive_idx" ON "public"."Chapter"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_subjectId_name_key" ON "public"."Chapter"("subjectId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_subjectId_code_key" ON "public"."Chapter"("subjectId", "code");

-- AddForeignKey
ALTER TABLE "public"."Chapter" ADD CONSTRAINT "Chapter_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
