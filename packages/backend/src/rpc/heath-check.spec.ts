import { rpcHealthCheck } from "./health-check"

describe("matchLoop", () => {
  it("matchLoop - close match if no players and to many empty tics", () => {

    const context = {} as any
    const logger = console as any
    const result = rpcHealthCheck(context, logger)

    expect(result).toContain('it works')
  })
})
