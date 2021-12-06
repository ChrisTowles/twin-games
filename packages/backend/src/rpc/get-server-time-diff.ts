import { RpcGetServerTimeDiffRequest, RpcGetServerTimeDiffResponse } from '@twin-games/shared'

export const rpcGetServerTimeDiff: nkruntime.RpcFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
  const utcMsec = Date.now()
  logger.info('rpcGetServerTimeDiff!', utcMsec)

  if (!payload)
    throw new Error('Expects payload.')

  let request = {} as RpcGetServerTimeDiffRequest
  try {
    request = JSON.parse(payload)
  }
  catch (error) {
    logger.error('Error parsing json message: %q', error)
    throw error
  }

  const diff = request.clientTime - utcMsec

  const response: RpcGetServerTimeDiffResponse = { clientTimeDiffInMsec: diff }

  return JSON.stringify(response)
}
