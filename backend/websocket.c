#include "basic_types.h"
#include "sha1.c"
#include <netdb.h>
#include <sys/socket.h>

void ParseDataFrame(u8 *Buffer, u32 Length) {
	bool FIN = (Buffer[0] & 128) != 0;
	bool RSV2 = (Buffer[0] & 64) != 0;
	bool RSV3 = (Buffer[0] & 32) != 0;
	bool RSV4 = (Buffer[0] & 16) != 0;
	bool OpCode = Buffer[0] & 15;

	u8 MASKEnabled = (Buffer[1] & 128) != 0;
	u8 PayloadLen = Buffer[1] & 127;

	u8 *MaskKey = Buffer + 2;

	for (u32 i = 6; i < Length; i += 4) {
		for (u32 j = 0; j < 4; ++j) {
			Buffer[i + j] = Buffer[i + j] ^ MaskKey[j];
		}
	}

	Buffer[Length] = 0;
}

static const char b64chars[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
static void b64_encode(const unsigned char *in, char *out) {
	size_t elen = 28;
	size_t len = 20;
	size_t  i;
	size_t  j;
	size_t  v;

	for (i=0, j=0; i<len; i+=3, j+=4) {
		v = in[i];
		v = i+1 < len ? v << 8 | in[i+1] : v << 8;
		v = i+2 < len ? v << 8 | in[i+2] : v << 8;

		out[j]   = b64chars[(v >> 18) & 0x3F];
		out[j+1] = b64chars[(v >> 12) & 0x3F];
		if (i+1 < len) {
			out[j+2] = b64chars[(v >> 6) & 0x3F];
		} else {
			out[j+2] = '=';
		}
		if (i+2 < len) {
			out[j+3] = b64chars[v & 0x3F];
		} else {
			out[j+3] = '=';
		}
	}
}

static u8 Buffer[KB(1)] = {0};

s32 AcceptNewConnection(s32 ListenSocket) {
	struct sockaddr_in AcceptInfo = {0};
	u32 AcceptInfoLength = sizeof(AcceptInfo);
	s32 Connection = accept(ListenSocket, (struct sockaddr *)&AcceptInfo, &AcceptInfoLength);

	recv(Connection, Buffer, 1023, 0);

	static char RequestHeader[] = "Sec-WebSocket-Key: ";
	bool FoundHeader = false;
	u32 i = 0;
	for (; i < len(Buffer); ++i) {

		int j = 0;
		for (; j < len(RequestHeader) - 1 && i < len(Buffer); ++j, ++i) {
			if (RequestHeader[j] != Buffer[i]) break;
		}

		if (j == len(RequestHeader) - 1) break;

		for (; i < len(Buffer) && Buffer[i] != '\n'; ++i);
	}
	static char DefaultResponseKey[] =  "000000000000000000000000258EAFA5-E914-47DA-95CA-C5AB0DC85B11";


	char *RequestHeaderValue = (char *)(Buffer + i);
	for (u32 i = 0; i < 24; ++i) {
		DefaultResponseKey[i] = RequestHeaderValue[i];
	}

	static char ResponseHeader[] =
		"HTTP/1.1 101 Switch Protocols\r\n"
		"Upgrade: websocket\r\n"
		"Connection: Upgrade\r\n"
		"Sec-WebSocket-Accept: 0000000000000000000000000000\r\n"
		"Sec-WebSocket-Version: 13\r\n\r\n"
	;

	char SHA1Hash[20] = {0};
	SHA1(SHA1Hash, DefaultResponseKey, len(DefaultResponseKey) - 1);

	b64_encode((u8 *)SHA1Hash, ResponseHeader + 94);

	send(Connection, ResponseHeader, sizeof(ResponseHeader) - 1, 0);

	return Connection;
}
