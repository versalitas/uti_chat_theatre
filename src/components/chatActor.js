import React from 'react'
import Chat from './chat'
import Input from './input'
import Users from './users'
import io from 'socket.io-client';
import settings from '../settings.js'
import './chatDirector.css'

var socket = null;

class chatActor extends React.Component {

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
            characterAsigned: ''
        }

    }

    componentDidMount() {

      var self = this;
      var url = window.location.host;
      socket = io(url+':8001')//settings.ip
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

    }

    render() {

        const socket = this.state.socket;
        const sceneTitle = this.state.sceneTitle;
        const sceneDescription = this.state.sceneDescription;
        const userList = this.state.userList;
        const chatLog = this.state.chatLog;
        const screenPosition = this.state.screenPosition;
        const type = "publicMessage";
        const characterAsigned = this.state.characterAsigned;

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

                    <div className="input">
                        <Input socket={socket} type={type} characterName={characterAsigned} />
                    </div>
                </div>
            </div>
        )
    }
}

export default chatActor
