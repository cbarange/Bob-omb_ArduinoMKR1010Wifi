const WebSocket  = require('ws')
const mqtt = require('mqtt')




const wss = new WebSocket.Server({port: 8080})
CLIENTS=[]

const mqtt_client  = mqtt.connect('mqtt://localhost:1883')

// let player = { id: 'new-player', value: { color: 'red' } }
// let tile = { id: 'tile', value: { x: 5, y: 5, color: 'red' } }
// let score = { id: 'score', value: [1,2,3,4] }
  
  

let players_available = ["red", "green", "yellow", "blue"]
let players = [] // RED GREEN YELLOW BLUE  
let current_player = 0
let board = Array(15).fill().map(e=>e=Array(15).fill("")) // 15x15 board game
let cursor = {'x':0, 'y':0}

console.table(board)


  


const register =  message => {  
  if (players.find(e=>e.id==message) == undefined) {
    console.log()
  }

  let color = players_available.shift(0)
  mqtt_client.publish(`${message}/color`, color)
  mqtt_client.subscribe(`${message}/move`, err => {} )
  console.log(`New player join the game ${message}→${color}`)
  players.push({'color':color, 'id':message})
  CLIENTS.map(e=>e.send(JSON.stringify({id:'new-player', value:{color:color}})))
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
      CLIENTS.map(e=>e.send(JSON.stringify({id:'cursor', value:{...cursor, color:player.color}})) )
    break;
    case 'RIGHT':
      cursor.x = cursor.x<14?cursor.x+1:14
      CLIENTS.map(e=>e.send(JSON.stringify({id:'cursor', value:{...cursor, color:player.color}})) )
    break;
    case 'DOWN':
      cursor.y = cursor.y<14?cursor.y+1:14
      CLIENTS.map(e=>e.send(JSON.stringify({id:'cursor', value:{...cursor, color:player.color}})) )
    break;
    case 'LEFT':
      cursor.x = cursor.x>0?cursor.x-1:0
      CLIENTS.map(e=>e.send(JSON.stringify({id:'cursor', value:{...cursor, color:player.color}})) )
    break;
    case 'SELECT':
      board[cursor.y][cursor.x]=player.color
      current_player = (current_player+1)%players.length
      CLIENTS.map(e=>e.send(JSON.stringify({id:'tile', value:{...cursor, color:player.color}})) )
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



wss.on('connection', ws => {
  CLIENTS.push(ws)
  console.log('New ws client')
} )



  
