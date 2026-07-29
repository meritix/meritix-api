-- CreateTable
CREATE TABLE "public"."schools" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "boardId" INTEGER NOT NULL,
    "udiseCode" TEXT,
    "affiliationNo" TEXT,
    "principalName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "pincode" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "establishedYear" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schools_code_key" ON "public"."schools"("code");

-- CreateIndex
CREATE UNIQUE INDEX "schools_udiseCode_key" ON "public"."schools"("udiseCode");

-- CreateIndex
CREATE INDEX "schools_boardId_idx" ON "public"."schools"("boardId");

-- CreateIndex
CREATE INDEX "schools_city_idx" ON "public"."schools"("city");

-- CreateIndex
CREATE INDEX "schools_state_idx" ON "public"."schools"("state");

-- AddForeignKey
ALTER TABLE "public"."schools" ADD CONSTRAINT "schools_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "public"."boards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
