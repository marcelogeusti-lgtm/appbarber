-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create ENUMS
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'BARBER', 'CLIENT');
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- 2. Create User Table
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE,
    "password" TEXT,
    "phone" TEXT UNIQUE,
    "birthday" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'CLIENT',
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workedBarbershopId" TEXT
);

-- 3. Create Barbershop Table (Must be created before linking User FK fully, but User needs it too)
CREATE TABLE "Barbershop" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT NOT NULL
);

-- 4. Add Constraints (Foreign Keys)
ALTER TABLE "User" ADD CONSTRAINT "User_workedBarbershopId_fkey" FOREIGN KEY ("workedBarbershopId") REFERENCES "Barbershop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Barbershop" ADD CONSTRAINT "Barbershop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 5. Create Professional Table
CREATE TABLE "Professional" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" TEXT UNIQUE NOT NULL,
    "bio" TEXT,
    CONSTRAINT "Professional_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 6. Create Service Table
CREATE TABLE "Service" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "duration" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "barbershopId" TEXT NOT NULL,
    CONSTRAINT "Service_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 7. Create Schedule Table
CREATE TABLE "Schedule" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isOff" BOOLEAN NOT NULL DEFAULT false,
    "professionalId" TEXT NOT NULL,
    CONSTRAINT "Schedule_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 8. Create Appointment Table
CREATE TABLE "Appointment" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "date" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "clientId" TEXT,
    "guestName" TEXT,
    "guestPhone" TEXT,
    "guestBirthday" TIMESTAMP(3),
    "professionalId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Appointment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Appointment_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 9. Create Product Table
CREATE TABLE "Product" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "costPrice" DECIMAL(10,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "barbershopId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
