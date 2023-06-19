import React from 'react';
import Character from './Character.jsx';
import { Droppable } from 'react-beautiful-dnd';

/**
 * Actor or unassigned column Droppable component.
 * @param {Column} column Individual actor | unassigned column
 * @param {Array.<Character>} characterList All the characters assigned to this column
 * @return {JSX.Element} Droppable React Component DropColumn
 * @constructor
 */
const DropColumn = ({ column, characterList }) => {
  return (
    <div className='dropContainer' style={{ height: 'fit-content' }}>
      <h3 className='columnTitle'>{column.title}: {getLineCount(characterList)}</h3>
      <Droppable droppableId={column.id.toString()} key={column.id}>
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

/**
 * Calculate the total lines for the column
 * @param {Array.<Character>} characterList All the characters assigned to this column
 * @returns {Number} The total line count for the column
 */
function getLineCount(characterList){
  return characterList.reduce((acc, curr) => acc + curr.lineCount, 0)
}

export default DropColumn;
