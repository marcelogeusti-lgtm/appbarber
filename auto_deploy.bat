@echo off
echo Deploying Backend (API)...
cd server
npx vercel deploy --prod --yes
cd ..

echo Deploying APP (Frontend)...
cd client
npx vercel deploy --prod --yes
cd ..

echo Done.
