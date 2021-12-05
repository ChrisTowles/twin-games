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

import {  State } from '../constants'

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