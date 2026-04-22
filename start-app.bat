@echo off
setlocal

:menu
cls
echo ==========================================
echo        Wolf Barbershop - Inicio rapido
echo ==========================================
echo.
echo  1. Iniciar Expo
echo  2. Abrir Web
echo  3. Abrir Android
echo  4. Abrir iOS
echo  5. Salir
echo.
set /p choice=Elige una opcion ^(1-5^): 

if "%choice%"=="1" goto expo
if "%choice%"=="2" goto web
if "%choice%"=="3" goto android
if "%choice%"=="4" goto ios
if "%choice%"=="5" goto end

echo.
echo Opcion no valida. Pulsa una tecla para continuar.
pause >nul
goto menu

:expo
call npm start
goto end

:web
call npm run web
goto end

:android
call npm run android
goto end

:ios
call npm run ios
goto end

:end
endlocal
