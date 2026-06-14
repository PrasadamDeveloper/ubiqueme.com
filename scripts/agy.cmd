@echo off
set FILE=%~1
if not "%~2"=="" set FILE=%FILE%:%~2
if not "%~3"=="" set FILE=%FILE%:%~3
agy --goto "%FILE%"