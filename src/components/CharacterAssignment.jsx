import React, { useEffect, useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import ActorColumn from './ActorColumn.jsx'
import UnassignedColumn from './UnassignedColumn';

// Entire Drag and Drop context for assigning characters to actors
const CharacterAssignment = ({actors, currentScript}) => {
  const [columnOrder, setColumnOrder] = useState([])
  const [columns, setColumns] = useState({
    'unassignedCharacters': {
      id:'unassignedCharacters',
        title: 'Unassigned Characters',
        characterIds: [],
        lineCount: 0
    }});
  const [characters, setCharacters] = useState()

  // Create the actor columns initially and edit columns when actors are added or removed
  useEffect(() => {createOrUpdateActorColumns(actors)}, [actors]);

  // get the character data on the initial load and when the script option changes
  useEffect(() => { (async () => { // useEffect cannot take an async function. Must wrap async in regular function
    if (currentScript === null) {
      return;
    }
    try {
      const response = await fetch('/api/script/' + currentScript + '/characters');

      if (response.ok) {
        const fetchedCharacters = await response.json()
        resetActors()
        setCharacters(fetchedCharacters);
        setAssignedCharacters(fetchedCharacters);

      } else {
        console.error(`server error: ${response.body} when fetching character data`);
      }
    } catch (error) {
      console.error(`network error: ${error} when fetching character data`);
    }
  })()}, [currentScript]);



  // Reset the assigned characters to the actors so we don't have old character Ids interfering
  const resetActors = () => {
    const newColumns = {...columns}
    for (let key in newColumns) {
      newColumns[key].characterIds = [];
      newColumns[key].lineCount = 0;
    }
    setColumns({...newColumns})
  }


  // Set all characters in their assigned column based on the fetched data
  const setAssignedCharacters = (fetchedCharacters) => {
    const newColumns = {...columns}

    for (let key in fetchedCharacters){
      let assignedActor = fetchedCharacters[key].actorId
      if (assignedActor) {
        newColumns[assignedActor].characterIds.push(fetchedCharacters[key].id)
        newColumns[assignedActor].lineCount += fetchedCharacters[key].lineCount
      } else {
        newColumns.unassignedCharacters.characterIds.push(fetchedCharacters[key].id)
        newColumns.unassignedCharacters.lineCount += fetchedCharacters[key].lineCount
      }
    }
    setColumns({...newColumns})
  }

  // Create and update the columns for each of the actors and an Unassigned Characters column
  const createOrUpdateActorColumns = (actors) => {
    // Script is already set, only add or remove actors
    if (currentScript && actors.length > 1  ) {
      const newColumns = {...columns}
      const newOrder = [...columnOrder]
      // Adding an actor, there are more actors than columns (plus the unassigned column)
      if (actors.length + 1 > newOrder.length){
        actors.forEach((actor) => {
          // Adding a new actor
          if (!newColumns[actor.id]){
            newColumns[actor.id] = {
              id: actor.id.toString(),
              title: actor.name,
              characterIds: [],
              lineCount: 0
            }
          newOrder.push(actor.id)
          }
        })
      }
      // Removing an actor, there are more columns than actors
      else {
        for (let key in newColumns){
          // The current column doesn't match any actor or the unassigned column
          if (!actors.some((actor) => actor.id == key) && key != 'unassignedCharacters'){
          // Reassign characterIds to the unassigned column
            const reassignedIds = newColumns[key].characterIds;
            const reassignedCounts = newColumns[key].lineCount;
            newColumns.unassignedCharacters.characterIds = [...newColumns.unassignedCharacters.characterIds, ...reassignedIds];
            newColumns.unassignedCharacters.lineCount += reassignedCounts;
            const index = newOrder.findIndex(id => id === key);
            newOrder.splice(index, 1);
          }
        };
      }
      //Update the new column and order values after the actor changes
      setColumns(newColumns)
      setColumnOrder(newOrder)
    }

    // Initial setup of actor columns, no script is selected
    else {
    const actorColumns = {
      'unassignedCharacters': {
        id:'unassignedCharacters',
        title: 'Unassigned Characters',
        characterIds: [],
        lineCount: 0
      }
    };
    const actorIds = ['unassignedCharacters']
    actors.forEach((actor) => {
      actorColumns[actor.id] = {
        id: actor.id.toString(),
        title: actor.name,
        characterIds: [],
        lineCount: 0
      }
      actorIds.push(actor.id.toString())
    })
      setColumns(actorColumns)
      setColumnOrder(actorIds)
    }
  }


  // Gets called after a character is dropped on a new actor or unassigned. Updates the value in the database.
  const addCharacter = async (characterId, actorId, currentScript) => {
    // Removes actor assignment if the character is moved back to unassigned
    if (actorId === 'unassignedCharacters'){
      actorId = null;
    }
    try {
      const response = await fetch(`/api/script/${currentScript}/characters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({characterId, actorId})
      })
      if (!response.ok) {
        console.error(`server error: ${response.body} when assigning the character to the actor`);
      }
    } catch (error) {
      console.error(`network error: ${error} when assigning the character to the actor`);
      }
  }


  // Update values after a character has been dropped in a column
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result
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
    const finish = columns[destination.droppableId]

    // Character is in a different list, move it and update both column values
    const startCharacterIds = Array.from(start.characterIds)
    const startLineCount = start.lineCount -= characters[draggableId].lineCount

    // Remove the character from the column it was picked up from
    const index = startCharacterIds.indexOf(draggableId)
    startCharacterIds.splice(index, 1)
    const newStart = {
      ...start,
      characterIds: startCharacterIds,
      lineCount: startLineCount
    };

    // Add the character to the column it was dropped on
    const finishCharacterIds = Array.from(finish.characterIds)
    const finishLineCount = finish.lineCount += characters[draggableId].lineCount
    finishCharacterIds.push(draggableId)
    const newFinish = {
      ...finish,
      characterIds: finishCharacterIds,
      lineCount: finishLineCount
    };

    addCharacter(draggableId, destination.droppableId, currentScript)

    setColumns({...columns, [newStart.id] :newStart, [newFinish.id]: newFinish})
  }


  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <h2 id='characterAssignmentTitle'>Character Assignment</h2>
      {/*Uses map and sort to be able to have the unassigned column separate  from the actor columns but characters are still sorted by line count*/}
      <div className='row dragDropContext'>
      <UnassignedColumn key={columns['unassignedCharacters'].id} column={columns['unassignedCharacters']}
                        characterList={columns['unassignedCharacters'].characterIds.map(characterId => characters[characterId]).sort((a, b) => b.lineCount - a.lineCount)}/>
        {/*Creates all the actor columns*/}
        <div id='actorColumnsContainer'>
          {columnOrder.map((columnId) => {
            if (columnId !== 'unassignedCharacters'){
              const column = columns[columnId]
              const characterList = column.characterIds.map(characterId => characters[characterId])
              characterList.sort((a,b) => b.lineCount - a.lineCount)
              return <ActorColumn key={column.id} column={column} characterList={characterList} />
            }})}
        </div>
      </div>
    </DragDropContext>
  )
};

export default CharacterAssignment;
