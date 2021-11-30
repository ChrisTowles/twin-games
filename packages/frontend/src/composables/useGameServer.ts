import { ref, Ref } from 'vue';

import { Board, OpCode, DoneMessage, UpdateMessage, markToString, StartMessage, OpCodeAndMessage, Mark } from '@twin-games/shared'
import { CONFIG } from '../config'
import Nakama from '../nakama'

type Position = {
    [key: number]: {x: number; y: number, imageHandle: Phaser.GameObjects.Image | null}
  }


export const useGameServer = () => {
    
    let gameStarted = false
    let playerTurn = false
    let headerText = ''
    let playerMark: Mark | null = null
    let board: Board = Array(9).fill(null)
            
        
      
    const updatePlayerTurn = () => {
        playerTurn = !playerTurn
    
        if (playerTurn)
          headerText = `Your turn! (${markToString(playerMark!)})`
    
        else
          headerText = 'Opponents turn!'
      }

      
      
       const updatePlayerMark = (data: StartMessage) => {
          const userId = localStorage.getItem('user_id')
                
          if (data.marks[userId!] === data.mark) {
            playerMark = data.mark    
          }
          else {
            // if not our turn, then we have the other mark.
            playerMark = data.mark === Mark.X ? Mark.O : Mark.X
          }
        };

        const setPlayerTurn = (data: StartMessage) => {
          const userId = localStorage.getItem('user_id')
      
          playerMark = data.marks[userId!]
      
          if (data.marks[userId!] === data.mark) {
            playerTurn = true
            headerText = `Your turn! - (${markToString(playerMark!)})`
          }
          else {
            headerText = 'Opponents turn!'
          }
        }
      
        const endGame = (data: DoneMessage) => {
          board = data.board
          
      
          if (data.winner === playerMark)
            headerText = 'Winner!'
          else
            headerText = 'You loose :('
        }
      
        // ep4
        const nakamaListener = () => {
          if (Nakama.socket !== null) {
            Nakama.socket.onmatchdata = (result: OpCodeAndMessage) => {
      
              console.log(`onmatchdata: ${result.op_code}`, result.data)
              switch (result.op_code) {
                case OpCode.START:
                  console.log("start received:", result)
                  const startMsg = result.data as StartMessage;
                  gameStarted = true
      
                  
                  setPlayerTurn(startMsg)
                  board = startMsg.board // so after restart the board is updated
                  break
                case OpCode.UPDATE:  
                  const updateMsg = result.data as UpdateMessage
                  console.log("update received:", updateMsg)
                  
                  board = updateMsg.board
                  updatePlayerTurn()
                  break
                case OpCode.DONE:
                  console.log("DONE received:", result)
                  endGame(result.data as DoneMessage)
                  break
                default:
                  console.log('unhandled message received:', result)
              }
            }
          }
        }
      
      
      
          
        nakamaListener()
      
      
      }
      
      



    return {
   
    };
};