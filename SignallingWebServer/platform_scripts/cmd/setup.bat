@Rem Copyright Epic Games, Inc. All Rights Reserved.
@echo off
setlocal enabledelayedexpansion

call :Init
call :ParseArgs %*

IF "%CONTINUE%"=="1" (
	call :Setup
	call :BuildWilbur
)

goto :eof

:Init
:ParseArgs
:Setup
:SetPublicIP
:SetupTurnStun
:PrintConfig
:BuildWilbur
:StartWilbur
%~dp0common.bat %*
