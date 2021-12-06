import { ref, Ref } from 'vue'

import { Board, OpCode, DoneMessage, UpdateMessage, markToString, StartMessage, OpCodeAndMessage, Mark } from '@twin-games/shared'

import Nakama from '../game/nakama'

export const useGameServer = () => {
  const playerTurn: Ref<boolean> = ref(false)
  const headerText: Ref<string> = ref('test')
  const playerMark: Ref<Mark | null> = ref(null)
  const board: Ref<Board> = ref(Array(9).fill(null))
  const playingMatch: Ref<boolean> = ref(false)
  const serverTimeDiffMsec: Ref<number> = ref(0)

  const updatePlayerTurn = (msg: UpdateMessage) => {
    const userId = localStorage.getItem('user_id')

    if (userId === msg.currentTurnUserId)
      headerText.value = `Your turn! (${markToString(playerMark.value!)})`

    else
      headerText.value = 'Opponents turn!'
  }

  const setPlayerTurn = (data: StartMessage) => {
    const userId = localStorage.getItem('user_id')

    playerMark.value = data.marks[userId!]

    if (data.marks[userId!] === data.mark) {
      playerTurn.value = true
      headerText.value = `Your turn! - (${markToString(playerMark.value!)})`
    }
    else {
      playerTurn.value = false
      headerText.value = 'Opponents turn!'
    }
  }

  const endGame = (data: DoneMessage) => {
    board.value = data.board

    if (data.winner === playerMark.value)
      headerText.value = 'Winner!'
    else
      headerText.value = 'You loose :('
  }

  const findMatch = async() => {
    headerText.value = 'Looking for Match'

    // get the time offset with server, so we can calculate the timers
    serverTimeDiffMsec.value = await Nakama.getServerTimeDiff()

    await Nakama.findMatch()
  }

  // ep4
  const nakamaListener = () => {
    if (Nakama.socket !== null) {
      Nakama.socket.onmatchdata = (result: OpCodeAndMessage) => {
        //  console.log(`socket onmatchdata: ${result.op_code}`, result.data)
        switch (result.op_code) {
          case OpCode.START:
            console.log('start received:', result.data)
            playingMatch.value = true
            setPlayerTurn(result.data as StartMessage)
            board.value = (result.data as StartMessage).board // so after restart the board is updated
            break
          case OpCode.UPDATE:
            // eslint-disable-next-line no-case-declarations
            const updateMsg = result.data as UpdateMessage
            console.log('update received:', updateMsg)

            board.value = updateMsg.board
            updatePlayerTurn(updateMsg)
            break
          case OpCode.DONE:
            console.log('DONE received:', result)
            endGame(result.data as DoneMessage)
            break
          default:
            console.log('unhandled message received:', result)
        }
      }
    }
  }

  return {
    board,
    headerText,
    playerTurn,
    playerMark,
    findMatch,
    nakamaListener,
    playingMatch,
    serverTimeDiffMsec,
  }
}
