import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { w3cwebsocket as WebSocket } from 'websocket';
import { Grid } from './Grid'

import Bowser from '../medias/Bowserjr_MP9.png'
import '../css/Game.css'

const client = WebSocket(`ws://192.168.1.103:8080`)

const colors = ['red', 'green', 'yellow', 'blue']

export const Game = () => {
    const [scores, setScores] = useState(Array(4).fill(0))
    const [players, setPlayers] = useState(Array(4).fill(false))
    const childRef = useRef();

    useEffect(() => {
        client.onopen = () => {
            console.log('WebSocket Client Connected')
        };
        client.onmessage = (message) => {
            let data = JSON.parse(message.data)
            console.log(data);
            if(data.id === 'score'){
                let updatedScores = scores
                updatedScores = data.value
                setScores([...updatedScores])
            }
            if(data.id === 'tile'){
                childRef.current.updateGrid(data.value.x, data.value.y, data.value.color)

            }
            if(data.id === 'cursor'){
                childRef.current.changeCursor(data.value.x, data.value.y, data.value.color)
            }
            if(data.id === 'new-player'){
                let updatedPlayers = players
                updatedPlayers[colors.findIndex(element => element == data.value.color)] = true
                setPlayers([...updatedPlayers])
            }
            if(data.id === 'remove-player'){
                let updatedPlayers = players
                updatedPlayers[colors.findIndex(element => element == data.value.color)] = false
                setPlayers([...updatedPlayers])
            }
            if(data.id === 'reset'){
                childRef.current.resetGame()
            }
        }
    
        client.onclose = function (e) {
            console.log('Disconnected!');
        };
    
        client.onerror = (message) => {
            console.log(`Error: ${message}`)
        }
      }, [])

    const DisplayTeam = ((props, ref) => {
        if(players[props.team_id]){
            return(
                <div className={`scores ${colors[props.team_id]}`} >
                    <div>
                        {colors[props.team_id]} team
                    </div>
                    <div>
                        {scores[props.team_id]} pts
                    </div>
                    <img alt='bowser-jr' src={Bowser} />
                </div>
            )
        } else {
            return(
                <span/>
            )
        }
        
    })
    

    return (
        <div className='container'>
            <div className='title'>Bob-omb Reverse</div>
            <div className='bottom'>
                <div className='column'>
                    <DisplayTeam team_id={0}/>
                    <DisplayTeam team_id={2}/>
                </div>
                <Grid ref={childRef} />
                <div className='column'>
                    <DisplayTeam team_id={1}/>
                    <DisplayTeam team_id={3}/>
                </div>
            </div>
        </div>
    )
}