import React, { useEffect, useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { getCharacters, assignCharacter } from './api';
import DropColumn from './DropColumn';

/**
 * Drag and Drop context for assigning characters to actors
 * @param {Array.<Actor>} actors Actors from state
 * @param {string} currentScriptId The ID for the current script
 * @return {JSX.Element | undefined} DragDropContext React Component CharacterAssignment.
 * We allow undefined return for when there is no current script, so we don't return the component.
 * @constructor
 */
const CharacterAssignment = ({ actors, currentScriptId }) => {
  const [characters, setCharacters] = useState({});
  const [columnOrder, setColumnOrder] = useState([]);
  const [columns, setColumns] = useState({
    unassignedCharacters: new Column('unassignedCharacters', 'Unassigned Characters'),
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
   * @param {String} currentScriptId Unique script ID
   * @param {Array.<Actor>} actors Array of actor objects
   */
  async function setupColumns(currentScriptId, actors) {
    const characters = await getCharacters(currentScriptId);
    if (characters.success) {
      const { newColumns, newColumnOrder } = createInitialActorColumns(actors);
      const assignedColumns = assignInitialCharacters(newColumns, characters.data);
      setColumns(assignedColumns);
      setColumnOrder(newColumnOrder);
      setCharacters(characters.data);
    } else {
      console.error(characters.data);
    }
  }

  /**
   * Put the characters in the appropriate actor columns
   * @param  {Object.<Column>} columns Object of actor column objects, no assigned characters
   * @param {Array.<Character>} characters  Contains Character objects indexed by their id
   * @returns {Object.<Column>} Object of actor column objects, now updated with assigned characters
   */
  function assignInitialCharacters(columns, characters) {
    for (let key in characters) {
      let assignedActor = characters[key].actorId;
      if (assignedActor) {
        columns[assignedActor].characterIds.push(characters[key].id.toString());
      } else {
        columns.unassignedCharacters.characterIds.push(characters[key].id.toString());
      }
    }
    return columns;
  }

  /**
   * Create the actor columns, all empty at this stage
   * @param {Array.<Actor>} actors Array of actor objects
   * @returns {Object} Object of actor column objects and array of actor IDs
   */
  function createInitialActorColumns(actors) {
    const columns = {
      unassignedCharacters: new Column('unassignedCharacters', 'Unassigned Characters'),
    };
    const actorIds = [];
    actors.forEach((actor) => {
      columns[actor.id] = new Column(actor.id.toString(), actor.name);
      actorIds.push(actor.id);
    });
    return { newColumns: columns, newColumnOrder: actorIds };
  }
  /**
   * Update the actor columns when the number of actors changes and set the new column values and order
   * @param {Array.<Actor>} actors Array of Actor objects
   */
  function updateActorColumns(actors) {
    // If there are more actors than columns, add a column
    if (actors.length > columnOrder.length) {
      const { newColumns, newColumnOrder } = addActorColumn(actors, { ...columns }, [...columnOrder]);
      setColumns(newColumns);
      setColumnOrder(newColumnOrder);
    } else {
      // Remove an actor, there are more columns than actors
      const { newColumns, newColumnOrder } = removeActorColumn(actors, { ...columns }, [...columnOrder]);
      setColumns(newColumns);
      setColumnOrder(newColumnOrder);
    }
  }

  /**
   * Add a new actor column by checking that each actor in our list has a column,
   *  and creating one when a column isn't found with that actor's id
   * @param {Array.<Actor>} actors Array of Actor objects
   * @param {Object.<Column>} columns Object containing column objects
   * @param {Array.<Number>} columnOrder Array of column ids
   */
  function addActorColumn(actors, columns, columnOrder) {
    actors.forEach((actor) => {
      if (!columns[actor.id]) {
        columns[actor.id] = new Column(actor.id.toString(), actor.name);
        columnOrder.push(actor.id);
      }
    });
    return { newColumns: columns, newColumnOrder: columnOrder };
  }

  /**
   * Remove an actor column by going through the columns and checking if each column matches up with an actor,
   *  if it doesn't, and it isn't the unassigned column, remove the column.
   * @param {Array.<Actor>} actors Array of Actor objects
   * @param {Object.<Column>} columns Object containing column objects
   * @param {Array.<Number>} columnOrder Array of column ids
   */
  function removeActorColumn(actors, columns, columnOrder) {
    for (let key in columns) {
      // Check if the column is for an actor that has been deleted, therefore it's characters should be unassigned
      if (!actors.some((actor) => actor.id.toString() === key) && key !== 'unassignedCharacters') {
        // Reassign characterIds to the unassigned column
        const reassignedIds = columns[key].characterIds;
        columns.unassignedCharacters.characterIds = [...columns.unassignedCharacters.characterIds, ...reassignedIds];
        const index = columnOrder.findIndex((id) => id.toString() === key);
        columnOrder.splice(index, 1);
        delete columns[key];
      }
    }
    return { newColumns: columns, newColumnOrder: columnOrder };
  }

  /**
   * Remove a character from its source column and adds it to its destination column,
   *  update the database with the assignment info, and set state to reflect the changes.
   * @param {Object} result React-beautiful-dnd set parameter
   */
  async function onDragEnd(result) {
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
    // We create a structured clone to make sure we aren't changing the state directly.
    const start = structuredClone(columns[source.droppableId]);
    const finish = structuredClone(columns[destination.droppableId]);

    // Remove the character from the column it was picked up from and update the column values
    const index = start.characterIds.indexOf(draggableId);
    start.characterIds.splice(index, 1);
    // Add the character to the column it was dropped on
    finish.characterIds.push(draggableId);

    // Update the assigned character in the database and if it works, reset the column values to represent the assignment
    setColumns({ ...columns, [start.id]: start, [finish.id]: finish });
    const response = await assignCharacter(draggableId, destination.droppableId, currentScriptId);
    if (!response.success) {
      setColumns(columns);
      console.error(response.data);
    }
  }

  // No script is selected, don't bother rendering the component
  if (!currentScriptId) {
    return;
  }
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <h2 id="characterAssignmentTitle">Character Assignment</h2>
      {/*Uses map and sort to be able to have the unassigned column separate  from the actor columns but characters are still sorted by line count*/}
      <div className="row dragDropContext">
        <div id="unassigned">
          <DropColumn
            key={columns['unassignedCharacters'].id}
            column={columns['unassignedCharacters']}
            characterList={columns['unassignedCharacters'].characterIds
              .map((characterId) => characters[characterId])
              .sort((a, b) => b.lineCount - a.lineCount)}
          />
        </div>
        {/*Creates all the actor columns*/}
        <div id="actorColumnsContainer">
          {columnOrder.map((columnId) => {
            const column = columns[columnId];
            const characterList = column.characterIds.map((characterId) => characters[characterId]);
            characterList.sort((a, b) => b.lineCount - a.lineCount);
            return <DropColumn key={column.id} column={column} characterList={characterList} />;
          })}
        </div>
      </div>
    </DragDropContext>
  );
};

class Column {
  /**
   * @param {string} id id used for drag and drop reference
   * @param {string} title Column title that will be displayed
   */
  constructor(id, title) {
    this.id = id;
    this.title = title;
    this.characterIds = [];
  }
}

export default CharacterAssignment;
