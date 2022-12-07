import React, { Component } from 'react';
import { render } from 'react-dom';

class App extends Component {
  constructor(props) {
    super(props);
    this.state;
  }

  componentDidMount() {
    fetch('/script')
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((err) => console.log(err));
  }

  render() {
    return <h1>Here is the react app!!!!!!!!!!!!</h1>;
  }
}

export default App;
