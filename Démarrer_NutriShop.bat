@echo off
title NutriShop - Lancement

echo.
echo  ============================================
echo            NutriShop - Demarrage
echo  ============================================
echo.
echo  Version avec Parametres, langues et sauvegarde ZIP
 echo  Demarrage du serveur local Windows...
echo  La page va s ouvrir automatiquement.
echo.
echo  Ne fermez pas cette fenetre pendant l utilisation.
echo  Pour arreter : fermez cette fenetre ou Ctrl+C.
echo  --------------------------------------------
echo.

REM PowerShell est inclus dans Windows : aucune installation necessaire
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"

pause
