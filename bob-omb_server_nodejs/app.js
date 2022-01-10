const WebSocket  = require('ws')

const wss = new WebSocket.Server({port: 8080})

const colors = ['red', 'green', 'yellow', 'blue']



const mqtt = require('mqtt')
const client  = mqtt.connect('mqtt://localhost:3000')

let players = [] // RED GREEN YELLOW BLUE  
let current_player = ""
let board = Array(15).fill().map(e=>e=Array(15).fill("")) // 15x15 board game

console.table(board)

const register =  message => {
  
  let color = "RED"
  client.publish(`${message}/color`, color)
  client.subscribe(`${message}/move`, err => {} )
  console.log(`New player join the game ${message}→${color}`)

}

const move = message => {}


client.on('connect', () => client.subscribe('register', err => {} ) )
client.on('message', function (topic, message) {
  // message is Buffer
  if (topic == "register"){
    register(message)
  } else if (topic.endsWith('move')){
    move(message)
  } else {
    console.log(`⚠WARN, unknown MQTT TOPIC ${topic}, Message: ${message.toString()}`)  
  }
  // client.end()
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