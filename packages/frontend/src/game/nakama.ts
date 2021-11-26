import { Client, Session, Socket } from '@heroiclabs/nakama-js'


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

    // ep4
    const trace = false
    this.socket = this.client.createSocket(this.client.useSSL, trace)
    await this.socket.connect(this.session, true)
  }

  async findMatch() { // ep4
    const rpcid = 'find_match'
    const matches = await this.client!.rpc(this.session!, rpcid, {})

    this.matchID = (matches.payload! as any).matchIds[0] as string
    await this.socket!.joinMatch(this.matchID)
    console.log('Matched joined!')
  }

  async makeMove(index: number) { // ep4
    const data = { position: index }
    await this.socket!.sendMatchState(this.matchID, 4, data)
    console.log('Match data sent')
  }
}

export default new Nakama()
