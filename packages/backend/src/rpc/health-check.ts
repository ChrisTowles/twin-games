export const rpcHealthCheck = function(ctx: nkruntime.Context, logger: nkruntime.Logger /* nk: nkruntime.Nakama, payload: string */): string {
  logger.info('health check!.')
  return JSON.stringify({ msg: 'it works' })
}
