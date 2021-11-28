import { DoneMessage, Mark, Message, MoveMessage, OpCode, StartMessage, UpdateMessage } from "@twin-games/shared";
import { constants, GameLoopResult, State } from "../constants";
import { matchLoop } from "./match_loop"

interface DispatcherMessage {
  opCode: OpCode; data: Message; broadcast: any;
}

class MockMatchDispatcher {
  public messages: DispatcherMessage[] = []
  public broadcastMessage(opCode: OpCode, message: string | null, broadcast: any = null) {
    this.messages.push({ opCode: opCode, data: JSON.parse(message) as Message, broadcast: broadcast } )
  }

  public label = {}
  public matchLabelUpdate(labelJson: any) {
    // no op
    this.label = labelJson
  }
}

class MockMatchMessage {

  sender: {userId: string};
  // persistence: boolean;
  // status: string;
  opCode: OpCode;
  data: string; // JSON.stringify(Message)
  //reliable: boolean;
  //receiveTime: number;
}

const Player0Uuid = '0f71ccdb-b2e1-4e05-a100-e97805cf95a8'
//const Player1Uuid = "50cebfd0-70bd-4886-b4ad-b2e67c8ff59f"

const startGameState: State = {
  board: Array(9).fill(null),
  deadlineRemainingTicks: 0,
  emptyTicks: 0,
  joinsInProgress: 0,
  label: { fast: 1, open: 0 },
  mark: 0,
  marks: {  '0f71ccdb-b2e1-4e05-a100-e97805cf95a8': 0, "50cebfd0-70bd-4886-b4ad-b2e67c8ff59f": 1 },
  nextGameRemainingTicks: 0,
  playing: false,
  presences: {
    '0f71ccdb-b2e1-4e05-a100-e97805cf95a8': {
      node: "nakama", reason: 0, sessionId: "a2b0638e-4f14-11ec-b04b-006100a0eb06",
      userId:  '0f71ccdb-b2e1-4e05-a100-e97805cf95a8', username: "rIPUefghvM"
    },
    "50cebfd0-70bd-4886-b4ad-b2e67c8ff59f": {
      node: "nakama", reason: 0, sessionId: "a5797320-4f14-11ec-b04b-006100a0eb06",
      userId: "50cebfd0-70bd-4886-b4ad-b2e67c8ff59f", username: "VrUsyjiqSr"
    }
  },
  winner: null,
  winnerPositions: null,
  gameLoopResult: GameLoopResult.Unknown,
}



describe("matchLoop", () => {
  it("matchLoop - close match if no players and to many empty tics", () => {

    const context = {} as any
    const logger = console as any
    const nakamaRuntime = {} as any
    const matchDispatcher = new MockMatchDispatcher()
    const matchMessages: Message[] = []

    // create game state no players
    const matchState = {
      ...startGameState,
      presences: {},
      emptyTicks: constants.maxEmptySec * constants.tickRate + 1
    };

    const result = matchLoop(context, logger, nakamaRuntime,
      matchDispatcher as any, 1, matchState, matchMessages as any[])

    expect(result).toBeNull()
  })

  it("matchLoop - wait for more players if only one joined", () => {

    const context = {} as any
    const logger = console as any
    const nakamaRuntime = {} as any
    const matchDispatcher = new MockMatchDispatcher()
    const matchMessages: Message[] = []

    // create game state with just 1 player
    const matchState = {
      ...startGameState,
      presences: { ...startGameState.presences[0] },
      emptyTicks: 1
    };

    const result = matchLoop(context, logger, nakamaRuntime,
      matchDispatcher as any, 1, matchState, matchMessages as any[]) as { state: State }

    expect(result.state.gameLoopResult).toBe(GameLoopResult.NotEnoughPlayers)
  })



  it("matchLoop - should start match", () => {

    const context = {} as any
    const logger = console as any
    const nakamaRuntime = {} as any
    const matchDispatcher = new MockMatchDispatcher();
    const matchMessages: Message[] = []

    const matchState = {
      ...startGameState,
      playing: false,
    };

    const result = matchLoop(context, logger, nakamaRuntime,
      matchDispatcher as any, 1, matchState, matchMessages as any[]) as { state: State }

    expect(result.state.gameLoopResult).toBe(GameLoopResult.Start)
    expect(matchDispatcher.messages.length).toBe(1)

    const opCodeWithStartMsg = matchDispatcher.messages[0]
    expect(opCodeWithStartMsg.opCode).toBe(OpCode.START)
    const msg = opCodeWithStartMsg.data as StartMessage

    expect(msg.deadline).toBeGreaterThan(0)

  })


  it("matchLoop - first move", () => {

    const context = {} as any
    const logger = console as any
    const nakamaRuntime = {} as any
    const matchDispatcher = new MockMatchDispatcher();
    const matchMessages: MockMatchMessage[] = [{
      data: JSON.stringify({position: 0} as MoveMessage),
      opCode: OpCode.MOVE,
      sender: { userId: Player0Uuid },
    } as MockMatchMessage]

    const matchState = {
      ...startGameState,
      playing: true,
    };


    const result = matchLoop(context, logger, nakamaRuntime,
      matchDispatcher as any, 1, matchState, matchMessages as any[]) as { state: State }

    expect(result.state.gameLoopResult).toBe(GameLoopResult.PlayerMoved)
    expect(result.state.playing).toBeTruthy()
    expect(matchDispatcher.messages.length).toBe(1)


    const opCodeWithUpdateMessage = matchDispatcher.messages[0]
    expect(opCodeWithUpdateMessage.opCode).toBe(OpCode.UPDATE)
    expect(opCodeWithUpdateMessage.broadcast).toBeNull() // should be broadcasted to all players
    const msg = opCodeWithUpdateMessage.data as UpdateMessage

    expect(msg.board.join(',')).toBe('0,,,,,,,,')
    expect(msg.mark).toBe(Mark.O)
    expect(msg.deadline).toBeGreaterThan(0)

  })


  
  it("matchLoop - Game Winner", () => {

    const context = {} as any
    const logger = console as any
    const nakamaRuntime = {} as any
    const matchDispatcher = new MockMatchDispatcher();

    const matchMessages: MockMatchMessage[] = [{
      data: JSON.stringify({position: 0} as MoveMessage),
      opCode: OpCode.MOVE,
      sender: { userId: Player0Uuid },
    } as MockMatchMessage]

    const matchState = {
      ...startGameState,
      mark: Mark.X,
      board: [null, Mark.O, null, Mark.X, Mark.O, null, Mark.X, null, null],
      playing: true,
    };


    const result = matchLoop(context, logger, nakamaRuntime,
      matchDispatcher as any, 1, matchState, matchMessages as any[]) as { state: State }

    expect(result.state.gameLoopResult).toBe(GameLoopResult.Winner)
    expect(result.state.playing).toBeFalsy()
    expect(matchDispatcher.messages.length).toBe(1)


    const opCodeWithMsg = matchDispatcher.messages[0]
    expect(opCodeWithMsg.opCode).toBe(OpCode.DONE)
    expect(opCodeWithMsg.broadcast).toBeNull() // should be broadcasted to all players
    const msg = opCodeWithMsg.data as DoneMessage

    expect(msg.board.join(',')).toBe('0,1,,0,1,,0,,')
    expect(msg.winner).toBe(Mark.X)
    expect(msg.winnerPositions.join(',')).toBe('0,3,6')

  })


  
  
  it("matchLoop - Game Tie", () => {

    const context = {} as any
    const logger = console as any
    const nakamaRuntime = {} as any
    const matchDispatcher = new MockMatchDispatcher();

    const matchMessages: MockMatchMessage[] = [{
      data: JSON.stringify({position: 0} as MoveMessage),
      opCode: OpCode.MOVE,
      sender: { userId: Player0Uuid },
    } as MockMatchMessage]

    const matchState = {
      ...startGameState,
      mark: Mark.X,
      board: [null, Mark.X, Mark.O,
         Mark.O, Mark.X, Mark.X, 
         Mark.X, Mark.O, Mark.O],
      playing: true,
    };


    const result = matchLoop(context, logger, nakamaRuntime,
      matchDispatcher as any, 1, matchState, matchMessages as any[]) as { state: State }

    expect(result.state.gameLoopResult).toBe(GameLoopResult.Tie)
    expect(result.state.playing).toBeFalsy()
    expect(matchDispatcher.messages.length).toBe(1)


    const opCodeWithMsg = matchDispatcher.messages[0]
    expect(opCodeWithMsg.opCode).toBe(OpCode.DONE)
    expect(opCodeWithMsg.broadcast).toBeNull() // should be broadcasted to all players
    const msg = opCodeWithMsg.data as DoneMessage

    expect(msg.board.join(',')).toBe('0,0,1,1,0,0,0,1,1')
    expect(msg.winner).toBeNull()
    expect(msg.winnerPositions).toBeNull()

  })


})
