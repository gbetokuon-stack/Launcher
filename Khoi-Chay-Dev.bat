@echo off
title Minecraft Launcher Dev
cd /d "%~dp0"
call npm.cmd run electron:dev
pause
