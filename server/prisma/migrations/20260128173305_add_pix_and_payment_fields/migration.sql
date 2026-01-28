-- AlterTable
ALTER TABLE "Barbershop" ADD COLUMN     "pix_key" TEXT,
ADD COLUMN     "pix_type" TEXT,
ADD COLUMN     "psp_account_id" TEXT,
ADD COLUMN     "psp_provider" TEXT;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "appointment_id" TEXT,
ADD COLUMN     "barbershop_id" TEXT,
ADD COLUMN     "pix_copia_cola" TEXT,
ADD COLUMN     "qr_code" TEXT;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_barbershop_id_fkey" FOREIGN KEY ("barbershop_id") REFERENCES "Barbershop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
