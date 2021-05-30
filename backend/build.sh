[ ! -d "bin/" ] && mkdir bin

clang main.c websocket.c -o bin/server.exe
