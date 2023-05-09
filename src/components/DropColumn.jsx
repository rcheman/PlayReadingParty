import React from 'react';
import Character from './Character.jsx';
import { Droppable } from 'react-beautiful-dnd';

// Single column of all the unassigned Characters, is droppable so characters can be returned to it
const DropColumn = ({ column, characterList }) => {
  const style = {
    height: 'fit-content'
  };
  if (column.id === 'unassignedCharacters') {
    style.overflow = 'visible';
    style.width = '220px';
  }
  return (
    <div className='dropContainer' style={style}>
      <h3 className='columnTitle'>{column.title}: {column.lineCount}</h3>
      <Droppable droppableId={column.id} key={column.id}>
        {(provided) => (
          <div className='characterList' ref={provided.innerRef} {...provided.droppableProps}>
            {characterList.map((character, index) => {
              return <Character key={character.id} character={character} index={index} />;
            })}
            {provided.placeholder}
          </div>
        )}

      </Droppable>
    </div>
  );
};

export default DropColumn;
