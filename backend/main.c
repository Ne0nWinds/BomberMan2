#include <sys/socket.h>
#include <sys/epoll.h>
#include <fcntl.h>
#include <netdb.h>
#include <unistd.h>
#include <stdio.h>

#include "basic_types.h"
#include "websocket.h"

#define MAX_PLAYERS_PER_GAME 32

static s32 ListenSocket;
static s32 ListenEpoll;
static s32 WebSocketEpoll;
static u8 Buffer[KB(1)];

static s32 WebSockets[MAX_PLAYERS_PER_GAME];

static struct {
	s32 SocketIds[MAX_PLAYERS_PER_GAME];
	v2 Positions[MAX_PLAYERS_PER_GAME];
} Players;

u32 AddPlayer(s32 SocketId) {
	for (u32 i = 0; i < MAX_PLAYERS_PER_GAME; ++i) {
		if (Players.SocketIds[i] == 0) {
			printf("%d\n", SocketId);
			Players.SocketIds[i] = SocketId;
			Players.Positions[i].x = 0;
			Players.Positions[i].y = 0;
			return i;
		}
	}
	return -1;
}
void DeletePlayer(u32 Index) {
	Players.SocketIds[Index] = 0;
}

int main() {
	ListenSocket = socket(AF_INET, SOCK_STREAM, 0);
	ListenEpoll = epoll_create1(0);
	WebSocketEpoll = epoll_create1(0);
	fcntl(ListenSocket, F_SETFL, O_NONBLOCK);

	{
		struct epoll_event ListenEvent = {0};
		ListenEvent.events = EPOLLIN;
		epoll_ctl(ListenEpoll, EPOLL_CTL_ADD, ListenSocket, &ListenEvent);
	}

	struct sockaddr_in BindInfo = {0};
	BindInfo.sin_family = AF_INET;
	BindInfo.sin_addr.s_addr = htonl(INADDR_ANY);
	BindInfo.sin_port = htons(8080);

	s32 BindSuccess = bind(ListenSocket, (struct sockaddr *)&BindInfo, sizeof(BindInfo));

	listen(ListenSocket, MAX_PLAYERS_PER_GAME);

	for (;;) {
		static struct epoll_event Events[MAX_PLAYERS_PER_GAME * 4] = {0};
		s32 ListenEventCount = epoll_wait(ListenEpoll, Events, len(Events) / 4, 0);
		for (s32 i = 0; i < ListenEventCount; ++i) {
			static struct epoll_event NewWebSocket = { EPOLLIN, 0 };
			s32 fd = AcceptNewConnection(ListenSocket);
			NewWebSocket.data.u64 = 0;
			NewWebSocket.data.u64 = (s64)fd << 32;
			NewWebSocket.data.u64 |= AddPlayer(fd);
			epoll_ctl(WebSocketEpoll, EPOLL_CTL_ADD, fd, &NewWebSocket);
		}

		s32 ConnectionEvents = epoll_wait(WebSocketEpoll, Events, len(Events), 100);
		for (s32 i = 0; i < ConnectionEvents; ++i) {
			int fd = Events[i].data.u64 >> 32;
			u32 PlayerIndex = Events[i].data.u64 & 0xFFFFFFFF;
			int BytesRead = recv(fd, Buffer, 131, 0);
			if (BytesRead == -1 || BytesRead == 0) {
				epoll_ctl(WebSocketEpoll, EPOLL_CTL_DEL, fd, NULL);
				DeletePlayer(PlayerIndex);
				close(fd);
				printf("Delete Player: %u\n", PlayerIndex);
			} else {
				u8 PayloadLength = 0;
				u8 OpCode = ParseDataFrame(Buffer, &PayloadLength);
				if (OpCode == 0x2) {
					f32 *data = (f32 *)((u8 *)Buffer + 6);
					Players.Positions[PlayerIndex].x = data[0];
					Players.Positions[PlayerIndex].y = data[1];
				}
			}
		}

		usleep(1000000 / 20);

		Buffer[0] = 128 | 2;
		Buffer[1] = 0;
		for (u32 i = 0; i < 2; ++i) {
			f32 *data = (f32 *)(Buffer + 2);
			if (Players.SocketIds[i] != 0) {
				Buffer[1] += 8;
				data[i * 2] = Players.Positions[i].x;
				data[i * 2 + 1] = Players.Positions[i].y;
			}
		}

		for (u32 i = 0; i < MAX_PLAYERS_PER_GAME; ++i) {
			if (Players.SocketIds[i] != 0) {
				send(Players.SocketIds[i], Buffer, 2 + Buffer[1], 0);
			}
		}

	}

	return 0;
}
