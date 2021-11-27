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
import { Mark, UpdateMessage, OpCode, DoneMessage } from '@twin-games/shared'
import { constants, MatchLabel, State } from './constants'

export const matchInit: nkruntime.MatchInitFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, params: {[key: string]: string}) {
  const fast = !!params.fast

  const label: MatchLabel = {
    open: 1,
    fast: 0,
  }
  if (fast)
    label.fast = 1

  const state: State = {
    label,
    emptyTicks: 0,
    presences: {},
    joinsInProgress: 0,
    playing: false,
    board: [],
    marks: {},
    mark: Mark.UNDEFINED,
    deadlineRemainingTicks: 0,
    winner: null,
    winnerPositions: null,
    nextGameRemainingTicks: 0,
  }

  return {
    state,
    tickRate: constants.tickRate,
    label: JSON.stringify(label),
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const matchJoinAttempt: nkruntime.MatchJoinAttemptFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presence: nkruntime.Presence, metadata: {[key: string]: any}) {
  const s: State = state as State

  // Check if it's a user attempting to rejoin after a disconnect.
  if (presence.userId in s.presences) {
    if (s.presences[presence.userId] === undefined) {
      // User rejoining after a disconnect.
      s.joinsInProgress++
      return {
        state: s,
        accept: false,
      }
    }
    else {
      // User attempting to join from 2 different devices at the same time.
      return {
        state: s,
        accept: false,
        rejectMessage: 'already joined',
      }
    }
  }

  // Check if match is full.
  if (Object.keys(s.presences).length + s.joinsInProgress >= 2) {
    return {
      state: s,
      accept: false,
      rejectMessage: 'match full',
    }
  }

  // New player attempting to connect.
  s.joinsInProgress++
  return {
    state: s,
    accept: true,
  }
}

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

export const matchLeave: nkruntime.MatchLeaveFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presences: nkruntime.Presence[]) {
  const s = state as State
  for (const presence of presences) {
    logger.info('Player: %s left match: %s.', presence.userId, ctx.matchId)
    delete s.presences[presence.userId]
  }

  return { state: s }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const matchTerminate: nkruntime.MatchTerminateFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, graceSeconds: number) {
  return { state }
}

export const matchSignal: nkruntime.MatchSignalFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState) {
  return { state }
}