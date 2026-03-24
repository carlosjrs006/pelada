@echo off
setlocal

set JAVA_PATH=C:\Program Files (x86)\Java\zulu17.46.19-ca-jdk17.0.9-win_x64\bin\java.exe
set JAR=C:\Users\carlos\Documents\pelada-sabado-api\target\pelada-sabado-api-0.0.1-SNAPSHOT.jar
set WORKDIR=C:\Users\carlos\Documents\pelada-sabado-api

echo Iniciando Pelada Sabado API (porta 8080)...
start "Pelada API" "%JAVA_PATH%" -jar "%JAR%"

echo API iniciada! Aguarde alguns segundos e acesse http://localhost:8080/api/jogadores
