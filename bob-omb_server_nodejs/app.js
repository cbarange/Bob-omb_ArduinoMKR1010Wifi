const WebSocket  = require('ws')
const mqtt = require('mqtt')


const mqtt_client  = mqtt.connect('mqtt://localhost:1883')

const wss = new WebSocket.Server({port: 8080})
CLIENTS=[]


// let player = { id: 'new-player', value: { color: 'red' } }
// let tile = { id: 'tile', value: { x: 5, y: 5, color: 'red' } }
// let score = { id: 'score', value: [1,2,3,4] }
  
  

let players_available = ["red", "green", "yellow", "blue"]
let players = [] // RED GREEN YELLOW BLUE  
let current_player = 0
let board_size = 15
let board = Array(board_size).fill().map(e=>e=Array(board_size).fill("")) // 15x15 board game
let cursor = {'x':0, 'y':0}

console.table(board)

const new_move_board = (color, board, cursor) => {
  
  console.table(board)
  coef={'down':{'x':1 ,'y':0}, 'up':{'x':-1 ,'y':0}, 'left':{'x':0 ,'y':-1}, 'right':{'x':0,'y':1}, 'down_right':{'x':1 ,'y':1},'down_left':{'x':1 ,'y':-1}, 'up_right':{'x':-1 ,'y':1}, 'up_left':{'x':-1 ,'y':-1}}
  for(let prop in coef)
    coef[prop].status="suitable"

  to_color = []

  for(let axe in coef){
    for(let i=1;i<board_size;i++){
      let x = (i*coef[axe].x)+cursor.x
      let y = (i*coef[axe].y)+cursor.y
      if(0<=x && x<board_size && 0<=y && y<board_size)
        if(board[x][y]!=''){
          if(coef[axe].status=="suitable"){
            if(board[x][y]!=color){
              //board[x][y]='v'
              to_color.push({'x':x,'y':y, 'axe':axe})            
            } else if(board[x][y]==color){
              coef[axe].status="done"
            }
          }
        } else if (coef[axe].status!="done") {
          coef[axe].status="find_empty"
        }
    }
  }

  to_color = to_color.filter(e=>coef[e.axe].status=="done")
  console.table(to_color)
  

  to_color.map(e=>board[e.x][e.y]=color)
  to_color.map(e=> CLIENTS.map(c=> c.send(JSON.stringify({id:'tile', value:{x:e.x,y:e.y, color:color}})) ))
  console.table(board)
}

const register =  message => {  
  let player = players.find(e=>e.id==message)
  if (player != undefined) {
    mqtt_client.publish(`${message}/color`, player.color)  
    console.log(`Player reconnected ${message}→${player.color}`)
  } else {
    let color = players_available.shift(0)
    mqtt_client.publish(`${message}/color`, color)
    mqtt_client.subscribe(`${message}/move`, err => {} )
    console.log(`New player join the game ${message}→${color}`)
    players.push({'color':color, 'id':message})
    CLIENTS.map(e=>e.send(JSON.stringify({id:'new-player', value:{color:color}})))
  }
}

const move = (topic, message) => {
  let player_id = topic.split('/')[0]  
  let index = players.reduce((r,v,i)=> v.id==player_id?r=i:r=r, undefined)
  let player = players[index]
  if (index!=current_player || index==undefined)
    return

  console.log(`Current player idx:${current_player}, id:${player_id}, color:${player.color}, cursor:${JSON.stringify(cursor)}, move:${message}`)

  switch(message){
    case 'UP':
      cursor.x = cursor.x>0?cursor.x-1:14
      CLIENTS.map(e=>e.send(JSON.stringify({id:'cursor', value:{...cursor, color:player.color}})) )
    break;
    case 'RIGHT':
      cursor.y = cursor.y<14?cursor.y+1:0
      CLIENTS.map(e=>e.send(JSON.stringify({id:'cursor', value:{...cursor, color:player.color}})) )
    break;
    case 'DOWN':
      cursor.x = cursor.x<14?cursor.x+1:0
      CLIENTS.map(e=>e.send(JSON.stringify({id:'cursor', value:{...cursor, color:player.color}})) )
    break;
    case 'LEFT':
      cursor.y = cursor.y>0?cursor.y-1:14
      CLIENTS.map(e=>e.send(JSON.stringify({id:'cursor', value:{...cursor, color:player.color}})) )
    break;
    case 'SELECT':
      if(board[cursor.x][cursor.y]!='')
        break;      
      board[cursor.x][cursor.y]=player.color
      CLIENTS.map(e=>e.send(JSON.stringify({id:'tile', value:{...cursor, color:player.color}})) )
      current_player = (current_player+1)%players.length
      CLIENTS.map(e=>e.send(JSON.stringify({id:'cursor', value:{...cursor, color:players[current_player].color}})) )
      new_move_board(player.color, board, cursor)

      break;
    case 'RESET':
      current_player = 0
      cursor = {'x':0, 'y':0}
      board = Array(15).fill().map(e=>e=Array(15).fill("")) // 15x15 board game
      CLIENTS.map(e=>e.send(JSON.stringify({id:'reset'})) )
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
    register(message.toString())
  } else if (topic.endsWith('move')){
    move(topic, message.toString())
  } else {
    console.log(`⚠WARN, unknown MQTT TOPIC ${topic}, Message: ${message.toString()}`)  
  }
  // mqtt_client.end()
})



wss.on('connection', ws => {
  CLIENTS.push(ws)
  players.map(e=>ws.send(JSON.stringify({id:'new-player', value:{color:e.color}})))
  board.map((col, col_idx)=>col.map((row, row_idx)=>row!=''?ws.send(JSON.stringify({id:'tile', value:{x:row_idx, y:col_idx,color:row}})):{}))
  if (players.length>0)
    ws.send(JSON.stringify({id:'cursor', value:{...cursor, color:players[current_player].color}}))
  console.log('New websocket client')

  ws.on('message', message => {
    cursor = JSON.parse(message.toString())
    move(`${players[current_player].id}/move`, 'SELECT')
  })

} )

