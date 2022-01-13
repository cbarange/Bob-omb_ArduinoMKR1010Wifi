import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'

import Bob_Omb from '../medias/bob-omb.png'
import '../css/Grid.css'

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
    const [cursor, setCursor] = useState(new Tile(0, 0, 'gray'))

    const createNewGrid = () => {
        // let newGrid = Array(size).fill(0).map((row, x) => new Array(size).fill(0).map((tile, y) => new Tile(x, y, colors[Math.floor(Math.random() * colors.length)])))
        let newGrid = Array(size).fill(0).map((row, x) => new Array(size).fill(0).map((tile, y) => new Tile(x, y, 'gray')))
        setGrid(newGrid)
    }

    const displayBomb = (tile) => {
        let isCursor = (tile.x === cursor.x && tile.y === cursor.y)
        if (tile.color === 'gray') {
            return (
            <div key={`${tile.x}-${tile.y}`} className={`tile ${isCursor ? `cursor-${cursor.color}` : ''}`} onClick={() => clickOnTile(tile.x, tile.y)}></div>
            )
        } else {
            return (
            <div key={`${tile.x}-${tile.y}`} className={`tile ${tile.color} ${isCursor ? `cursor-${cursor.color}` : ''}`}>
                <img alt='bob-omb' src={Bob_Omb} />
            </div>
            )
        }
    }

    const clickOnTile = (x, y) => {
        props.parentCallback(x, y)
    }

    const countScores = () => {
        let red = grid.flatMap(row => row.filter(tile => tile.color == 'red')).length
        let green = grid.flatMap(row => row.filter(tile => tile.color == 'green')).length 
        let yellow = grid.flatMap(row => row.filter(tile => tile.color == 'yellow')).length
        let blue = grid.flatMap(row => row.filter(tile => tile.color == 'blue')).length
        console.log([red, green, yellow, blue])
        return [red, green, yellow, blue] 
    }

    const changeTile = (x, y, color) => {
        let updatedGrid = grid
        updatedGrid[x][y] = new Tile(x, y, color)
        setGrid([...updatedGrid])
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
        },

        getScores(){
            return countScores()
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