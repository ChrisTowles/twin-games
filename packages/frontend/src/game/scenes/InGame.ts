
import { Board, OpCode, DoneMessage, UpdateMessage, StartMessage, OpCodeAndMessage } from '@twin-games/shared'
import { CONFIG } from '../config'
import Nakama from '../nakama'

type Position = {
  [key: number]: {x: number; y: number}
}

export default class InGame extends Phaser.Scene {
  private INDEX_TO_POS: Position = { }

  private gameStarted = false
  private playerTurn = false
  private headerText: Phaser.GameObjects.Text | null = null
  private phaser = this
  private playerPos = {}

  constructor() {
    super('in-game')

    this.phaser = this
  }

  // ep4
  updateBoard(board: Board) {
    board.forEach((element: any, index: number) => {
      const newImage = this.INDEX_TO_POS[index]

      if (element === 1)
        this.phaser.add.image(newImage.x, newImage.y, 'O')

      else if (element === 2)
        this.phaser.add.image(newImage.x, newImage.y, 'X')
    })
  }

  updatePlayerTurn() {
    this.playerTurn = !this.playerTurn

    if (this.playerTurn)
      this.headerText!.setText('Your turn!')

    else
      this.headerText!.setText('Opponents turn!')
  }

  setPlayerTurn(data: StartMessage) {
    const userId = localStorage.getItem('user_id')

    if (data.marks[userId!] === 1) {
      this.playerTurn = true
      this.playerPos = 1
      this.headerText!.setText('Your turn!')
    }
    else {
      this.headerText!.setText('Opponents turn!')
    }
  }

  endGame(data: DoneMessage) {
    this.updateBoard(data.board)

    if (data.winner === this.playerPos)
      this.headerText!.setText('Winner!')

    else
      this.headerText!.setText('You loose :(')
  }

  // ep4
  nakamaListener() {
    if (Nakama.socket !== null) {
      Nakama.socket.onmatchdata = (result: OpCodeAndMessage) => {

        console.log(`updateMsg: ${result.op_code}`, result.data)
        switch (result.op_code) {
          case OpCode.START:
            const startMsg = result.data as StartMessage;
            this.gameStarted = true
            this.setPlayerTurn(startMsg)
            break
          case OpCode.UPDATE:  
            const updateMsg = result.data as UpdateMessage
            console.log(updateMsg)
            
            this.updateBoard(updateMsg.board)
            this.updatePlayerTurn()
            break
          case OpCode.DONE:
            this.endGame(result.data as DoneMessage)
            break
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
      0: { x: gridLeft, y: topY },
      1: { x: gridCenterX, y: topY },
      2: { x: gridRight, y: topY },

      3: { x: gridLeft, y: gridCenterY },
      4: { x: gridCenterX, y: gridCenterY },
      5: { x: gridRight, y: gridCenterY },

      6: { x: gridLeft, y: bottomY },
      7: { x: gridCenterX, y: bottomY },
      8: { x: gridRight, y: bottomY },
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
