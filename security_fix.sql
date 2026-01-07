-- Arquivo para corrigir os avisos de segurança do Supabase
-- AVISO: Isso habilitará o Row Level Security (RLS) em todas as tabelas.
-- Como seu aplicativo usa um backend Node.js (Prisma) que conecta como administrador,
-- isso NÃO quebrará seu site, mas impedirá que hackers acessem seus dados via API pública do Supabase.

-- 1. Habilitar RLS em todas as tabelas (Bloqueia acesso público direto)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Barbershop" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Professional" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Schedule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;

-- Nenhuma política (POLICY) foi criada propositalmente.
-- Isso significa que o acesso via "Anon Key" (cliente público) está totalmente bloqueado.
-- O seu backend continua funcionando pois conecta com privilégios de administrador.
