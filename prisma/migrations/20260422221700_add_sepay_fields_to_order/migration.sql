-- AlterTable: add SePay payment-tracking columns to Order
ALTER TABLE "Order"
  ADD COLUMN "sepayInvoiceNumber" TEXT,
  ADD COLUMN "sepayStatus" TEXT,
  ADD COLUMN "sepayAmountVnd" DOUBLE PRECISION;

-- CreateIndex: enforce unique invoice numbers so webhook lookup is O(1)
CREATE UNIQUE INDEX "Order_sepayInvoiceNumber_key" ON "Order"("sepayInvoiceNumber");
