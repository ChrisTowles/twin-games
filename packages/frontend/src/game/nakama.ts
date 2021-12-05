import { Client, Session, Socket } from '@heroiclabs/nakama-js'
import { BoardPosition, MoveMessage, OpCode, RpcCommands, RpcFindMatchRequest, RpcFindMatchResponse, RpcGetServerTimeDiffRequest, RpcGetServerTimeDiffResponse } from '@twin-games/shared'


import { v4 as uuidv4 } from 'uuid'

class Nakama {
  client: Client | null = null
  session: Session | null = null
  socket: Socket | null = null
  matchID = ''
  
  constructor() {
      
  }

  async authenticate() {
    const useSSL = false
    this.client = new Client('defaultkey', 'localhost', '7350', useSSL)

    let deviceId = localStorage.getItem('deviceId')
    if (!deviceId) {
      deviceId = uuidv4()
      localStorage.setItem('deviceId', deviceId)
    }

    this.session = await this.client.authenticateDevice(deviceId, true)
    localStorage.setItem('user_id', this.session.user_id!)

    const trace = false
    this.socket = this.client.createSocket(this.client.useSSL, trace)
    await this.socket.connect(this.session, true)
  }

  async findMatch() {

    const data: RpcFindMatchRequest = { fast:false };
    console.log('Finding match...- command:', RpcCommands.FindMatch)
    const matches = await this.client!.rpc(this.session!, RpcCommands.FindMatch, data)

    console.log('found match ', matches)
    this.matchID = (matches.payload! as RpcFindMatchResponse).matchIds[0]
    await this.socket!.joinMatch(this.matchID)
    console.log('Matched joined!', this.matchID)
  }

  async makeMove(index: BoardPosition) {
    console.log('sending move', index)
    const data: MoveMessage = { position: index }
    await this.socket!.sendMatchState(this.matchID, OpCode.MOVE, data)
    console.log('Match data sent')
  }
  async getServerTimeDiff(): Promise<number> {

    const utcMsec = Date.now()
    const data: RpcGetServerTimeDiffRequest = { clientTime: utcMsec };
    const response = await this.client!.rpc(this.session!, RpcCommands.GetServerTimeDiff, data)
    const model = (response.payload! as RpcGetServerTimeDiffResponse)
    
    return model.clientTimeDiffInMsec
  
  }
}

export default new Nakama()
