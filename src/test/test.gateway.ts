import { Inject } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
  WsResponse,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { v4 } from 'uuid';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, WebSocket } from 'ws';
import { TestService, TEST_SERVICE_TOKEN } from './test.service';

@WebSocketGateway(9999)
export class TestGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private subscriptions: Record<string, WebSocket>;

  private timeout = 15000;

  private timer;

  constructor(
    @Inject(TEST_SERVICE_TOKEN) private readonly testService: TestService,
  ) {
    this.subscriptions = {};
    // this.web3Socket = new WebSocket('wss://divine-broken-resonance.quiknode.pro/35c422ccba391b639474d273a5b81fcd8a480b83/');
    //
    // this.web3Socket.on('open', function open() {
    //   console.log("OPEN WEB3")
    // });
    //
    // this.web3Socket.on('message',  (data) => {
    //   console.log("Received from w3", data.toString())
    //     this.server.clients.forEach(client => client.send(data))
    // });
  }

  afterInit(server: any): any {}

  handleConnection(client: any, ...args): any {
    this.timer = setInterval(() => this.createBlock(), this.timeout || 14000);
    console.log('Connected client');
  }

  handleDisconnect(client: any): any {
    console.log('Disconect client');
    clearInterval(this.timer);
  }

  handle(data: string, socket: WebSocket) {
    console.log('FROM CLIENT', data);
    const { method, params } = JSON.parse(data);

    if (method === 'eth_subscribe') {
      return this.createSubscription(socket);
    }

    if (method === 'eth_unsubscribe') {
      return this.dropSubscription(params[0], socket)
    }
  }

  @SubscribeMessage('test')
  onEvent(
    @MessageBody() data: string,
    @ConnectedSocket() socket: WebSocket,
  ): void {
    this.handle(data, socket);
  }

  private createSubscription(socket: WebSocket) {
    const response = {
      jsonrpc: '2.0',
      id: 1,
      result: v4(),
    };
    socket.on('error', (err) => console.error(err))
    this.subscriptions[response.result] = socket;
    socket.send(JSON.stringify(response));
    console.log("Create subscription", JSON.stringify(response))
  }

  private createBlock() {
    const enabled = this.testService.getIsBlockEnabled();
    console.log('IsEnabled', enabled, 'tick', Object.entries(this.subscriptions).length);
    if (!enabled) {
      for (const value of Object.values(this.subscriptions)) {
          value.terminate()

      }
      this.subscriptions = {};
      return;
    }
    for (const [key, value] of Object.entries(this.subscriptions)) {
      const block = {
        jsonrpc: '2.0',
        method: 'eth_subscription',
        params: {
          subscription: key,
          result: {
            parentHash:
              '0x985895b20de70174e3b5271f5ad6895cb62e1dcaf1f5189ed33b508a306b6921',
            sha3Uncles:
              '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
            miner: '0xea674fdde714fd979de3edf0f56aa9716b898ec8',
            stateRoot:
              '0xdfa2621a8decd7a3bf7e38aeed7c27e0206df3d029759f954c6080efca88abc0',
            transactionsRoot:
              '0x5849a0284331e86c5b4207136aa6eded53d8c844b3f84d2a5a51bf982fcdb4ee',
            receiptsRoot:
              '0xaecf74e8c43df65ea0cca1e10e203f914a6290f5f84c94d8a4e42aaf8d8049fc',
            logsBloom:
              '0x00604000004040090002200080104c00000800104004000400060183040a0880800004008240400000004900000801100200100a0c4004000005004100222200004024a04000104348000008100c10210004000008400000080000210020003002820020020204100040800c11120818000000a0210044000240041400008001000005100904111424000021030220c450008000810000181000004000100060020880030080282000000090200008000014200020942000084008021884000011000122981008400080000004c42040008204201020001040000102000020000018204801000000000100000000002040000400210a49000002014040000001',
            difficulty: '0x323941afd74ff8',
            number: '0xe1b77f',
            gasUsed: '0x20a450',
            gasLimit: '0x1c9c380',
            timestamp: '0x628397c5',
            extraData: '0x617369612d65617374322d6c6d7864',
            mixHash:
              '0x937514a01c2d74d95bcfdbb5022218a6cefcde1003530b8f2f0b4c015de2df45',
            nonce: '0xc53cee6e7878cc84',
            baseFeePerGas: '0xa47f58397',
            hash: '0x23e7c9725e9385b11df8cff473854717cee23786d745400c86e884e7ff364fdc',
          },
        },
      };
      console.log(
        'send block for s',
        key,
        Object.keys(this.subscriptions).length,
      );
      value.send(JSON.stringify(block));
    }
  }

  private dropSubscription(param: string, socket: WebSocket) {
    delete this.subscriptions[param]
  }
}
