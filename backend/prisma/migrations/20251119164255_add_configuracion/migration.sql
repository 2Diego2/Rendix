-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" VARCHAR(50) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vendedoras" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "codigo" VARCHAR(50),
    "sueldo_base" DECIMAL(12,2) NOT NULL,
    "porcentaje_comision" DECIMAL(5,2) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendedoras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."import_batches" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivo_nombre" VARCHAR(255) NOT NULL,
    "filas_totales" INTEGER NOT NULL,
    "filas_importadas" INTEGER NOT NULL,
    "filas_fallidas" INTEGER NOT NULL,
    "estado" VARCHAR(20) NOT NULL,

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ventas" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "hora" TIME,
    "vendedora_id" INTEGER NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "estado" VARCHAR(20) NOT NULL,
    "ticket_num" VARCHAR(50),
    "saldo_pendiente" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "batch_id" INTEGER,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."venta_items" (
    "id" SERIAL NOT NULL,
    "venta_id" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(12,2) NOT NULL,
    "descuento" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "venta_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pagos_venta" (
    "id" SERIAL NOT NULL,
    "venta_id" INTEGER NOT NULL,
    "metodo_pago" VARCHAR(20) NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "referencia" VARCHAR(100),

    CONSTRAINT "pagos_venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gastos" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "categoria" VARCHAR(100) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "comprobante_url" TEXT,
    "periodo" VARCHAR(7) NOT NULL,
    "creado_por" INTEGER NOT NULL,

    CONSTRAINT "gastos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asistencias" (
    "id" SERIAL NOT NULL,
    "vendedora_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "presente" BOOLEAN NOT NULL,
    "motivo" TEXT,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."liquidaciones" (
    "id" SERIAL NOT NULL,
    "vendedora_id" INTEGER NOT NULL,
    "periodo" VARCHAR(7) NOT NULL,
    "sueldo_base" DECIMAL(12,2) NOT NULL,
    "comisiones" DECIMAL(12,2) NOT NULL,
    "presentismo_descuento" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "bonos" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_pagar" DECIMAL(12,2) NOT NULL,
    "estado" VARCHAR(20) NOT NULL,
    "generado_por" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "liquidaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."auditoria" (
    "id" SERIAL NOT NULL,
    "entidad" VARCHAR(100) NOT NULL,
    "entidad_id" INTEGER NOT NULL,
    "accion" VARCHAR(10) NOT NULL,
    "usuario_id" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datos_antes" JSONB,
    "datos_despues" JSONB,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "public"."usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ventas_ticket_num_key" ON "public"."ventas"("ticket_num");

-- CreateIndex
CREATE INDEX "ventas_vendedora_id_idx" ON "public"."ventas"("vendedora_id");

-- CreateIndex
CREATE INDEX "venta_items_venta_id_idx" ON "public"."venta_items"("venta_id");

-- CreateIndex
CREATE INDEX "pagos_venta_venta_id_idx" ON "public"."pagos_venta"("venta_id");

-- CreateIndex
CREATE INDEX "gastos_periodo_idx" ON "public"."gastos"("periodo");

-- CreateIndex
CREATE INDEX "asistencias_fecha_idx" ON "public"."asistencias"("fecha");

-- CreateIndex
CREATE INDEX "liquidaciones_periodo_idx" ON "public"."liquidaciones"("periodo");

-- AddForeignKey
ALTER TABLE "public"."import_batches" ADD CONSTRAINT "import_batches_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ventas" ADD CONSTRAINT "ventas_vendedora_id_fkey" FOREIGN KEY ("vendedora_id") REFERENCES "public"."vendedoras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ventas" ADD CONSTRAINT "ventas_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."import_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."venta_items" ADD CONSTRAINT "venta_items_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "public"."ventas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pagos_venta" ADD CONSTRAINT "pagos_venta_venta_id_fkey" FOREIGN KEY ("venta_id") REFERENCES "public"."ventas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gastos" ADD CONSTRAINT "gastos_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asistencias" ADD CONSTRAINT "asistencias_vendedora_id_fkey" FOREIGN KEY ("vendedora_id") REFERENCES "public"."vendedoras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."liquidaciones" ADD CONSTRAINT "liquidaciones_vendedora_id_fkey" FOREIGN KEY ("vendedora_id") REFERENCES "public"."vendedoras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."liquidaciones" ADD CONSTRAINT "liquidaciones_generado_por_fkey" FOREIGN KEY ("generado_por") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."auditoria" ADD CONSTRAINT "auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
