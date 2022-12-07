import React, { Component, useState } from 'react';

export default function App() {
  const [actors, addActor] = useState([]);

  const handleInput = (event) => {
    addActor(actors.push(event.target.value));
  };

  // let actorList = [...this.state.actors];
  // const list = [];
  // for (let i = 0; i < actorList.length; i++) {
  //   list.push(<li>{actorList[i]}</li>);
  // }

  return (
    <div>
      <h1>Here is the react app!!!!!!!!!!!!</h1>
      <div>
        <input onChange={handleInput} placeholder='enter actor name' />
        <button>Add actor to list</button>
      </div>
      <ul>{list}</ul>
    </div>
  );
}
//   }
// }

// render(<App />, document.getElementById('app'));
