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
import { rpcReward } from './rpc/daily_rewards'
import { matchInit, matchJoin, matchJoinAttempt, matchLeave, matchSignal, matchTerminate } from './match_handler'
import { rpcFindMatch } from './rpc/match_rpc'
import { rpcHealthCheck } from './rpc/health_check'
import { matchLoop } from './rpc/match_loop'



const InitModule: nkruntime.InitModule
        = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {


          // Register RPC commands.
          // Important: You can not anything but a 'string' here, trying to use RpcCommands object completely fails. Not sure why.
          // but after an hour of testing and failing; magic strings it is. 
          initializer.registerRpc('health_check', rpcHealthCheck)
          initializer.registerRpc('rewards_js', rpcReward)
          initializer.registerRpc('find_match', rpcFindMatch)
          
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
