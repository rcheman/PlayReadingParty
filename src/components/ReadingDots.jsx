import React, { useState, useEffect, useRef } from 'react';
import { postPosition } from './api';

// Generate a unique and stable hue based on the actor name
function getActorHue(actor) {
  let input = 0;
  for (const char of actor) {
    input += char.charCodeAt(0);
  }

  return input % 360;
}

const ReadingDots = ({ actors, currentActor, currentScript }) => {
  const [dots, setDots] = useState({});
  const refDots = useRef({});
  refDots.current = dots;

  const actorNameMap = { };
  for (const actor of actors) {
    actorNameMap[actor.id] = actor.name;
  }

  useEffect(() => {
    // get initial dots positions
    const source = new EventSource(`/api/positions/${currentScript}`);
    const positionReceiver = function (message) {
      let m = JSON.parse(message.data);

      const newDots = Object.assign({}, refDots.current);

      newDots[m.actorId] = m.position;

      setDots(newDots);
      refDots.current = newDots;
    };

    source.addEventListener('message', positionReceiver);

    let scrollTimeout;

    let positionReporter = () => {
      // replace a currently queued update if we're still scrolling before the update was sent.
      // this helps reduce many small changes into one larger change request
      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(async () => {
        let readingDotsHeightOffset =
          document.getElementsByTagName('body')[0].getBoundingClientRect().height -
          document.getElementById('readingDots').getBoundingClientRect().height;

        let position = (window.scrollY - readingDotsHeightOffset) / (document.body.scrollHeight - readingDotsHeightOffset);
        position = position.toPrecision(4);

          // fetch request to update position
          await postPosition(currentActor.id, currentScript, position)
      }, 50);
    };

    addEventListener('scroll', positionReporter);

    // Clear any running timeouts when component unmounts to prevent them from stacking up
    return () => {
      source.removeEventListener('message', positionReceiver);
      source.close();

      removeEventListener('scroll', positionReporter);
      clearTimeout(scrollTimeout);
    };

  }, [currentScript, currentActor]);

  const dotElements = [];
  for (const [id, position] of Object.entries(dots)) {
    // New actors could have been added by others since we've fetched the actor list. Must skip the dot in that case.
    // TODO consider keeping a server sent events stream open for each browser and send it events telling it to update
    // TODO so things like adding a new actor or script will be visible immediately by the other connected users
    if (id == currentActor.id || actorNameMap[id] == undefined) {
      continue;
    }

    const hue = getActorHue(actorNameMap[id]);
    const color = `hsl(${hue}, 80%, 80%)`;

    dotElements.push(
      <span className="readingDot" key={`dot ${id}`} style={{ top: `${position * 100}%`, backgroundColor: color }}>
        {actorNameMap[id]}
      </span>
    );
  }

  return (
    <div id="readingDots" className="readingDots">
      {dotElements}
    </div>
  );
};

export default ReadingDots;
