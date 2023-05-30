const dotRepo = require('../repository/dotRepository.js');

const positionSubscribers = [];
const dotIds = {};

async function subscribe(req, res) {
  let { scriptId } = req.params;
  scriptId = Number(scriptId)

  res.writeHead(200, {
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  try {
    const id = Math.random();

    req.on('close', () => {
      console.log(`Connection closed: ${id}`);
      positionSubscribers.filter((subscriber) => subscriber.id !== id);
    });

    // Push res to subscribers, so we can send events as they come in.
    positionSubscribers.push({ id, scriptId, res });

    // send initial data for all actor positions, updates will be sent later as new positions are received
    const dots = await dotRepo.getAll(scriptId);

    for (const dot of dots) {
      dotIds[`${dot.actorId}-${dot.scriptId}`] = dot.id;
      res.write("data: " + JSON.stringify({ actorId: dot.actorId, scriptId, position: dot.position }) + "\n\n");
    }
  } catch (error) {
    // don't abort request since client will just keep reconnecting.
    // we've also already sent headers, so we cannot use the normal error flow.
    console.log(error);
  }

  // request is kept open indefinitely, so we can send events in the response over time as they happen
}

async function reportPosition(req, res, next) {
  let { actorId, scriptId, position } = req.body;

  if (!actorId || !scriptId || !position) {
    return res.sendStatus(400);
  }

  // clamp to valid values
  if (position < 0) {
    position = 0.0;
  } else if (position > 1) {
    position = 1.0;
  }

  const data = `data: ${JSON.stringify({ actorId: actorId, scriptId: scriptId, position: position })}\n\n`;

  // Send new position to every other browser currently reading this script
  for (const subscriber of positionSubscribers) {
    if (subscriber.scriptId === scriptId.toString()) {
      subscriber.res.write(data);
    }
  }

  // Persist position to database
  try {
    const dotKey = `${actorId}-${scriptId}`;
    if (!dotIds[dotKey]) {
      dotIds[dotKey] = await dotRepo.getId(scriptId, actorId)
    }

    await dotRepo.set(dotIds[dotKey], position);
    return next();
  } catch (error) {
    return next({
      log: `error: ${error} occurred when saving position to database.`,
      message: 'error in reportPosition',
    });
  }
}

module.exports = { subscribe, reportPosition };
