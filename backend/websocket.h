#pragma once
#include "basic_types.h"

void ParseDataFrame(u8 *Buffer, u32 Length);
s32 AcceptNewConnection(s32 ListenSocket);
