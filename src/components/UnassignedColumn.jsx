import React from 'react';
import Character from './Character.jsx'
import { Droppable } from 'react-beautiful-dnd';

// Single column of all the unassigned Characters, is droppable so characters can be returned to it
const UnassignedColumn = ({column, characterList}) => {
  return (
    <div id='unassignedColumnContainer' className='columnContainer' style={{height :'fit-content'}}>
      <h3 className='columnTitle'>{column.title}: {column.lineCount}</h3>
      <Droppable droppableId={column.id} key={column.id} >
        {(provided) => (
          <div className='characterList' ref={provided.innerRef} {...provided.droppableProps}>
            {characterList.map((character, index) => <Character key={character.id} character={character} index={index}/>)}
            {provided.placeholder}
          </div>
        )}

      </Droppable>
    </div>
  )
};

export default UnassignedColumn;
