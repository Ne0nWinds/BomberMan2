#pragma once
#include "basic_types.h"

u8 ParseDataFrame(u8 *Buffer, u8 *PayloadLen);
s32 AcceptNewConnection(s32 ListenSocket);

enum {
	OP_TEXT = 0x1,
	OP_BIN = 0x2,
	OP_CLOSE = 0x8,
	OP_PING = 0x9,
	OP_PONG = 0xA
} typedef WebSocketOpCode;
