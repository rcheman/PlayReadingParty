import React, { useEffect, useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { getCharacters, assignCharacter } from './api';
import DropColumn from './DropColumn';

// Entire Drag and Drop context for assigning characters to actors
const CharacterAssignment = ({ actors, currentScriptId }) => {
  const [characters, setCharacters] = useState({});
  const [columnOrder, setColumnOrder] = useState([]);
  const [columns, setColumns] = useState({
    'unassignedCharacters': {
      id: 'unassignedCharacters',
      title: 'Unassigned Characters',
      characterIds: [],
      lineCount: 0
    }
  });

  // When the current script changes create a column for each actor and populate it with the assigned characters
  useEffect(() => {
    // Checking if we have a script prevents it from doing all the work to get the data and create the columns when
    // the component won't be rendered anyway
    if (currentScriptId) {
      (async () => {
        await setupColumns(currentScriptId, actors);
      })();
    }
  }, [currentScriptId]);


  // Edit columns when actors are added or removed
  useEffect(() => {
    updateActorColumns(actors);
  }, [actors]);

  /**
   * Create the actor columns and populate them with the assigned characters.
   * Update state with the new columns, columnOrder, and characters
   * @param {string} currentScriptId Stringified numerical script Id
   * @param {array} actors Array of actor objects
   */
  const setupColumns = async (currentScriptId, actors) => {
    const { newColumns, actorIds } = createInitialActorColumns(actors);
    const characters = await getCharacters(currentScriptId);
    if (characters.success) {
      const assignedColumns = assignInitialCharacters(characters.data, newColumns);
      setColumns(assignedColumns);
      setColumnOrder(actorIds);
      setCharacters(characters.data);
    } else {
      console.error(characters.data);
    }
  };

  /**
   * Put the characters in the appropriate actor columns
   * @param {object} characters keys of characterIds, values of Character
   * @param  {object} newColumns Object of actor column objects, no assigned characters
   * @returns {object} newColumns: Object of actor column objects, now updated with assigned characters
   */
  const assignInitialCharacters = (characters, newColumns) => {
    for (let key in characters) {
      let assignedActor = characters[key].actorId;
      if (assignedActor) {
        newColumns[assignedActor].characterIds.push(characters[key].id);
        newColumns[assignedActor].lineCount += characters[key].lineCount;
      } else {
        newColumns.unassignedCharacters.characterIds.push(characters[key].id);
        newColumns.unassignedCharacters.lineCount += characters[key].lineCount;
      }
    }
    return newColumns;
  };

  /**
   * Create the actor columns, all empty at this stage
   * @param {array} actors Array of objects with properties of name and id
   * @returns {object} newColumns: Object of actor column objects, actorIds: array of actor ids, represents column order
   */
  const createInitialActorColumns = (actors) => {
    const newColumns = {
      'unassignedCharacters': {
        id: 'unassignedCharacters',
        title: 'Unassigned Characters',
        characterIds: [],
        lineCount: 0
      }
    };
    const actorIds = [];
    actors.forEach((actor) => {
      newColumns[actor.id] = {
        id: actor.id.toString(),
        title: actor.name,
        characterIds: [],
        lineCount: 0
      };
      actorIds.push(actor.id.toString());
    });
    return { newColumns, actorIds };
  };
  /**
   * Update the actor columns when the number of actors changes and set the new column values and order
   * @param actors Array of objects with properties of name and id
   */
  const updateActorColumns = (actors) => {
    // If there are more actors than columns, add a column
    if (actors.length > columnOrder.length) {
      const { newColumns, newColumnOrder } = addActorColumn(actors, {...columns}, [...columnOrder]);
      setColumns(newColumns);
      setColumnOrder(newColumnOrder);
    } else {
      // Remove an actor, there are more columns than actors
      const { newColumns, newColumnOrder } = removeActorColumn(actors, {...columns}, [...columnOrder]);
      setColumns(newColumns);
      setColumnOrder(newColumnOrder);
    }

  };

  /**
   * Add a new actor column by checking that each actor in our list has a column,
   *  and creating one when a column isn't found with that actor's id
   * @param actors Array of objects with properties of name and id
   * @param columns Object containing column objects with properties of id, title, characterIds, and lineCount
   * @param columnOrder Array of column ids
   */
  const addActorColumn = (actors, columns, columnOrder) => {
    actors.forEach((actor) => {
      if (!columns[actor.id]) {
        columns[actor.id] = {
          id: actor.id.toString(),
          title: actor.name,
          characterIds: [],
          lineCount: 0
        };
        columnOrder.push(actor.id);
      }
    });
    return { newColumns: columns, newColumnOrder: columnOrder };
  };

  /**
   * Remove an actor column by going through the columns and checking if each column matches up with an actor,
   *  if it doesn't, and it isn't the unassigned column, remove the column.
   * @param actors Array of objects with properties of name and id
   * @param columns Object containing column objects with properties of id, title, characterIds, and lineCount
   * @param columnOrder Array of column ids
   */
  const removeActorColumn = (actors, columns, columnOrder) => {
    for (let key in columns) {
      // Check if the column is for an actor that has been deleted, therefore it's characters should be unassigned
      if (!actors.some((actor) => actor.id == key) && key != 'unassignedCharacters') {
        // Reassign characterIds to the unassigned column
        const reassignedIds = columns[key].characterIds;
        const reassignedCounts = columns[key].lineCount;
        columns.unassignedCharacters.characterIds = [...columns.unassignedCharacters.characterIds, ...reassignedIds];
        columns.unassignedCharacters.lineCount += reassignedCounts;
        const index = columnOrder.findIndex(id => id == key);
        columnOrder.splice(index, 1);
        delete columns[key];
      }
    }
    return { newColumns: columns, newColumnOrder: columnOrder };
  };


  /**
   * Remove a character from its source column and adds it to its destination column,
   *  update the database with the assignment info, and set state to reflect the changes.
   * @param result React-beautiful-dnd set parameter
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


  // No script is selected, don't bother rendering the component
  if (!currentScriptId) {
    return;
  }
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <h2 id='characterAssignmentTitle'>Character
        Assignment</h2>
      {/*Uses map and sort to be able to have the unassigned column separate  from the actor columns but characters are still sorted by line count*/}
      <div className='row dragDropContext'>
        <div id='unassigned'>
          <DropColumn key={columns['unassignedCharacters'].id} column={columns['unassignedCharacters']}
                      characterList={columns['unassignedCharacters'].characterIds
                        .map(characterId => characters[characterId])
                        .sort((a, b) => b.lineCount - a.lineCount)} />
        </div>
        {/*Creates all the actor columns*/}
        <div id='actorColumnsContainer'>
          {columnOrder.map((columnId) => {
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
