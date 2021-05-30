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
			NewWebSocket.data.fd = AcceptNewConnection(ListenSocket);
			epoll_ctl(WebSocketEpoll, EPOLL_CTL_ADD, NewWebSocket.data.fd, &NewWebSocket);
		}

		s32 ConnectionEvents = epoll_wait(WebSocketEpoll, Events, len(Events), 100);
		for (s32 i = 0; i < ConnectionEvents; ++i) {
			int BytesRead = recv(Events[i].data.fd, Buffer, 1024, 0);
			if (BytesRead == -1 || BytesRead == 0) {
				epoll_ctl(WebSocketEpoll, EPOLL_CTL_DEL, Events[i].data.fd, NULL);
				close(Events[i].data.fd);
			} else {
				Buffer[BytesRead] = 0;
				puts((char *)Buffer);
			}
		}
	}
	
	return 0;
}
