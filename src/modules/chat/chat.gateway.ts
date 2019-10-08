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
// import 'dotenv/config';
import { Observable, ReplaySubject } from 'rxjs';
import { delay } from 'rxjs/operators';

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;

  totalUsers: number = 0;
  messages = [];
  rmessname: string = 'ChatRoom';
  welcomeMessages = [
    { user: { name: this.rmessname }, content: 'Welcome to our Room!' },
    { user: { name: this.rmessname }, content: 'Please, be kind and polite!' },
    { user: { name: this.rmessname }, content: 'Respect others and give me youre many :-)' },
  ];

  constructor(private readonly roomService: RoomsService) {}

  private logger: Logger = new Logger('ChatGateway');

  afterInit(wss: any) {
    this.logger.log('ChatGateway Initialized!');
  }

  // safeJoin(client: Socket) {
  //   client.leave(this.previousId);
  //   client.join(client.id);
  //   this.previousId = client.id;
  // };

  async handleConnection(client: Socket) {
    if (client.handshake.query.token) {
      const decoded: any = Jwtverify(client.handshake.query.token, process.env.JWT_SECRET, { ignoreExpiration: true });
      this.logger.log('User ID: ' + decoded.sub + ' Name: ' + decoded.name + ' connected');
    }
    this.logger.log('new clent connected ' + client.id);
    this.totalUsers++;
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
  async onMessage(client: Socket, message: { user: string; room: string; content: string }) {
    const event: string = 'message';
    // const decoded: any = Jwtverify(client.handshake.query.token, process.env.JWT_SECRET, { ignoreExpiration: true });
    const cookie: any = CookieParse(client.handshake.headers.cookie);
    const decoded: any = Jwtverify(cookie.access_token, process.env.JWT_SECRET, { ignoreExpiration: true });
    // this.logger.log(cookie.access_token);
    const mess: object = { user: { name: decoded.name }, content: message.content };
    const room: string = message.room;
    // this.messages.push(room);
    // client.broadcast.to(message.room).emit(event, mess);
    // this.wss.in(message.room).emit(event, mess);
    // this.messages[message.room].push(mess);

    return Observable.create(observer => observer.next({ event, mess }))
      .pipe(delay(100))
      .subscribe((data: { event: string | symbol; mess: object }) => {
        // this.messages[room].push(data.data);
        this.wss.in(room).emit(data.event, data.mess);
      });

    // const stream$ = new ReplaySubject(10);
    // stream$.next({ event, mess });
    // stream$.subscribe((data: { event: string | symbol; mess: object }) => {
    //   this.wss.in(room).emit(data.event, data.mess);
    // });
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
}
