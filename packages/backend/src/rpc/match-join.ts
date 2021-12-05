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

import { msecToSec } from './rewards'
import { UpdateMessage, OpCode, DoneMessage } from '@twin-games/shared'
import { constants, State } from '../constants'
import { getCurrentTurnUserId } from './match-loop'

export const matchJoin: nkruntime.MatchJoinFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presences: nkruntime.Presence[]) {
  const s: State = state as State
  const t = msecToSec(Date.now())

  for (const presence of presences) {
    s.emptyTicks = 0
    s.presences[presence.userId] = presence
    s.joinsInProgress--

    // Check if we must send a message to this user to update them on the current game state.
    if (s.playing) {
      // There's a game still currently in progress, the player is re-joining after a disconnect. Give them a state update.
      const update: UpdateMessage = {
        board: s.board,
        mark: s.mark,
        deadline: t + Math.floor(s.deadlineRemainingTicks / constants.tickRate),
        currentTurnUserId: getCurrentTurnUserId(s),
      }
      // Send a message to the user that just joined.
      dispatcher.broadcastMessage(OpCode.UPDATE, JSON.stringify(update))
    }
    else if (s.board.length !== 0 && Object.keys(s.marks).length !== 0 && s.marks[presence.userId]) {
      logger.debug('player %s rejoined game', presence.userId)
      // There's no game in progress but we still have a completed game that the user was part of.
      // They likely disconnected before the game ended, and have since forfeited because they took too long to return.
      const done: DoneMessage = {
        board: s.board,
        winner: s.winner,
        winnerPositions: s.winnerPositions,
        nextGameStart: t + Math.floor(s.nextGameRemainingTicks / constants.tickRate),
      }
      // Send a message to the user that just joined.
      dispatcher.broadcastMessage(OpCode.DONE, JSON.stringify(done))
    }
  }

  // const label = s.label as MatchLabel

  // Check if match was open to new players, but should now be closed.
  if (Object.keys(s.presences).length >= 2 && s.label.open !== 0) {
    s.label.open = 0
    const labelJSON = JSON.stringify(s.label)
    dispatcher.matchLabelUpdate(labelJSON)
  }

  return { state: s }
}
