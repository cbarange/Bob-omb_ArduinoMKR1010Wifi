import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'

import Bob_Omb from '../medias/bob-omb.png'
import '../css/Grid.css'

const colors = ['gray', 'green']

class Tile {
    constructor(x, y, color) {
        this.x = x
        this.y = y
        this.color = color
      }
}

export const Grid = forwardRef((props, ref) =>  {
    const [size] = useState(15)
    const [grid, setGrid] = useState([[]])
    const [cursor, setCursor] = useState(new Tile(0, 5, 'red'))

    const createNewGrid = () => {
        // let newGrid = Array(size).fill(0).map((row, x) => new Array(size).fill(0).map((tile, y) => new Tile(x, y, colors[Math.floor(Math.random() * colors.length)])))
        let newGrid = Array(size).fill(0).map((row, x) => new Array(size).fill(0).map((tile, y) => new Tile(x, y, 'gray')))
        setGrid(newGrid)
    }

    const displayBomb = (tile) => {
        let isCursor = (tile.x === cursor.x && tile.y === cursor.y)
        if (tile.color === 'gray') {
            return (
            <div key={`${tile.x}-${tile.y}`} className={`tile ${isCursor ? `cursor-${cursor.color}` : ''}`} onClick={() => changeTile(tile.x, tile.y, 'red')}></div>
            )
        } else {
            return (
            <div key={`${tile.x}-${tile.y}`} className={`tile ${tile.color} ${isCursor ? `cursor-${cursor.color}` : ''}`}>
                <img alt='bob-omb' src={Bob_Omb} />
            </div>
            )
        }
    }

    const changeTile = (x, y, color) => {
        let updatedGrid = grid
        updatedGrid[x][y] = new Tile(x, y, color)
        setGrid(updatedGrid)
    }
    
    useEffect(() => {
        createNewGrid()
    }, [])

    useImperativeHandle(ref, () => ({

        updateGrid(x, y, color) {
            changeTile(x, y, color)
        },

        resetGame() {
            createNewGrid()
        },

        changeCursor(x, y, color){
            setCursor(new Tile(x, y, color))
        }
    
    }))
    
    return (
        <div className='board'>
            { grid.map( (row, x) => 
                <div className='row' key={x}>
                    {row.map(((tile, y) => {
                        return(
                            displayBomb(tile)
                        )
                    }))}
                </div>
                ) 
            }
        </div>
    )
})