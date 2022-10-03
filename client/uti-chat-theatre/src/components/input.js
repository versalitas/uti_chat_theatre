import React from 'react'
import TextareaAutosize from 'react-textarea-autosize'

// https://github.com/andreypopp/react-textarea-autosize

class Input extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
          value:'',
          textarea: null,
          height: 40
        }
    }


    onSubmit(e) {
        e.preventDefault()
        this.forceUpdate()
        this.sendMessage();
    }
    //<input autoComplete={'off'} ref="input" type="text" name="message" id="message"></input>

    updateSize = (height) => {
        this.setState({
          height
        });
    }

    sendMessage = () =>{
      console.log("text:",this.state.textarea.value);
      // not allow to send empty messages
      if(this.state.textarea.value != '' && this.state.textarea.value != '\n'){
        this.props.socket.emit(this.props.type, this.state.textarea.value);
      }
      this.state.textarea.value = '';
      this.state.textarea.rows = 1;
    }

    onChange = () =>{
      var key = window.event.keyCode;
      console.log('key:',key);
      if(key == 13){
        this.sendMessage();
      }
    }


    render() {
        const {newValue, height} = this.state;

        let newStyle = {
          height
        }

        return (
            <form className="input" onSubmit={(e) => this.onSubmit(e)}>
                {this.props.characterName!=""? (<label htmlFor="chat-input">{this.props.characterName}</label>):null}
                <TextareaAutosize className="inputTextArea" ref="textareaChat" onKeyPress={this.onChange} inputRef={tag => (this.state.textarea = tag)} />
                <button id="chatSendButton" type="submit"><img src="/paper.png" height="15" width="15"/></button>
            </form>
        )
    }
}

export default Input
