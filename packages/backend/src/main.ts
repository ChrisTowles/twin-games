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

import { moduleName } from './constants'
import { rpcReward } from './daily_rewards'
import { matchInit, matchJoin, matchJoinAttempt, matchLeave, matchSignal, matchTerminate } from './match_handler'
import { rpcFindMatch } from './match_rpc'
import { RpcCommands } from '@twin-games/shared'
import { matchLoop } from './match_loop'


function rpcHealthCheck(ctx: nkruntime.Context, logger: nkruntime.Logger /* nk: nkruntime.Nakama, payload: string */): string {
  logger.info('health check!.')
  return JSON.stringify({ msg: 'it works' })
}

const InitModule: nkruntime.InitModule
        = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
          initializer.registerRpc(RpcCommands.healthcheck, rpcHealthCheck)

          initializer.registerRpc(RpcCommands.Rewards, rpcReward)

          initializer.registerRpc(RpcCommands.FindMatch, rpcFindMatch)

          initializer.registerMatch(moduleName, {
            matchInit,
            matchJoinAttempt,
            matchJoin,
            matchLeave,
            matchLoop,
            matchTerminate,
            matchSignal,
          })

          logger.info('java Script Module loaded!')
        }

// Reference InitModule to avoid it getting removed on build by rollup
!InitModule && InitModule.bind(null)
