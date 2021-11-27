import { Message, OpCode, OpCodeAndMessage, StartMessage } from "@twin-games/shared";
import { constants, GameLoopResult, State } from "./constants";
import { matchLoop } from "./match_loop"


class MockMatchDispatcher {
  public messages: OpCodeAndMessage[] = []
  public broadcastMessage(opCode: OpCode, message: string) {
    this.messages.push({op_code: opCode, data: JSON.parse(message) as Message } as OpCodeAndMessage)
  }

  public label = {}
  public matchLabelUpdate(labelJson: any) {
    // no op
    this.label = labelJson
  }
}


const startGameState: State = {board: Array(9),
  deadlineRemainingTicks:0,
  emptyTicks:0,
  joinsInProgress:0,
  label:{fast:1,open:0},
  mark:0,
  marks:{"0f71ccdb-b2e1-4e05-a100-e97805cf95a8":1,   "50cebfd0-70bd-4886-b4ad-b2e67c8ff59f":0},
  nextGameRemainingTicks:0,
  playing:false,
  presences:{ "0f71ccdb-b2e1-4e05-a100-e97805cf95a8": {node:"nakama",reason:0,sessionId:"a2b0638e-4f14-11ec-b04b-006100a0eb06",
                  userId:"0f71ccdb-b2e1-4e05-a100-e97805cf95a8",username:"rIPUefghvM"},
              "50cebfd0-70bd-4886-b4ad-b2e67c8ff59f":{node:"nakama",reason:0,sessionId:"a5797320-4f14-11ec-b04b-006100a0eb06",
                  userId:"50cebfd0-70bd-4886-b4ad-b2e67c8ff59f",username:"VrUsyjiqSr"}},
  winner:1,
  winnerPositions:null,
  gameLoopResult: GameLoopResult.Unknown,
}



describe("matchLoop", () => {
  it("matchLoop - close match if no players and to many empty tics", () => {

    const context = {} as any
    const logger = console as any
    const nakamaRuntime = {} as any
    const matchDispatcher = new MockMatchDispatcher() as any;
    const matchMessages: Message[] = []

    // create game state no players
    const matchState = {
      ...startGameState,
      presences: {},
      emptyTicks: constants.maxEmptySec * constants.tickRate + 1
    };

    const result = matchLoop(context , logger, nakamaRuntime ,
      matchDispatcher, 1, matchState , matchMessages as any[])  
    
    expect(result).toBeNull()
  })

  it("matchLoop - wait for more players if only one joined", () => {

    const context = {} as any
    const logger = console as any
    const nakamaRuntime = {} as any
    const matchDispatcher = new MockMatchDispatcher() as any;
    const matchMessages: Message[] = []

    // create game state with just 1 player
    const matchState = {
      ...startGameState,
      presences: {...startGameState.presences[0]},
      emptyTicks: 1
    };

    const result = matchLoop(context , logger, nakamaRuntime ,
       matchDispatcher, 1, matchState , matchMessages as any[]) as {state: State}

    expect(result.state.gameLoopResult).toBe(GameLoopResult.NotEnoughPlayers)
  })


  
  it("matchLoop - should start match", () => {

    const context = {} as any
    const logger = console as any
    const nakamaRuntime = {} as any
    const matchDispatcher = new MockMatchDispatcher() as any;
    const matchMessages: Message[] = []

    // create game state with just 1 player
    const matchState = {
      ...startGameState,
      playing: false,
    };

    const result = matchLoop(context , logger, nakamaRuntime ,
       matchDispatcher, 1, matchState , matchMessages as any[]) as {state: State}

    expect(result.state.gameLoopResult).toBe(GameLoopResult.Start)
    expect(matchDispatcher.messages.length).toBe(1)

    const opCodeWithStartMsg = matchDispatcher.messages[0] as OpCodeAndMessage
    expect(opCodeWithStartMsg.op_code).toBe(OpCode.START)
    const msg = opCodeWithStartMsg.data as StartMessage
    
    expect(msg.deadline).toBeGreaterThan(0)

  })




 
})
