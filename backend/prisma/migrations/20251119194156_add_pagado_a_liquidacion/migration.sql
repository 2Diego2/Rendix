-- AlterTable
ALTER TABLE "public"."liquidaciones" ADD COLUMN     "pagado_en" TIMESTAMP(3),
ADD COLUMN     "pagado_por" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."liquidaciones" ADD CONSTRAINT "liquidaciones_pagado_por_fkey" FOREIGN KEY ("pagado_por") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
