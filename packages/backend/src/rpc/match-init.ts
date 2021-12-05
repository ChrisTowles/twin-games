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

import { Mark } from '@twin-games/shared'
import { constants, GameLoopResult, MatchLabel, State } from '../constants'


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
    gameLoopResult: GameLoopResult.Initialized,
  }

  return {
    state,
    tickRate: constants.tickRate,
    label: JSON.stringify(label),
  }
}
