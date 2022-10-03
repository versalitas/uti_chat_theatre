import React from 'react'
//import Fade from 'react-reveal/Fade';
import Chat from './Chat'
import Input from './Input'
import Users from './Users'
import io from 'socket.io-client';
import './Director.css'
import settings from '../settings.js'
//TODO investigate if these are necessary
//import { loadSongLastScene, playSongLastScene,loadAndPlaySoundMessage } from '../modules/audio'

var socket = null;

class Director extends React.Component {

    showModal() {
        //this.refs.modal.show()
    }

    hideModal() {
        //this.refs.modal.hide()
    }

    constructor(props) {
        super(props)

        this.state = {
            socket:             null,
            chatLog:            [],
            pending:            false,
            loggedIn:           false,
            desiredNameValid:   false,
            lastNameDetail:     '',
            desiredName:        '',
            userList:           [],
            sceneTitle:         '',
            sceneDescription:   '',
            sceneNumber:        0,
            totalScene:         0,
            messageCounter:     0,
            messageSceneCue:    0,
            rolesAsigned:       0,
            totalRoles:         0,
            totalRolesExtra:    0,
            lastSceneTitle :    ''
        }

        //document.getElementById("chat").style.height= "500px";
        //document.getElementById("chat").style.height= "500px";
        //loadAndPlaySound();
    }

    changeToNextScene = () => {
      console.log('called changeScene');
      socket.emit('changeScene',this.state.sceneNumber);
    }

    addOneExtra = () => {
      console.log('add extra role to Scene');
      socket.emit('addExtraToScene',this.state.sceneNumber);
    }

    /*
    repeatScene = () => {
      console.log('called repeatScene');
      socket.emit('repeatScene',this.state.sceneNumber);
    }

    goToLastScene = () => {
      console.log('go to last scene');
      socket.emit('goLastScene',{});
    }
    */
    componentDidMount() {
      var self = this;
      //TODO var url safe to erase?
      //var url = window.location.host;
      socket = io(settings.ip + settings.portSocket)//settings.ip

      socket.on('connect', function () {
        socket.emit('connectMessage','connected');
        self.state.socket = socket;
      });

      // messages to the chat
      socket.on('newMessage', function (data) {
        self.refs.chat.onNewMessage(data)
        self.forceUpdate()

        //loadAndPlaySoundMessage(socket,data.sound);
      });

      // message of the cue
      socket.on('reviewToChat', function (data) {
        console.log('data:',data);
        /*
        self.state.chatLog.push(data);
        self.setState({
          chatLog : self.state.chatLog
        });
        self.forceUpdate()
        */
      });

      socket.on('newUserList', function (data) {
        console.log('new list users');
        self.setState({
          userList : data
        });
      });

      socket.on('sceneInfo', function (data) {
        // clear message
        if(self.state.lastSceneTitle !=data.sceneTitle) self.refs.chat.clear();

        self.setState({
          sceneTitle: data.sceneTitle,
          sceneDescription:data.sceneDescription,
          sceneNumber:data.sceneNumber,
          totalScene:data.totalScene,
          messageSceneCounter: data.messageSceneCounter,
          totalRoles: data.totalRoles,
          rolesAsigned: data.rolesAsigned,
          totalRolesExtra: data.totalRolesExtra
        });
      });

      socket.on('messageSceneCounter', function (data) {

        self.setState(
          { messageSceneCounter:data.messageSceneCounter,
            messageSceneCue:data.messageSceneCue
          }
        );
      });
    }

    render() {
        const type = "directorMessage";
        const socket = this.state.socket;
        const chatLog = this.state.chatLog;
        const userList = this.state.userList;
        const sceneTitle = this.state.sceneTitle;
        const sceneDescription = this.state.sceneDescription;
        const sceneNumber = this.state.sceneNumber;
        const totalScene = this.state.totalScene;
        const messageSceneCounter = this.state.messageSceneCounter;
        const messageSceneCue = this.state.messageSceneCue;

        const rolesAsigned = this.state.rolesAsigned;
        const totalRoles = this.state.totalRoles;
        const totalRolesExtra = this.state.totalRolesExtra;

        return (
            <div id="chatDirector">
                <div className="overlay-fx">
                    <header>
                        <strong>{sceneTitle}</strong> {sceneDescription}<br/>
                        <hr/>
                        <span className="containerCounterField">Número de escena<span className="counterField"><strong>{(sceneNumber+1)+"/"+totalScene}</strong></span></span>
                        <span className="containerCounterField">Total mensajes escena<span className="counterField"><strong>{messageSceneCounter}</strong></span></span>
                        <span className="containerCounterField">Total mensajes en la cola<span className="counterField"><strong>{messageSceneCue}</strong></span></span>
                        <span className="containerCounterField">Total personajes<span className="counterField"><strong>{rolesAsigned+"/"+totalRoles}</strong></span></span>
                        <span className="containerCounterField">Total extras<span className="counterField"><strong>{totalRolesExtra}</strong></span></span>
                        <button onClick={this.changeToNextScene}>Siguiente Escena</button>
                        <button onClick={this.addOneExtra}>Entrar un personaje extra</button>

                    </header>

                    <div className="view">
                        <Chat ref="chat" messages={chatLog} />
                        <Users socket={socket} users={userList} type='director' />
                    </div>

                    <div className="input">
                        <Input socket={socket} type={type} characterName={''} />
                    </div>
                </div>
            </div>
        )
    }
}

export default Director
