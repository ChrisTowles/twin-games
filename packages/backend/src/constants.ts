export const moduleName = 'tic-tac-toe_js'


import { Board, Mark, BoardPosition } from '@twin-games/shared'

export const constants = {
    tickRate: 1,
    maxEmptySec: 30,
    delayBetweenGamesSec: 5,
    turnTimeFastSec: 30,
    turnTimeNormalSec: 60
}


export const winningPositions: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export enum GameLoopResult {
    Unknown = 'Unknown',
    Initialized = 'Initialized',
    Start = 'Start',
    NotEnoughPlayers = 'NotEnoughPlayers',   
    PlayerMoved = 'PlayerMoved',
    Winner = 'Winner',
    Tie = 'Tie',
}
  

export interface MatchLabel {
  open: number
  fast: number
}

export interface State {
  // Match label
  label: MatchLabel
  // Ticks where no actions have occurred.
  emptyTicks: number
  // Currently connected users, or reserved spaces.
  presences: {[userId: string]: nkruntime.Presence}
  // Number of users currently in the process of connecting to the match.
  joinsInProgress: number
  // True if there's a game currently in progress.
  playing: boolean
  // Current state of the board.
  board: Board
  // Mark assignments to player user IDs.
  marks: {[userId: string]: Mark | null}
  // Whose turn it currently is.
  mark: Mark
  // Ticks until they must submit their move.
  deadlineRemainingTicks: number
  // The winner of the current game.
  winner: Mark | null
  // The winner positions.
  winnerPositions: BoardPosition[] | null
  // Ticks until the next game starts, if applicable.
  nextGameRemainingTicks: number,

  // added to debug the state the game loop is in.
  gameLoopResult: GameLoopResult,

}
