const express = require('express');
const uuid = require('node-uuid');
const fs = require('fs');
const parse = require('csv-parse');
var path = require('path');

const app = express();
var server = require('http').createServer(app);
// Tell the app to look for static files in these directories
app.use(express.static('./build/'));
app.use(express.static('./audios/'));

// Redirect to all routes not defined

app.get('/chatDirector', function(req, res) {
  console.log(__dirname);
  res.sendFile(path.join(__dirname, '../build/index.html'), function(err) {
    if (err) res.status(500).send(err)
  })
});
app.get('/chatProjector', function(req, res) {
  res.sendFile(path.join(__dirname, '../build/index.html'), function(err) {
    if (err) res.status(500).send(err)
  })
});
app.get('/chatActor', function(req, res) {
  res.sendFile(path.join(__dirname, '../build/index.html'), function(err) {
    if (err) res.status(500).send(err)
  })
});
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../build/index.html'), function(err) {
    if (err) res.status(500).send(err)
  })
});
// Set Port, hosting services will look for process.env.PORT
app.set('port', 80);
// Start the server
app.listen(app.get('port'), () => {
	console.log('start server 80');
});

var objTheaterPlay;
fs.readFile('./guion_CAT.json', 'utf8', function (err, data) {
  if (err) throw err;
  objTheaterPlay = JSON.parse(data);
  console.log(objTheaterPlay[0].titulo);
});

var allMessages = [];
var allClients = [];
var users = [];
var messageSceneCounter = 0;
var sceneNumber = 0;
var rolesAsigned = 0;
var rolesAr = [];
var lastMessageSend = 0;
var messageCue = [];
var timeBetweenMessages = 15000;
var screenPosition = 1;
var soundDirector = 0;
var blockNewMessages = false;
var csvSounds = [];
var totalSampleAudios = 70;

// Setup websockets
var io = require('socket.io')({ port:8001,wsEngine: 'ws' });//8081
// Setup message cue
var timer = setInterval(function(){
  if(messageCue.length>0){
    for(var i=0;i<messageCue.length;i++){
      var currentTime = 0;
      if(messageCue.timeToSend< currentTime){
        /*
        socket.broadcast.emit('newMessage',
        {
          'message':data
        });
        */
      }
    }
  }
},1000);

function countMessage(socket){
  messageSceneCounter +=1;
  var messageSceneCue = messageCue.length;
  socket.broadcast.emit('messageSceneCounter', {messageSceneCounter:messageSceneCounter,messageSceneCue:messageSceneCue});
}

function saveMessage(data){
  console.log("socket save");
  const fs = require('fs');
  fs.appendFile('chat.csv', data+'\r\n', function (err) {
    if (!err) console.log('Saved!');
  });
}

function loadCSV(file){
  var csvData = [];
  fs.createReadStream(file)
    .pipe(parse({delimiter: ','}))
    .on('data', function(csvrow) {
        csvData.push(csvrow);
    })
    .on('end',function() {
      csvSounds = csvData;//.reverse();
    });
}

function sendSceneInformation(socket){
  var data =  {
    screenPosition:screenPosition,
    sceneTitle:objTheaterPlay[sceneNumber].titulo,
    sceneDescription: objTheaterPlay[sceneNumber].descripcion,
    sceneNumber:sceneNumber,
    totalScene:objTheaterPlay.length,
    messageSceneCounter:messageSceneCounter,
    rolesAsigned:rolesAsigned,
    totalRoles:objTheaterPlay[sceneNumber].personajes.length,
    totalRolesExtra:objTheaterPlay[sceneNumber].personajesExtra.length,
    allCharacterAsigned: (objTheaterPlay[sceneNumber].personajes.length<=rolesAsigned)
  };
  socket.broadcast.emit('sceneInfo', data);
  socket.emit('sceneInfo', data);
}

function rebootWifi(){

}

function sendUsers(socket){
  socket.broadcast.emit('newUserList',rolesAr);
  socket.emit('newUserList',rolesAr);
}

function checkIfSocketHasNoneRole(id){
  for(var i=0;i<rolesAr.length;i++){
    if(rolesAr[i].id==id) return false;
  }
  // not found id
  return true;
}

function getRole(id){
  for(var i=0;i<rolesAr.length;i++){
    if(rolesAr[i].id==id) return rolesAr[i].nickname;
  }
  return '';
}

function getSoundRole(id){
  for(var i=0;i<rolesAr.length;i++){
    if(rolesAr[i].id==id) return rolesAr[i].sound;
  }
  return '';
}

function getIsRoleActive(id){
  for(var i=0;i<rolesAr.length;i++){
    if(rolesAr[i].id==id) return rolesAr[i].activated;
  }
  return false;
}

function findTimeToPublish(){
  if(messageCue.length>0){
    return messageCue[messageCue.length-1].timeToBePublish + timeBetweenMessages;
  }else{
    return lastMessageSend + timeBetweenMessages;
  }
}

function deleteAllRolesAssigned(socket){
  socket.emit('assignActor','');
  socket.broadcast.emit('assignActor','');
}

function sendLastScene(socket){
  blockNewMessages = true;
  var randomMessagesAr = [];
  for(var i=0;i<csvSounds.length;i++){
    var indexRandom = Math.floor((allMessages.length-1) * Math.random());
    //console.log('indexRandom:',indexRandom,'-',allMessages.length)
    randomMessagesAr.push(allMessages[indexRandom]);
  }
  console.log('startLastScene',csvSounds.length,randomMessagesAr.length);
  socket.broadcast.emit('startLastScene',randomMessagesAr);
  socket.emit('startLastScene', randomMessagesAr);
}

function resetScene(socket){
  blockNewMessages = false;
  rolesAsigned = 0;
  messageSceneCounter = 0;
  deleteAllRolesAssigned(socket);
  rolesAr = [];
  sendUsers(socket);
  sendSceneInformation(socket);
}

function changeScene(socket){
  socket.broadcast.emit('fadeOutInChatScene',{});
  socket.emit('fadeOutInChatScene', {});

  setTimeout(function(){
    if(objTheaterPlay.length>(sceneNumber+1)) sceneNumber +=1;
    resetScene(socket);
    console.log("Call Change Scene",sceneNumber ,objTheaterPlay.length-1);
    // Last scene exception
    if(sceneNumber == objTheaterPlay.length-2){
      sendLastScene(socket);
    }
  },5000);
}
/*
setTimeout(function(){
  resetScene(socket);
},2000);
*/
io.on('connection', function (socket) {
  var me = {
        id:         uuid.v4(),
        client:     socket.id,
        nickname:   null,
        joinedAt:   new Date().getTime()
  };
  allClients.push(socket);
  users.push(me);

  console.log("socket connected");

  socket.on('logMessage', function (data) {
    console.log(data);
  });

  socket.on('connectMessage', function (data) {
    console.log(data);
    sendSceneInformation(socket);
  });

  socket.on('addExtraToScene', function (data) {
    if(objTheaterPlay[sceneNumber].personajesExtra.length>0){
      objTheaterPlay[sceneNumber].personajes.push( objTheaterPlay[sceneNumber].personajesExtra.pop());
    }
    sendSceneInformation(socket);
  });

  // Activate and disactivated
  socket.on('roleAdmin', function (data) {
    try{
      console.log('call role Admin :',rolesAr[data.index].activated);
      rolesAr[data.index].activated = data.activated;
      sendUsers(socket);
    }catch(err){}
  })

  socket.on('publicMessage', function (data) {
    if(blockNewMessages) return;

    if( checkIfSocketHasNoneRole(this.id) && objTheaterPlay[sceneNumber].personajes.length>rolesAsigned){
      var nickname = objTheaterPlay[sceneNumber].personajes[rolesAsigned];
      socket.emit('assignActor',nickname);
      //rolesIdAr.push(this.id);

      rolesAr.push({'id':this.id,'nickname':nickname,'activated':true,'sound':(1+Math.floor(Math.random()*totalSampleAudios))})

      rolesAsigned += 1;
      sendSceneInformation(socket);
      sendUsers(socket);
    }

    var currentTimestamp = Date.now();
    var role = getRole(this.id);
    var roleIsActive = getIsRoleActive(this.id);
    var sound = getSoundRole(this.id);
    if(role!="" && roleIsActive){
      if( messageCue.length>0 || (lastMessageSend + timeBetweenMessages)>currentTimestamp ){
        lastMessageSend = currentTimestamp;
        messageCue.push({
          'message':data,
          timeToBePublish:findTimeToPublish()
        });
      }else{
        console.log('Send text to chat');
        var message = {'id':this.id,'type':'public','message':data, 'from':role,'sound':sound};
        // send message
        socket.broadcast.emit('newMessage', message );
        socket.emit('newMessage', message );
        // Store message
        allMessages.push(message);
        // Save message
        countMessage(socket);
        saveMessage(role+" : "+data);
      }
    }
    // Send that all role are assigned
    if(checkIfSocketHasNoneRole(this.id) && objTheaterPlay[sceneNumber].personajes.length>=rolesAsigned){
      //socket.emit('assignActor',objTheaterPlay[sceneNumber].personajes[rolesAsigned]);
    }
  });

  socket.on('directorMessage', function (data) {
    // send message
    var message = {'message':'('+data+')','type':'director', 'from':'director','sound':soundDirector};
    socket.broadcast.emit('newMessage', message);
    socket.emit('newMessage', message);
    // store message
    allMessages.push(message);
    // save message
    var messageStr = '('+data+')';
    saveMessage(messageStr);
    // count message
    countMessage(socket);
  });

  socket.on('changeScene', function (data) {
    // Enviar frase finals
    socket.broadcast.emit('newMessage', {'message':'('+objTheaterPlay[sceneNumber].frase_final_escena+')','type':'director', 'from':'director','sound':soundDirector});
    socket.emit('newMessage', {'message':'('+objTheaterPlay[sceneNumber].frase_final_escena+')', 'type':'director','sound':soundDirector});
    blockNewMessages = true;

    // After 5s then disable messages
    setTimeout(function(){
      changeScene(socket);
    },14000);
  });
  /*
  socket.on('repeatScene', function (data) {

  });

  socket.on('goLastScene', function (data) {
    sendLastScene();
  });
  */
  socket.on('disconnect', function() {
      console.log('Got disconnect!');
      var i = allClients.indexOf(socket);
      allClients.splice(i, 1);
  });
});

io.listen(8001);
loadCSV('./audios/CLAIR_DE_LUNE_TIEMPOS004_reduce.csv');
