import React, { useEffect, useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { getCharacters, assignCharacter } from './api';
import DropColumn from './DropColumn';

// Entire Drag and Drop context for assigning characters to actors
const CharacterAssignment = ({ actors, currentScriptId }) => {
  const [characters, setCharacters] = useState();
  const [columnList, setColumnList] = useState([]);
  const [columns, setColumns] = useState({
    'unassignedCharacters': {
      id: 'unassignedCharacters',
      title: 'Unassigned Characters',
      characterIds: [],
      lineCount: 0
    }
  });

  // Create the actor columns initially and edit columns when actors are added or removed
  useEffect(() => {
    createOrUpdateActorColumns(actors);
  }, [actors]);

  // get the character data on the initial load and when the script option changes
  useEffect(() => {
    (async () => { // useEffect cannot take an async function. Must wrap async in regular function
      if (currentScriptId === null) {
        return;
      }
      const result = await getCharacters(currentScriptId);
      if (result.success) {
        assignInitialCharacters(result.data);
      } else {
        console.error(result.data);
      }
    })();
  }, [currentScriptId]);

  /**
   * Puts the characters in the appropriate actor columns and sets the new columns and characters in state
   * Gets called when the current script has changed and we have fetched new character data
   * @param fetchedCharacters - Object of Character objects with properties of name, lineCount, speakCount, id, and actorId.
   */
  const assignInitialCharacters = (fetchedCharacters) => {
    const newColumns = { ...columns };

    // Reset the actor's assigned characters so new characters can be assigned
    for (let key in newColumns) {
      newColumns[key].characterIds = [];
      newColumns[key].lineCount = 0;
    }
    for (let key in fetchedCharacters) {
      let assignedActor = fetchedCharacters[key].actorId;
      if (assignedActor) {
        newColumns[assignedActor].characterIds.push(fetchedCharacters[key].id);
        newColumns[assignedActor].lineCount += fetchedCharacters[key].lineCount;
      } else {
        newColumns.unassignedCharacters.characterIds.push(fetchedCharacters[key].id);
        newColumns.unassignedCharacters.lineCount += fetchedCharacters[key].lineCount;
      }
    }
    setColumns({ ...newColumns });
    setCharacters(fetchedCharacters);
  };

  /**
   * Create the actor and unassigned columns, or update them when the number of actors changes
   * @param actors - Array of objects with properties of name and id
   */
    // Create and update the columns for each of the actors and an Unassigned Characters column
  const createOrUpdateActorColumns = (actors) => {
      if (!currentScriptId && actors.length == 0) {
        // Initial setup of actor columns, no script is selected
        createInitialActorColumns(actors);
        return;
      }

      // Script is already set, only add or remove actors
      const newColumns = { ...columns };
      const newColumnList = [...columnList];
      // If there are more actors than columns, add a column
      if (actors.length > newColumnList.length) {
        addActorColumn(actors, newColumns, newColumnList);
      } else {
        // Remove an actor, there are more columns than actors
        removeActorColumn(actors, newColumns, newColumnList);
      }
    };

  /**
   * Adds a new actor column by checking that each actor in our list has a column,
   *  and creating one when a column isn't found with that actor's id
   * @param actors - Array of objects with properties of name and id
   * @param newColumns - Object containing column objects with properties of id, title, characterIds, and lineCount
   * @param newColumnList - Array of column ids
   */
  const addActorColumn = (actors, newColumns, newColumnList) => {
    actors.forEach((actor) => {
      if (!newColumns[actor.id]) {
        newColumns[actor.id] = {
          id: actor.id.toString(),
          title: actor.name,
          characterIds: [],
          lineCount: 0
        };
        newColumnList.push(actor.id);
      }
    });
    setColumns(newColumns);
    setColumnList(newColumnList);
  };

  /**
   * Removes an actor column by going through the columns and checking if each column matches up with an actor,
   *  if it doesn't, and it isn't the unassigned column, we remove the column.
   * @param actors - Array of objects with properties of name and id
   * @param newColumns - Object containing column objects with properties of id, title, characterIds, and lineCount
   * @param newColumnList - Array of column ids
   */
  const removeActorColumn = (actors, newColumns, newColumnList) => {
    for (let key in newColumns) {
      // Check if the column is for an actor that has been deleted, therefore it's characters should be unassigned
      if (!actors.some((actor) => actor.id == key) && key != 'unassignedCharacters') {
        // Reassign characterIds to the unassigned column
        const reassignedIds = newColumns[key].characterIds;
        const reassignedCounts = newColumns[key].lineCount;
        newColumns.unassignedCharacters.characterIds = [...newColumns.unassignedCharacters.characterIds, ...reassignedIds];
        newColumns.unassignedCharacters.lineCount += reassignedCounts;
        const index = newColumnList.findIndex(id => id == key);
        newColumnList.splice(index, 1);
        delete newColumns[key];
      }
    }
    setColumns(newColumns);
    setColumnList(newColumnList);
  };

  /**
   * Creates the initial actor columns and the unassigned column when a script hasn't been selected yet.
   * NOTE: When a script isn't selected, these columns are hidden. It is still important to set them up in state
   *  so they can be populated when we do have a current script.
   * @param actors - Array of objects with properties of name and id
   */
  const createInitialActorColumns = (actors) => {
    const actorColumns = {
      'unassignedCharacters': {
        id: 'unassignedCharacters',
        title: 'Unassigned Characters',
        characterIds: [],
        lineCount: 0
      }
    };
    const actorIds = [];
    actors.forEach((actor) => {
      actorColumns[actor.id] = {
        id: actor.id.toString(),
        title: actor.name,
        characterIds: [],
        lineCount: 0
      };
      actorIds.push(actor.id.toString());
    });
    setColumns(actorColumns);
    setColumnList(actorIds);
  };

  /**
   * Removes a character from its source column and adds it to its destination column,
   *  updates the database with the assignment info, and sets state to reflect the changes.
   * @param result - React-beautiful-dnd set parameter
   */
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    // No destination, change nothing
    if (!destination) {
      return;
    }
    // Dropped back in same location, change nothing
    if (destination.droppableId === source.droppableId) {
      return;
    }
    // Get the column ids of the source and destination columns
    const start = columns[source.droppableId];
    const finish = columns[destination.droppableId];

    // Remove the character from the column it was picked up from and update the column values
    const index = start.characterIds.indexOf(draggableId);
    start.characterIds.splice(index, 1);
    start.lineCount = start.characterIds.reduce((acc, curr) => {
      return acc + characters[curr].lineCount;
    }, 0);

    // Add the character to the column it was dropped on
    finish.characterIds.push(draggableId);
    finish.lineCount = finish.characterIds.reduce((acc, curr) => {
      return acc + characters[curr].lineCount;
    }, 0);

    // Update the assigned character in the database and if it works, reset the column values to represent the assignment
    const response = await assignCharacter(draggableId, destination.droppableId, currentScriptId);
    if (response.success) {
      setColumns({ ...columns, [start.id]: start, [finish.id]: finish });
    } else {
      console.error(response.data);
    }
  };


  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <h2 id='characterAssignmentTitle' style={currentScriptId ? { display: '' } : { display: 'none' }}>Character
        Assignment</h2>
      {/*Uses map and sort to be able to have the unassigned column separate  from the actor columns but characters are still sorted by line count*/}
      <div className='row dragDropContext' style={currentScriptId ? { display: '' } : { display: 'none' }}>
        <DropColumn key={columns['unassignedCharacters'].id} column={columns['unassignedCharacters']}
                    characterList={columns['unassignedCharacters'].characterIds
                      .map(characterId => characters[characterId])
                      .sort((a, b) => b.lineCount - a.lineCount)} />
        {/*Creates all the actor columns*/}
        <div id='actorColumnsContainer'>
          {columnList.map((columnId) => {
            const column = columns[columnId];
            const characterList = column.characterIds.map(characterId => characters[characterId]);
            characterList.sort((a, b) => b.lineCount - a.lineCount);
            return <DropColumn key={column.id} column={column} characterList={characterList} />;
          })}
        </div>
      </div>
    </DragDropContext>
  );
};

export default CharacterAssignment;
