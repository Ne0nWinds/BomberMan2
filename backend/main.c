#include <sys/socket.h>
#include <sys/epoll.h>
#include <fcntl.h>
#include <netdb.h>
#include <unistd.h>
#include <stdio.h>
#include "basic_types.h"

#define MAX_PLAYERS_PER_GAME 32

static s32 ListenSocket;
static s32 ListenEpoll;
static s32 WebSocketEpoll;
static u8 Buffer[KB(1)];

static s32 WebSockets[MAX_PLAYERS_PER_GAME];

s32 AcceptNewConnection() {
	struct sockaddr_in AcceptInfo = {0};
	u32 AcceptInfoLength = sizeof(AcceptInfo);
	s32 Connection = accept(ListenSocket, (struct sockaddr *)&AcceptInfo, &AcceptInfoLength);
	// TODO: WebSocket Header Stuff Here
	return Connection;
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
		puts("Awaiting new connection!");
		s32 ListenEventCount = epoll_wait(ListenEpoll, Events, MAX_PLAYERS_PER_GAME, 0);
		for (s32 i = 0; i < ListenEventCount; ++i) {
			static struct epoll_event NewWebSocket = { EPOLLIN, 0 };
			NewWebSocket.data.fd = AcceptNewConnection();
			epoll_ctl(WebSocketEpoll, EPOLL_CTL_ADD, NewWebSocket.data.fd, &NewWebSocket);
		}

		s32 ConnectionEvents = epoll_wait(WebSocketEpoll, Events, MAX_PLAYERS_PER_GAME * 4, 100);
		for (s32 i = 0; i < ConnectionEvents; ++i) {
			int BytesRead = recv(Events[i].data.fd, Buffer, 1024, 0);
			if (BytesRead == -1 || BytesRead == 0) {
				close(Events[i].data.fd);
				epoll_ctl(WebSocketEpoll, EPOLL_CTL_DEL, Events[i].data.fd, NULL);
			} else {
				Buffer[BytesRead] = 0;
				puts((char *)Buffer);
			}
		}
	}
	
	return 0;
}
