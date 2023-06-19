import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

/**
 * Individual draggable character card with character data.
 * @param {Character} character The character's data
 * @param {number} index Number for react-dnd-beautiful to use to track drag and drop location
 * @return {JSX.Element} Draggable React Component Character
 * @constructor
 */

const Character = ({ character, index }) => {
  // Removes the drop animation so there isn't a delay between the character being dropped and the line count updating
  function getStyle(style, snapshot) {
    if (!snapshot.isDropAnimating) {
      return style;
    }
    // The default value has a long delay for updating, we reduced the transitionDuration to remove this delay.
    // transitionDuration cannot be set to zero, react-beautiful-dnd docs explain that there needs to be a transition duration
    // for the onTransitionEnd event to fire, which is how it knows the drop animation is finished.
    // https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/drop-animation.md#skipping-the-drop-animation
    return {
      ...style,
      transitionDuration: '0.001s',
    };
  }

  // draggableId {DraggableId(string)} and index {number} are both required by react-dnd-beautiful
  // Draggable docs: https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/api/draggable.md
  return (
    <Draggable draggableId={character.id} index={index} key={character.id}>
      {(provided, snapshot) => (
        <div
          className="assignedCharacter"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          style={getStyle(provided.draggableProps.style, snapshot)}
        >
          <p>{character.name}</p>
          <p>{`Lines: ${character.line_count}`}</p>
        </div>
      )}
    </Draggable>
  );
};

export default Character;
