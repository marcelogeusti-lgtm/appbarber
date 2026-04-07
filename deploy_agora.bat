@echo off
echo ==============================================================
echo Sincronizando com o GitHub...
echo ==============================================================
git push origin main

echo.
echo ==============================================================
echo Fazendo deploy do Backend para o Vercel...
echo ==============================================================
call npx vercel deploy --prod --yes --cwd server

echo.
echo ==============================================================
echo Fazendo deploy do Frontend para o Vercel...
echo ==============================================================
call npx vercel deploy --prod --yes --cwd client

echo.
echo ==============================================================
echo Deploy e Sincronizacao concluidos!
echo ==============================================================
pause
