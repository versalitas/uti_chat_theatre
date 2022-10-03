import React from 'react'
import Chat from './chat'
import Input from './input'
import Users from './users'
import { loadSongLastScene, playSongLastScene,loadAndPlaySoundMessage } from '../modules/audio'
import {getTimestampAudio} from '../modules/audioTiming'
import io from 'socket.io-client';
import settings from '../settings.js'
import './chatProjector.css'

var socket = null;

class chatProjector extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            chatLog:           [],
            pending:           false,
            loggedIn:          false,
            desiredNameValid:  false,
            lastNameDetail:    '',
            desiredName:       '',
            userList:          [],
            sceneTitle:        '',
            sceneDescription:  '',
            screenPosition:    0,
            characterAsigned: '',
            isLastScene: false,
            playingSoundLastScene: false,
        }
    }

    convertToTimestamp = (timeStr) => {
      var timeAr = timeStr.split(':');
      return ((parseInt(timeAr[0])*60000)+(parseInt(timeAr[1])*1000)+parseInt(timeAr[2]));
    }

    changeToNextScene = () => {
      console.log('called changeScene');
      socket.emit('changeScene',this.state.sceneNumber);
    }

    componentDidMount() {
      document.getElementById("chat").style.height= "800px";
      //document.getElementsByTagName("body")[0].style.background= "#000000";

      var self = this;
      var url = window.location.host;
      socket = io(settings.ip+':8001')//settings.ip
      socket.on('connect', function () {
        self.setState({
          socket : socket
        });
        socket.emit('connectMessage','connected');
      });

      socket.on('newUserList', function (data) {
        console.log('new list users');
        self.setState({
          userList : data
        });
      });

      socket.on('newMessage', function (data) {
        self.refs.chat.onNewMessage(data)
        self.forceUpdate();
        loadAndPlaySoundMessage(data.sound)
      });

      socket.on('directorMessage', function (data) {

      });

      socket.on('sceneInfo', function (data) {
        if(self.state.lastSceneTitle !=data.sceneTitle) self.refs.chat.clear();

        self.setState({
          lastSceneTitle : data.sceneTitle,
          sceneTitle: data.sceneTitle,
          sceneDescription:data.sceneDescription,
          screenPosition:data.screenPosition
        });
      });

      socket.on('assignActor', function (data) {
        self.setState({
          characterAsigned : data
        });
      });

      socket.on('fadeOutInChatScene', function (data) {

        document.getElementById("chatProjector").style.opacity = "0.0";
        setTimeout(function(){
          document.getElementById("chatProjector").style.opacity = "1.0";
        },6500);

      });

      socket.on('startLastScene', function (data) {
        console.log('Call startLastScene');
        console.log(data);

        var allMessages = data;
        var csvSounds = getTimestampAudio();

        loadSongLastScene(function(){
          var startTimestamp = Date.now();
          var index = 0;
          var timer = setInterval(function(){
            var timeNow = Date.now();
            console.log( (timeNow-startTimestamp) );
            console.log( csvSounds[index] );
            console.log( self.convertToTimestamp(csvSounds[index]) );
            if((timeNow-startTimestamp)>=self.convertToTimestamp(csvSounds[index])){
              console.log('send new message');
              var message = allMessages[index];
              //publish message
              self.refs.chat.onNewMessage(message)

              if(index<csvSounds.length-1){
                index += 1;
              }
              if((timeNow-startTimestamp)>=self.convertToTimestamp(csvSounds[csvSounds.length-1])){
                console.log("Clear interval");
                clearInterval(timer);
                // Change to last scene
                self.changeToNextScene();
              }
            }
          },50);
        });

      });
    }

    render() {

        const socket = this.state.socket;
        const sceneTitle = this.state.sceneTitle;
        const sceneDescription = this.state.sceneDescription;
        const userList = this.state.userList;
        const chatLog = this.state.chatLog;
        const screenPosition = this.state.screenPosition;
        const characterAsigned = this.state.characterAsigned;
        const type = "projectorMessage";

        return (
            <div id="chatProjector">
                <div className="overlay-fx">
                    <header>
                        <strong>{sceneTitle}</strong> {sceneDescription}
                    </header>

                    <div className="view">
                        <Chat ref="chat" messages={chatLog} />
                        <Users socket={socket} users={userList} type='projector' className="userList" />
                    </div>
                </div>
            </div>
        )
    }
}

export default chatProjector
