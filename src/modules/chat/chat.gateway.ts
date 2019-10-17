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
import { AuthService } from '../auth/auth.service';
import { JwtAuthService } from '../auth/jwt/jwt-auth.service';
import { UsersService } from '../users/users.service';
import { RoomsService } from '../rooms/rooms.service';
import { User } from './../users/interfaces/user.interface';
import { parse as CookieParse } from 'cookie';

import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
// import { WsJwtGuard } from './../../common/guards/sockets.guard';

@WebSocketGateway({ namespace: '/chats', path: '/chats' })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;

  totalUsers: number = 0;
  messages = [];
  rmessname: string = 'ChatRoom';
  welcomeMessages = [
    { user: { name: this.rmessname }, content: 'Welcome to our Room!' },
    { user: { name: this.rmessname }, content: 'Please, be kind and polite!' },
  ];

  constructor(
    // private readonly authService: AuthService,
    private readonly jwtAuthService: JwtAuthService,
    private readonly usersService: UsersService,
    private readonly roomService: RoomsService,
  ) {}

  private logger: Logger = new Logger('ChatGateway');

  afterInit(wss: any) {
    this.logger.log('ChatGateway Initialized!');
  }

  async handleConnection(client: Socket) {
    if (client.handshake.query.token) {
      if (client.handshake.headers.cookie) {
        const cookie: any = CookieParse(client.handshake.headers.cookie);
        if (cookie && cookie.access_token) {
          const decoded: any = await this.handleAuth(cookie);
          this.logger.log('User ID: ' + decoded.id + ' Name: ' + decoded.name + ' connected as ' + client.id);
          client.request.user = { id: decoded.id, name: decoded.name, sockets: { room: client.id } };
          this.logger.log('Request user: ' + JSON.stringify(client.request.user));
        }
      }
    } else {
      client.request.user = { id: 'gest' };
      this.logger.log('Anonimos client connected ' + client.id);
    }

    Object.keys(this.wss.clients().connected).map(id => {
      this.logger.log('Connected users: ' + id);
      // clientObjects[id].disconnect(true);
    });

    this.totalUsers++;
    // Notify connected clients of current users
    this.wss.emit('count', this.totalUsers);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log('client disconnected ' + client.id);
    client.leaveAll();
    // Object.keys(client.rooms).map(room => this.handleRoomLeave(client, room));
    this.totalUsers--;
    // Notify connected clients of current users
    this.wss.emit('count', this.totalUsers);
  }

  @SubscribeMessage('message')
  async onMessage(client: Socket, message: { user: string; room: string; content: string; credentials: object }) {
    const event: string = 'message';
    const authInfo: any = await this.handleAuth(message.credentials);
    let userName = authInfo.name;
    if (authInfo && authInfo.access_token) {
      client.emit('authenticate', authInfo);
      client.request.user = authInfo.user;
      userName = authInfo.user.name;
    }
    // this.logger.log('Auth: ' + JSON.stringify(authInfo) + 'Cookie: ' + JSON.stringify(cookie));
    const mess: object = { user: { name: userName }, content: message.content };
    const room: string = message.room;
    // this.messages.push(room);
    // client.broadcast.to(message.room).emit(event, mess);
    // this.wss.in(message.room).emit(event, mess);
    // this.messages[message.room].push(mess);

    Object.keys(this.wss.clients().connected).map(id => {
      this.logger.log('Connected users: ' + id);
      // clientObjects[id].disconnect(true);
    });

    return Observable.create(observer => observer.next({ event, mess }))
      .pipe(delay(1))
      .subscribe((data: { event: string | symbol; mess: object }) => {
        // this.messages[room].push(data.data);
        this.wss.in(room).emit(data.event, data.mess);
      });
  }

  @SubscribeMessage('join')
  handleRoomJoin(client: Socket, room: string) {
    client.join(room);
    this.logger.log('client ' + client.id + ' joined room ' + room);

    this.wss.in(room).clients((err: any, clients: { length: any }) => {
      this.wss.in(room).emit('room_users', clients.length);
    });
    // Send welcome messages to the connected user
    this.welcomeMessages.map(mess => {
      client.emit('message', mess);
    });
    client.emit('joined', room);
  }

  @SubscribeMessage('leave')
  handleRoomLeave(client: Socket, room: string) {
    client.leave(room);
    this.logger.log('client ' + client.id + ' left room ' + room);

    this.wss.in(room).clients((err: any, clients: { length: any }) => {
      this.wss.in(room).emit('room_users', clients.length);
    });

    client.emit('left', room);
  }

  async handleAuth(data: any) {
    try {
      if (!data.refresh_token) {
        throw new WsException('TOKEN_MISSING');
      }
      const user: User = await this.jwtAuthService.verify(data.access_token, false, true);
      // this.logger.log('User from jwtAuthService: ' + JSON.stringify(user));
      return user;
    } catch (e) {
      try {
        if (!data.refresh_token) {
          throw new WsException('TOKEN_MISSING');
        }
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
