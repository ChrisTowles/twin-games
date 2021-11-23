
function rpcHealthCheck(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
  logger.info('health check!.')
  return JSON.stringify({ msg: 'it works' })
}

const InitModule: nkruntime.InitModule
        = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
          initializer.registerRpc('healthcheck', rpcHealthCheck)
          logger.info('java Script Module loaded!')
        }

// Reference InitModule to avoid it getting removed on build by rollup
!InitModule && InitModule.bind(null)
