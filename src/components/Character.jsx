import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

// Individual draggable character card with character data.
const Character = ({character, index}) => {
  // text is set as a string so the new line isn't displayed
  const characterText = `${character.name} \n Lines: ${character.lineCount}`

  return (
    <Draggable draggableId={character.id} index={index} key={character.id}>
      {(provided) => (
      <div className='assignedCharacter'
           {...provided.draggableProps}
           {...provided.dragHandleProps}
           ref={provided.innerRef}>
        <p>{characterText}</p>
      </div>
      )}
    </Draggable>
  )
}

export default Character;
