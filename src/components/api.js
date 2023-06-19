/**
 * gets all actors
 * @return {Promise<ApiResponse>}
 */
async function getActors() {
  return await apiCall('GET', 'actors');
}

/**
 * delete a single actor
 * @param {string} id The id of the actor to be deleted
 * @return {Promise<ApiResponse>}
 */
async function deleteActor(id) {
  return await apiCall('DELETE', `actors/${id}`);
};

/**
 * add a new actor to the database
 * @param {string} name The name of the actor to add
 * @return {Promise<ApiResponse>}
 */
async function newActor(name) {
  name = JSON.stringify({ name });
  return await apiCall('POST', 'actors', name, { 'Content-Type': 'application/json' });
}

/**
 * get all the characters that are assigned to the current actor
 * @param {Actor} actor
 * @param {string} currentScriptId
 * @return {Promise<ApiResponse>}
 */
async function getCurrentActorCharacters(actor, currentScriptId) {
  return await apiCall('GET', `characters/${currentScriptId}?actorId=${actor.id}`);
}

/**
 * get all characters for the selected script
 * @param {string} scriptId
 * @return {Promise<ApiResponse>}
 */
async function getCharacters(scriptId) {
  return await apiCall('GET', `characters/${scriptId}`);
}

/**
 * assign the selected character to the selected actor
 * @param {string} characterId
 * @param {string|null|number} actorId
 * @param {string} scriptId
 * @return {Promise<ApiResponse>}
 */
async function assignCharacter(characterId, actorId, scriptId){
  actorId === 'unassignedCharacters' ? actorId = null : actorId = Number(actorId)
  const body = JSON.stringify({ actorId: actorId, characterId: Number(characterId) })
  return await apiCall('POST', `characters/${scriptId}/assignCharacter`, body, { 'Content-Type': 'application/json'})
}

/**
 * get the entire script
 * @param {string} scriptId
 * @return {Promise<ApiResponse>}
 */
async function getScript(scriptId) {
  return await apiCall('GET', 'script/' + scriptId);
}

/**
 * get the titles of all the scripts
 * @return {Promise<ApiResponse>}
 */
async function getScriptTitles() {
  return await apiCall('GET', 'scripts/title');
}

/**
 * delete the specified script
 * @param {string} deleteId
 * @return {Promise<ApiResponse>}
 */
async function deleteScript(deleteId) {
  return await apiCall('DELETE', `script/${deleteId}`);
}

/**
 * upload the given script
 * @param {FormData} formData
 * @return {Promise<{success: boolean, data: any}>}
 */
async function uploadScript(formData) {
  const response = await fetch('/api/script', { method: 'POST', body: formData })
  if (response.ok){
    return {
      success: true,
      data: await response.json()
    }
  } else if (response.status === 409){
    return {
      success: false,
      data: 'Script title already exists'
    }
  } else if (response.status === 452){
    return {
      success: false,
      data: 'Could not find a title, potentially invalid file type'
    }
  } else {
    return {
      success: false,
      data: 'File was not uploaded. Make sure the file name doesn\'t start with an underscore and only uses numbers, letters, and these symbols: \' . _ - '
    }
  }

}
/**
 * post the current position of the actor in the script
 * @param {number} actorId The id of the current actor
 * @param {string} scriptId The id of the current script
 * @param {string} position The actor's current position in the script
 * @return {Promise<ApiResponse>}
 */
async function postPosition(actorId, scriptId, position) {
  const body = JSON.stringify({
    actorId: Number(actorId),
    scriptId: Number(scriptId),
    position: Number(position)
  });
  return await apiCall('POST', 'positions', body, { 'Content-Type': 'application/json' });
}

/**
 * Calls the api with the given arguments
 * @param {string} method The given HTTP method
 * @param {string} uri The uri that comes after /api/
 * @param {object} body The body of the HTTP request
 * @param {object} headers The header parameters for the HTTP request
 * @return {Promise<ApiResponse>}
 */
async function apiCall(method, uri, body = null, headers = {}) {

  try {
    const response = await fetch('/api/' + uri, {
      method: method,
      headers: headers,
      body: body
    });
    // Set data for successful fetch
    if (response.ok) {
        return new ApiResponse(true, await response.json())
    } else { // Set errors from an unsuccessful fetch request
      return new ApiResponse(false, 'Error: ' + await response.json(), response.status)
    }
  } catch (error) { // Set errors from not being able to connect to the server
    return new ApiResponse(false, 'Network error: ' + error.message)
  }
}

class ApiResponse{
  /**
   * @param {boolean} success Whether or not the api call went through
   * @param {any} data The data from the successful call, or an error message for a failed call
   * @param {number} [status] The status for a failed call
   */
  constructor(success, data, status) {
    this.success = success;
    this.data = data;
    this.status = status;
  }
}

export {
  getActors,
  deleteActor,
  newActor,
  getCurrentActorCharacters,
  getCharacters,
  assignCharacter,
  getScript,
  getScriptTitles,
  deleteScript,
  uploadScript,
  postPosition
};
