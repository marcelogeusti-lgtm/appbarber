@echo off
echo =======================================
echo    🚀 DEPLOY DE RESTAURACAO (ESTAVEL)
echo    Sincronizando estado limpo na nuvem...
echo =======================================

echo.
echo [1/2] Sincronizando API (Backend)...
cd server
npx vercel deploy --prod --yes
cd ..

echo.
echo [2/2] Sincronizando APP (Frontend)...
cd client
npx vercel deploy --prod --yes
cd ..

echo.
echo ✅ DEPLOY DE RESTAURACAO CONCLUIDO!
echo O site www.corteconexao.com.br agora esta estavel.
pause
