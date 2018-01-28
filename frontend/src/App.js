import React, { Component } from 'react';
import ReconnectingWebsocket from 'reconnecting-websocket'

import './App.css';
import Lobby from './components/Lobby.react';
import Messenger from './components/Messenger.react';
import Scrambler from './components/Scrambler.react';
import Voter from './components/Voter.react';

const PAGES = {
  LOBBY: 'LOBBY',
  MESSENGER: 'MESSENGER',
  SCRAMBLER: 'SCRAMBLER',
  VOTER: 'VOTER',
};

const DEFAULT_PAGE = PAGES.LOBBY;

const host = 'localhost:8000'

function getWsProtocol() {
  if (window.location.protocol === 'https:') {
    return 'wss://'
  } else {
    return 'ws://'
  }
}

function sendMessage(ws, message) {
  ws.send(JSON.stringify(message))
}

function handleMessage(message) {
  const reader = new FileReader()

  reader.onload = () => {
    const data = JSON.parse(reader.result)

    console.log(`Received ${JSON.stringify(data)}`)

    if (data.type === 'receive_emoji') {
      var updatedState = this.state
      updatedState['emoji'] = message.emoji
      this.setState(updatedState)
    }
  }

  reader.readAsText(message.data)
}

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      currentPage: DEFAULT_PAGE,
      selectedEmojiIndex: 5,
    };

    const protocol = getWsProtocol()

    const ws = new ReconnectingWebsocket(`${protocol}${host}/socket`)
    ws.onmessage = handleMessage.bind(this)

    this.ws = ws
  }

  handleJoin(event) {
    sendMessage(this.ws, {type: 'join', username: this.input.value})
  }

  handleStart(event) {
    sendMessage(this.ws, {type: 'start'})
  }

  render() {
    const {
      currentPage,
      selectedEmojiIndex,
    } = this.state;

    // TODO: get from server
    const EMOJIS = ['😂','😄','😃','😀','😊','😉','😍','😘','😚','😗' ];

    let pageComponent = null;
    if (currentPage === PAGES.LOBBY) {
      pageComponent = <Lobby userList={["hi", "dude", "how ", " you ", " doing"]}/>;
    } else if (currentPage === PAGES.MESSENGER) {
      pageComponent =
        <Messenger
          emojiList={EMOJIS}
          selectedEmojiIndex={selectedEmojiIndex}
          timerSeconds={30}
        />;
    } else if (currentPage === PAGES.SCRAMBLER) {
      pageComponent = <Scrambler message={'flagfllagg'}/>;
    } else if (currentPage === PAGES.VOTER) {
      pageComponent = (
        <Voter
          emojiList={EMOJIS}
          scrambledMessage={'wagwagfrog'}
        />
      );
    }

    return (
      <div className="App">
        <div>
          <h4>Debug actions</h4>
          <input ref={input => {this.input = input}} />
          <button onClick={this.handleJoin.bind(this)}>join</button>
          <button onClick={this.handleStart.bind(this)}>start</button>
          <div>{this.emoji}</div>
        </div>
        <p>
          Current Page: {currentPage}
        </p>
        {pageComponent}
      </div>
    );
  }
}

export default App;
