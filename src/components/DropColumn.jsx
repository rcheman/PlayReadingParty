import React from 'react';
import Character from './Character.jsx';
import { Droppable } from 'react-beautiful-dnd';

//Actor or unassigned column. Droppable so the Draggable Characters can be dropped on it
const DropColumn = ({ column, characterList }) => {
  return (
    <div className='dropContainer' style={{ height: 'fit-content' }}>
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
