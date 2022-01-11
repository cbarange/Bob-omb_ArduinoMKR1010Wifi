const WebSocket  = require('ws')
const mqtt = require('mqtt')


const wss = new WebSocket.Server({port: 8080})
const mqtt_client  = mqtt.connect('mqtt://localhost:3000')


let players_available = ["red", "green", "yellow", "blue"]
let players = [] // RED GREEN YELLOW BLUE  
let current_player = 0
let board = Array(15).fill().map(e=>e=Array(15).fill("")) // 15x15 board game
let cursor = {'x':0, 'y':0}

console.table(board)

const register =  message => {  
  let color = players_available.shift(0)
  mqtt_client.publish(`${message}/color`, color)
  mqtt_client.subscribe(`${message}/move`, err => {} )
  console.log(`New player join the game ${message}→${color}`)
  players.push({'color':color, 'id':message})
}

const move = (topic, message) => {
  let player_id = topic.split('/')[0]  
  let index = players.reduce((r,v,i)=> v.id==player_id?r=i:r=r, undefined)
  let player = players[index]
  if (index!=current_player || index==undefined)
    return

  console.log(`Current player idx:${current_player}, id:${player_id}, color:${player.color}, cursor:${JSON.stringify(cursor)}, move:${message}`)

  switch(message.toString()){
    case 'UP':
      cursor.y = cursor.y>0?cursor.y-1:0
    break;
    case 'RIGHT':
      cursor.x = cursor.x<14?cursor.x+1:14
    break;
    case 'DOWN':
      cursor.y = cursor.y<14?cursor.y+1:14
    break;
    case 'LEFT':
      cursor.x = cursor.x>0?cursor.x-1:0
    break;
    case 'SELECT':
      board[cursor.x][cursor.y]=player.color
      current_player = (current_player+1)%players.length
    break;
    case 'DEBUG':
      console.table(board)
      console.log(`CurrentPlayer:${current_player}, Players:${JSON.stringify(players)}, Available:${JSON.stringify(players_available)}`)
    break;
    default:
      console.log(`⚠ Unknown move:${message}`)
  }
}


mqtt_client.on('connect', () => mqtt_client.subscribe('register', err => {} ) )
mqtt_client.on('message', function (topic, message) {
  // message is Buffer
  if (topic == "register"){
    register(message)
  } else if (topic.endsWith('move')){
    move(topic, message)
  } else {
    console.log(`⚠WARN, unknown MQTT TOPIC ${topic}, Message: ${message.toString()}`)  
  }
  // mqtt_client.end()
})




// wss.on('connection', ws => {
//     ws.on('message', message => {
//         console.log(`Message received ${message}`)
//     })
    
//     let player = {
//         id: 'new-player',
//         value: {
//             color: colors[Math.floor(Math.random() * colors.length)]
//         }
//     }

//     ws.send(JSON.stringify(player))

//     setInterval(function(){
//         let tile = {
//             id: 'tile',
//             value: {
//                 x: Math.floor(Math.random() * 15),
//                 y: Math.floor(Math.random() * 15),
//                 color: colors[Math.floor(Math.random() * colors.length)]
//             }
//         }
//         console.log('new message')
//         ws.send(JSON.stringify(tile))
//         let score = {
//             id: 'score',
//             value: Array(4).fill(0).map(el => Math.floor(Math.random() * (15*15)))
//         }
//         ws.send(JSON.stringify(score))

//         let nb = Math.floor(Math.random() * 300)
//         if( nb >= 295 ){
//             let reset = {
//                 id: 'reset'
//             }
//             console.log('reset game')
//             ws.send(JSON.stringify(reset))
//         }
        
//         nb = Math.floor(Math.random() * 100)
//         if( nb >= 75 ){
//             let player = {
//                 id: 'new-player',
//                 value: {
//                     color: colors[Math.floor(Math.random() * colors.length)]
//                 }
//             }
        
//             ws.send(JSON.stringify(player))
//         }
        
//         nb = Math.floor(Math.random() * 100)
//         if( nb >= 95 ){
//             let player = {
//                 id: 'remove-player',
//                 value: {
//                     color: colors[Math.floor(Math.random() * colors.length)]
//                 }
//             }
        
//             ws.send(JSON.stringify(player))
//         }
//     }, 1000)    
// })