import React from 'react'
import Input from './input'
import io from 'socket.io-client';
import settings from '../settings.js'
import './homepage.css'

class homepage extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            socket:             null,
            loggedIn:           false,
            characterAsigned:   '',
            allCharacterAsigned:false,
            sceneTitle:''
        }
    }

    componentDidMount() {
        var self = this;
        var url = window.location.host;
        var socket = io(settings.ip+':8001');//
        socket.on('connect', function () {
          self.setState({
            socket : socket
          });

          socket.emit('connectMessage','connected');
        });

        socket.on('assignActor', function (data) {
          self.setState({
            characterAsigned : data
          });
        });

        socket.on('sceneInfo', function (data) {
          self.setState({
            sceneTitle: data.sceneTitle,
            allCharacterAsigned:data.allCharacterAsigned
          });
        });
    }

    render() {
        const socket = this.state.socket;
        const type = "publicMessage";
        const sceneTitle = this.state.sceneTitle;
        const characterAsigned = this.state.characterAsigned;
        const allCharacterAsigned = this.state.allCharacterAsigned;

        return (
            <div id="chat">
                <div className="overlay-fx">
                    <header>
                        <strong>{sceneTitle}</strong>
                        {allCharacterAsigned && characterAsigned==''?(<div className="allRolesAssigned">Tots els personatges d'aquesta escena ja són presents</div>):null}
                    </header>
                    <div className="input">
                      <Input socket={socket} type={type} characterName={characterAsigned} />
                    </div>

                </div>
            </div>
        )
    }
}

export default homepage
