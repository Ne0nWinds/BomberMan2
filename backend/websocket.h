#pragma once
#include "basic_types.h"

u8 ParseDataFrame(u8 *Buffer, u8 *PayloadLen);
s32 AcceptNewConnection(s32 ListenSocket);
