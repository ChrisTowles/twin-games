/* eslint-disable no-case-declarations */
// Copyright 2020 The Nakama Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { msecToSec } from './daily_rewards'
import { Board, Mark, UpdateMessage, OpCode, DoneMessage, StartMessage, MoveMessage, Message } from '@twin-games/shared'
import { constants, GameLoopResult, MatchLabel, State, winningPositions } from '../constants'


export const matchLoop: nkruntime.MatchLoopFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, messages: nkruntime.MatchMessage[]) {
  const s = state as State
  logger.debug('Running match loop. Tick: %d', tick)

  if (Object.keys(s.presences).length + s.joinsInProgress === 0) {
    s.emptyTicks++
    if (s.emptyTicks >= constants.maxEmptySec * constants.tickRate) {
      // Match has been empty for too long, close it.
      logger.info('closing idle match')
      return null
    }
  }

  const currentTimeSecs = msecToSec(Date.now())

  // If there's no game in progress check if we can (and should) start one!
  if (!s.playing) {
    logger.debug('no match so checking if we can and should start one.')

    // Between games any disconnected users are purged, there's no in-progress game for them to return to anyway.
    // eslint-disable-next-line no-restricted-syntax
    for (const userID in s.presences) {
      if (s.presences[userID] === null)
        delete s.presences[userID]
    }

    // Check if we need to update the label so the match now advertises itself as open to join.
    if (Object.keys(s.presences).length < 2 && s.label.open !== 1) {
      s.label.open = 1
      const labelJSON = JSON.stringify(s.label)
      dispatcher.matchLabelUpdate(labelJSON)
    }

    // Check if we have enough players to start a game.
    if (Object.keys(s.presences).length < 2) {
      s.gameLoopResult = GameLoopResult.NotEnoughPlayers
      return { state: s }
    }

    // Check if enough time has passed since the last game.
    if (s.nextGameRemainingTicks > 0) {
      s.nextGameRemainingTicks--
      return { state: s }
    }

    // We can start a game! Set up the game state and assign the marks to each player.
    logger.debug('We can start a game.')

    // Setup State
    s.playing = true
    s.board = new Array(9).fill(null)
    s.marks = {}
    const marks = [Mark.X, Mark.O]
    Object.keys(s.presences).forEach((userId) => {
      s.marks[userId] = marks.shift() ?? null
    })
    s.mark = Math.random() < 0.5 ? Mark.X : Mark.O;  // Randomly choose who goes first.
    s.winner = null
    s.winnerPositions = null
    s.deadlineRemainingTicks = calculateDeadlineTicks(s.label)
    s.nextGameRemainingTicks = 0
    s.gameLoopResult = GameLoopResult.Start

    // Notify the players a new game has started.
    const msg: StartMessage = {
      board: s.board,
      marks: s.marks,
      mark: s.mark,
      deadline: currentTimeSecs + Math.floor(s.deadlineRemainingTicks / constants.tickRate),
    }
    logger.debug(JSON.stringify(msg))
    dispatcher.broadcastMessage(OpCode.START, JSON.stringify(msg))
    return { state: s }
  }

  // There's a game in progress. Check for input, update match state, and send messages to clients.
  for (const message of messages) {
    switch (message.opCode) {
      case OpCode.MOVE:
        logger.debug(`Received move message ${message.sender.userId} from current_mark ${s.mark} user: %v`, s.marks)

        const mark = s.marks[message.sender.userId] ?? null
        if (mark === null || s.mark !== mark) {
          // It is not this player's turn.

          logger.debug('mark move message from user: %v', s.marks)
          dispatcher.broadcastMessage(OpCode.REJECTED, JSON.stringify({msg: "It is not this player's turn."}), [message.sender])
          continue
        }

        let msg = {} as MoveMessage
        try {
          msg = JSON.parse(message.data)
        }
        catch (error) {
          // Client sent bad data.
          dispatcher.broadcastMessage(OpCode.REJECTED, JSON.stringify({msg: "Malformed JSON received."}), [message.sender])
          logger.debug('Bad data received: %v', error)
          continue
        }
        if (s.board[msg.position]) {
          // Client sent a position outside the board, or one that has already been played.
          dispatcher.broadcastMessage(OpCode.REJECTED, JSON.stringify({msg: "Client sent a position outside the board, or one that has already been played."}), [message.sender])
          continue
        }

        // Update the game state.
        s.board[msg.position] = mark
        s.mark = mark === Mark.O ? Mark.X : Mark.O
        s.deadlineRemainingTicks = calculateDeadlineTicks(s.label)
        s.gameLoopResult = GameLoopResult.PlayerMoved

        // Check if game is over through a winning move.
        const [winner, winningPos] = winCheck(s.board, mark)
        if (winner) {
          s.winner = mark
          s.winnerPositions = winningPos
          s.playing = false
          s.deadlineRemainingTicks = 0
          s.nextGameRemainingTicks = constants.delayBetweenGamesSec * constants.tickRate
          s.gameLoopResult = GameLoopResult.Winner
        }
        // Check if game is over because no more moves are possible.
        const tie = s.board.every(v => v !== null)
        if (tie) {
          // Update state to reflect the tie, and schedule the next game.
          s.playing = false
          s.deadlineRemainingTicks = 0
          s.nextGameRemainingTicks = constants.delayBetweenGamesSec * constants.tickRate
          s.gameLoopResult = GameLoopResult.Tie
        }

        let opCode: OpCode
        let outgoingMsg: Message
        if (s.playing) {
          opCode = OpCode.UPDATE
          const msg: UpdateMessage = {
            board: s.board,
            mark: s.mark,
            deadline: currentTimeSecs + Math.floor(s.deadlineRemainingTicks / constants.tickRate),
          }
          outgoingMsg = msg
        }
        else {
          opCode = OpCode.DONE
          const msg: DoneMessage = {
            board: s.board,
            winner: s.winner,
            winnerPositions: s.winnerPositions,
            nextGameStart: currentTimeSecs + Math.floor(s.nextGameRemainingTicks / constants.tickRate),
          }
          outgoingMsg = msg
        }
        dispatcher.broadcastMessage(opCode, JSON.stringify(outgoingMsg))
        break
      default:
        // No other opcodes are expected from the client, so automatically treat it as an error.
        dispatcher.broadcastMessage(OpCode.REJECTED, JSON.stringify({msg: "No other opcodes are expected from the client, so automatically treat it as an error."}), [message.sender])
        logger.error('Unexpected opcode received: %d', message.opCode)
    }
  }

  // Keep track of the time remaining for the player to submit their move. Idle players forfeit.
  if (s.playing) {
    s.deadlineRemainingTicks--
    if (s.deadlineRemainingTicks <= 0) {
      // The player has run out of time to submit their move.
      s.playing = false
      s.winner = s.mark === Mark.O ? Mark.X : Mark.O
      s.deadlineRemainingTicks = 0
      s.nextGameRemainingTicks = constants.delayBetweenGamesSec * constants.tickRate

      const msg: DoneMessage = {
        board: s.board,
        winner: s.winner,
        nextGameStart: currentTimeSecs + Math.floor(s.nextGameRemainingTicks / constants.tickRate),
        winnerPositions: null,
      }
      dispatcher.broadcastMessage(OpCode.DONE, JSON.stringify(msg))
    }
  }

  return { state: s }
}


function calculateDeadlineTicks(l: MatchLabel): number {
  if (l.fast === 1)
    return constants.turnTimeFastSec * constants.tickRate

  else
    return constants.turnTimeNormalSec * constants.tickRate
}

function winCheck(board: Board, mark: Mark): [boolean, Mark[] | null] {
  for (const wp of winningPositions) {
    if (board[wp[0]] === mark
            && board[wp[1]] === mark
            && board[wp[2]] === mark)
      return [true, wp]
  }

  return [false, null]
}
