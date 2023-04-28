async function getActors() {
  try {
    const response = await fetch('/api/actors')

    if (response.ok) {
      return await response.json()
    } else {
      console.log('Server Error:', response.body);
    }
  } catch (error) {
    console.error('Network Error:', error);
  }
}

async function getScript(scriptId) {
  try {
    const response = await fetch('/api/script/' + scriptId);

    if (response.ok) {
      return await response.json()
    } else {
      console.error(`server error: ${response.body} when fetching script`);
    }
  } catch (error) {
    console.error(`network error: ${error} when fetching script`);
  }
}

async function getScriptTitles(){
  try {
    const response = await fetch('/api/scripts/title');

    if (response.ok) {
      return await response.json();
    } else {
      console.error(`server error: ${response.body} when fetching script`);
    }
  } catch (error) {
    return (error)
  }
}

async function deleteActor(id) {
  try {
    const response = await fetch('/api/actors/' + id, { method: 'DELETE' });
    return response.ok
  } catch (error) {
    console.error(error.message)
  }
};


async function getCurrentActorCharacters(actor, currentScript) {
  try {
    const response = await fetch(`/api/script/${currentScript}/characters?actorId=${actor.id}`);
    if (response.ok) {
      const  data = await response.json()
      const characters = data.map((c) => c.name)
      return characters
    } else {
      console.error('Server Error:', response.body);
    }
  } catch (error) {
    console.error(`error: ${error} when fetching current characters`);
  }
}

async function deleteScript(deleteId) {
  try {
    const response = await fetch('/api/script/' + deleteId, { method: 'DELETE' });
    return response;
  } catch (error) {
    console.error('Network Error: ', error.message)
  }
}

async function newActor(name) {
  try {
    const response = await fetch('/api/actors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    if (response.ok) {
      const actor = await response.json()
      return actor;
    } else {
      console.error(`server error: ${response.body} when adding new actor`);
    }
  } catch (error) {
    return (error.message)
  }
}

async function getCharacters(currentScript){
  try {
    const response = await fetch('/api/script/' + currentScript + '/characters');

    if (response.ok) {
      const characters = await response.json()
      return characters;
    } else {
      console.error(`server error: ${response.body} when fetching character data`);
    }
  } catch (error) {
    console.error(`network error: ${error} when fetching character data`);
  }
}

async function postPosition(actorId, scriptId, position){
  try {
    const response = await fetch('/api/positions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({actorId, scriptId, position})
    })
    return response.ok;
  } catch (error) {
    console.error(`network error: ${error} when posting position`);
  }
}

async function uploadScript(formData){
  return await fetch('/api/script', { method: 'POST', body: formData });
}


export { getActors, getScript, getScriptTitles, deleteActor, getCurrentActorCharacters, deleteScript, newActor, getCharacters, postPosition, uploadScript}
