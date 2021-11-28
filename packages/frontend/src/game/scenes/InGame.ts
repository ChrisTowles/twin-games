
import { Board, OpCode, DoneMessage, UpdateMessage, markToString, StartMessage, OpCodeAndMessage, Mark } from '@twin-games/shared'
import { CONFIG } from '../config'
import Nakama from '../nakama'


type Position = {
  [key: number]: {x: number; y: number, imageHandle: Phaser.GameObjects.Image | null}
}

export default class InGame extends Phaser.Scene {
  private INDEX_TO_POS: Position = { }

  private gameStarted = false
  private playerTurn = false
  private headerText: Phaser.GameObjects.Text | null = null
  private phaser = this
  private playerMark: Mark | null = null

  constructor() {
    super('in-game')

    this.phaser = this
  }

  // ep4
  updateBoard(board: Board) {
    board.forEach((element: Mark | null, index: number) => {
      const newImage = this.INDEX_TO_POS[index]
      if (element === Mark.O && newImage.imageHandle === null) {
         newImage.imageHandle = this.phaser.add.image(newImage.x, newImage.y, 'O')
      } else if (element === Mark.X && newImage.imageHandle === null) {
        newImage.imageHandle =this.phaser.add.image(newImage.x, newImage.y, 'X')
      }       
    })
  }

  updatePlayerTurn() {
    this.playerTurn = !this.playerTurn

    if (this.playerTurn)
      this.headerText!.setText(`Your turn! (${markToString(this.playerMark)})`)

    else
      this.headerText!.setText('Opponents turn!')
  }
  updatePlayerMark(data: StartMessage) {
    const userId = localStorage.getItem('user_id')

    
    if (data.marks[userId!] === data.mark) {
      this.playerMark = data.mark
     
    }
    else {
      // if not our turn, then we have the other mark.
      this.playerMark = data.mark === Mark.X ? Mark.O : Mark.X
    }
  }
  setPlayerTurn(data: StartMessage) {
    const userId = localStorage.getItem('user_id')


    if (data.marks[userId!] === data.mark) {
      this.playerTurn = true
      this.playerMark = data.mark
      this.headerText!.setText(`Your turn! - (${markToString(this.playerMark)})`)
    }
    else {
      this.headerText!.setText('Opponents turn!')
    }
  }

  endGame(data: DoneMessage) {
    this.updateBoard(data.board)

    if (data.winner === this.playerMark)
      this.headerText!.setText('Winner!')

    else
      this.headerText!.setText('You loose :(')
  }

  // ep4
  nakamaListener() {
    if (Nakama.socket !== null) {
      Nakama.socket.onmatchdata = (result: OpCodeAndMessage) => {

        console.log(`onmatchdata: ${result.op_code}`, result.data)
        switch (result.op_code) {
          case OpCode.START:
            console.log("start received:", result)
            const startMsg = result.data as StartMessage;
            this.gameStarted = true

            Object.keys(this.INDEX_TO_POS).forEach((elementKey) => {
              const element = this.INDEX_TO_POS[elementKey as any]
              
              if (element.imageHandle !== null) {
                console.log('destroy element', element)
                element.imageHandle.destroy(true)
                element.imageHandle = null
              }
            })
            this.updatePlayerMark(startMsg)
            this.setPlayerTurn(startMsg)
            this.updateBoard(startMsg.board) // so after restart the board is updated
            break
          case OpCode.UPDATE:  
            const updateMsg = result.data as UpdateMessage
            console.log("update received:", updateMsg)
            
            this.updateBoard(updateMsg.board)
            this.updatePlayerTurn()
            break
          case OpCode.DONE:
            console.log("DONE received:", result)
            this.endGame(result.data as DoneMessage)
            break
          default:
            console.log('unhandled message received:', result)
        }
      }
    }
  }

  preload() {
    this.load.image('X', 'assets/X.png')
    this.load.image('O', 'assets/O.png')
  }

  create() {
    this.headerText = this.add
      .text(CONFIG.WIDTH / 2, 125, 'Waiting for game to start', {
        fontFamily: 'Arial',
        fontSize: '36px',
      })
      .setOrigin(0.5)

    const gridWidth = 300
    const gridCellWidth = gridWidth / 3

    const grid = this.add.grid(
      CONFIG.WIDTH / 2,
      CONFIG.HEIGHT / 2,
      gridWidth,
      gridWidth,
      gridCellWidth,
      gridCellWidth,
      0xFFFFFF,
      0,
      0xFFCA27,
    )

    const gridCenterX = grid.getCenter().x
    const gridCenterY = grid.getCenter().y

    const topY = gridCenterY - gridCellWidth
    const bottomY = gridCenterY + gridCellWidth

    const gridLeft = gridCenterX - gridCellWidth
    const gridRight = gridCenterX + gridCellWidth

    this.INDEX_TO_POS = {
      0: { x: gridLeft, y: topY, imageHandle: null },
      1: { x: gridCenterX, y: topY, imageHandle: null },
      2: { x: gridRight, y: topY , imageHandle: null },

      3: { x: gridLeft, y: gridCenterY , imageHandle: null },
      4: { x: gridCenterX, y: gridCenterY , imageHandle: null },
      5: { x: gridRight, y: gridCenterY , imageHandle: null },

      6: { x: gridLeft, y: bottomY , imageHandle: null },
      7: { x: gridCenterX, y: bottomY , imageHandle: null },
      8: { x: gridRight, y: bottomY , imageHandle: null },
    }

    this.nakamaListener()

    this.add
      .rectangle(
        gridCenterX - gridCellWidth,
        topY,
        gridCellWidth,
        gridCellWidth,
      )
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', async() => {
        await Nakama.makeMove(0)
      })

    this.add
      .rectangle(gridCenterX, topY, gridCellWidth, gridCellWidth)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        Nakama.makeMove(1)
      })

    this.add
      .rectangle(
        gridCenterX + gridCellWidth,
        topY,
        gridCellWidth,
        gridCellWidth,
      )
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        Nakama.makeMove(2)
      })

    this.add
      .rectangle(
        gridCenterX - gridCellWidth,
        gridCenterY,
        gridCellWidth,
        gridCellWidth,
      )
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        Nakama.makeMove(3)
      })

    this.add
      .rectangle(gridCenterX, gridCenterY, gridCellWidth, gridCellWidth)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        Nakama.makeMove(4)
      })

    this.add
      .rectangle(
        gridCenterX + gridCellWidth,
        gridCenterY,
        gridCellWidth,
        gridCellWidth,
      )
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        Nakama.makeMove(5)
      })

    this.add
      .rectangle(
        gridCenterX - gridCellWidth,
        bottomY,
        gridCellWidth,
        gridCellWidth,
      )
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        Nakama.makeMove(6)
      })

    this.add
      .rectangle(gridCenterX, bottomY, gridCellWidth, gridCellWidth)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        Nakama.makeMove(7)
      })

    this.add
      .rectangle(
        gridCenterX + gridCellWidth,
        bottomY,
        gridCellWidth,
        gridCellWidth,
      )
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        Nakama.makeMove(8)
      })
  }
}

