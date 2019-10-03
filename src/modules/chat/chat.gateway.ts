import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { verify as Jwtverify } from 'jsonwebtoken';
import { RoomsService } from '../rooms/rooms.service';
import { parse as CookieParse } from 'cookie';
import 'dotenv/config';
import { Observable } from 'rxjs';

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;

  totalUsers: number = 0;
  messages = [];

  constructor(private readonly roomService: RoomsService) {}

  private logger: Logger = new Logger('ChatGateway');

  afterInit(wss: any) {
    this.logger.log('ChatGateway Initialized!');
  }

  handleConnection(client: Socket) {
    if (client.handshake.query.token) {
      const decoded: any = Jwtverify(client.handshake.query.token, process.env.JWT_SECRET, { ignoreExpiration: true });
      this.logger.log('User ID: ' + decoded.sub + ' Name: ' + decoded.name + ' connected');
    }
    this.logger.log('new clent connected ' + client.id);
    this.totalUsers++;
    // Notify connected clients of current users
    this.wss.emit('count', this.totalUsers);
  }

  handleDisconnect(client: Socket) {
    this.logger.log('client disconnected ' + client.id);
    this.totalUsers--;
    // Notify connected clients of current users
    this.wss.emit('count', this.totalUsers);
  }

  @SubscribeMessage('message')
  async onMessage(client: Socket, message: { user: string; room: string; content: string }) {
    const event: string = 'message';
    const decoded: any = Jwtverify(client.handshake.query.token, process.env.JWT_SECRET, { ignoreExpiration: true });
    // const cookie: any = CookieParse(client.handshake.headers.cookie);
    // this.logger.log(cookie.access_token);
    const mess: object = { user: { name: decoded.name }, content: message.content };
    // client.broadcast.to(message.room).emit(event, mess);
    this.wss.in(message.room).emit(event, mess);
    this.messages[message.room].push(mess);

    return Observable.create(observer => observer.next({ event, data: mess }));
  }

  @SubscribeMessage('join')
  handleRoomJoin(client: Socket, room: string) {
    client.join(room);
    this.logger.log('client ' + client.id + ' joined room ' + room);

    this.wss.in(room).clients((err, clients) => {
      this.wss.in(room).emit('room_users', clients.length);
    });
    // Send last messages to the connected user
    // client.emit('message', this.messages);
    client.emit('joined', room);
  }

  @SubscribeMessage('leave')
  handleRoomLeave(client: Socket, room: string) {
    client.leave(room);
    this.logger.log('client ' + client.id + ' left room ' + room);

    this.wss.in(room).clients((err, clients) => {
      this.wss.in(room).emit('room_users', clients.length);
    });

    client.emit('left', room);
  }
}
