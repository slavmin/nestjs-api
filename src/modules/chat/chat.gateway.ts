import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtAuthService } from '../auth/jwt/jwt-auth.service';
// import { UsersService } from '../users/users.service';
// import { RoomsService } from '../rooms/rooms.service';
import { User } from './../users/interfaces/user.interface';
import { parse as CookieParse } from 'cookie';

import { Observable } from 'rxjs';
// import { WsJwtGuard } from './../../common/guards/sockets.guard';

@WebSocketGateway({ namespace: '/chats' })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;

  totalUsers: number = 0;
  connectedUsers = {};
  messages = [];
  rmessname: string = 'ChatRoom';
  welcomeMessages = [
    { user: { name: this.rmessname }, content: 'Welcome to our Room!' },
    { user: { name: this.rmessname }, content: 'Please, be kind and polite!' },
  ];

  constructor(private readonly jwtAuthService: JwtAuthService) {}

  private logger: Logger = new Logger('ChatGateway');

  afterInit(wss: any) {
    this.logger.log('ChatGateway Initialized!');
  }

  async handleConnection(client: Socket) {
    const cookie: any = client.handshake.headers.cookie ? CookieParse(client.handshake.headers.cookie) : null;

    if (cookie && cookie.access_token) {
      const decoded: any = await this.handleAuth(cookie);
      client.request.user = { id: decoded.id, name: decoded.name, socket: client.id };
    } else {
      client.request.user = { id: client.id, name: 'guest', socket: client.id };
    }

    this.totalUsers++;
    this.connectedUsers[client.request.user.name] = client.id;
    this.logger.log('Users total: ' + JSON.stringify(this.connectedUsers));
    // Notify connected clients of current users
    this.wss.emit('count', this.totalUsers);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log('client disconnected ' + client.id);
    this.totalUsers--;
    // Notify connected clients of current users
    this.wss.emit('count', this.totalUsers);
  }

  @SubscribeMessage('message')
  async onMessage(client: Socket, message: { user: string; room: string; content: string; credentials: object }) {
    const event: string = 'message';
    const authInfo: any = await this.handleAuth(message.credentials);
    // this.logger.log('User: ' + JSON.stringify(client.request.user));
    const userName = client.request.user.name;
    if (authInfo && authInfo.access_token) {
      client.emit('authenticate', authInfo);
      client.request.user = authInfo.user;
    }

    const mess: object = { user: { name: userName }, content: message.content };
    const room: string = message.room.toString();
    // client.broadcast.to(message.room).emit(event, mess);
    // this.wss.in(message.room).emit(event, mess);
    const messObj = { room, message: mess };
    this.messages.push(messObj);

    // Object.keys(this.wss.clients().connected).map(id => {
    //   this.logger.log('Connected users: ' + id);
    //   // clientObjects[id].disconnect(true);
    // });

    this.logger.log('Messages total: ' + JSON.stringify(this.messages));

    return Observable.create(observer => observer.next({ event, mess })).subscribe(
      (data: { event: string | symbol; mess: object }) => {
        this.wss.in(room).emit(data.event, data.mess);
      },
    );
  }

  @SubscribeMessage('join')
  handleRoomJoin(client: Socket, room: string) {
    client.join(room);

    this.wss.in(room).clients((err: any, clients: { length: any }) => {
      this.logger.log('Users in room: ' + JSON.stringify(clients));
      this.wss.in(room).emit('room_users', clients.length);
    });
    // Send welcome messages to the connected user
    this.welcomeMessages.map(mess => client.emit('message', mess));
    client.emit('joined', room);
  }

  @SubscribeMessage('leave')
  handleRoomLeave(client: Socket, room: string) {
    client.leave(room);

    this.wss.in(room).clients((err: any, clients: { length: any }) => {
      this.wss.in(room).emit('room_users', clients.length);
    });

    client.emit('left', room);
  }

  async handleAuth(data: any) {
    try {
      const user: User = await this.jwtAuthService.verify(data.access_token, false, true);
      // this.logger.log('User from jwtAuthService: ' + JSON.stringify(user));
      return user;
    } catch (e) {
      try {
        const auth: any = await this.jwtAuthService.verify(data.refresh_token, true, true);
        // this.logger.log('Data from refresh: ' + JSON.stringify(auth));
        return auth;
      } catch (err) {
        this.logger.error('Error: ' + JSON.stringify(err));
        if (err.name === 'TokenExpiredError') {
          throw new WsException('TOKEN_EXPIRED');
        }
        if (err.response === 'TOKEN_NOT_EXPIRED') {
          throw new WsException('TOKEN_NOT_EXPIRED');
        }
        throw new WsException('TOKEN_NOT_VALID_GATEWAY');
      }
    }
  }
}
