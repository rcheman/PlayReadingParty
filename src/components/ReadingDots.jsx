import React, { useState, useEffect, useRef } from 'react';
import { postPosition } from './api';

/**
 * Component containing all the progress tracking reading dots on the script page
 * @param {Array.<Actor>} actors Actors from state
 * @param {Actor} currentActor Current selected actor from state
 * @param {string} currentScriptId The Id for the current script from state
 * @return {JSX.Element} React Component ReadingDots
 * @constructor
 */
const ReadingDots = ({ actors, currentActor, currentScriptId }) => {
  const [dots, setDots] = useState({});
  const refDots = useRef({});
  refDots.current = dots;

  const actorNameMap = {};
  for (const actor of actors) {
    actorNameMap[actor.id] = actor.name;
  }

  useEffect(() => {
    // get initial dots positions
    const source = new EventSource(`/api/positions/${currentScriptId}`);
    const positionReceiver = function(message) {
      let m = JSON.parse(message.data);

      const newDots = Object.assign({}, refDots.current);

      newDots[m.actorId] = m.position;

      setDots(newDots);
      refDots.current = newDots;
    };

    source.addEventListener('message', positionReceiver);

    let scrollTimeout;
    let lastReportedTime = performance.now();

    let positionReporter = () => {
      // replace a currently queued update if we're still scrolling before the update was sent.
      // this helps reduce many small changes into one larger change request
      clearTimeout(scrollTimeout);

      function report() {
        lastReportedTime = performance.now();

        // Find the distance between the top of the page and the beginning of the script section
        let readingDotsHeightOffset =
          document.getElementsByTagName('body')[0].getBoundingClientRect().height -
          document.getElementById('readingDots').getBoundingClientRect().height;

        // Position is the percentage (between 0.0 and 1.0) that the user has scrolled through the entire script. 0.0 is
        // the beginning and 1.0 is the very last line. We subtract readingDotsHeightOffset so the calculations only
        // involve the script section.
        // |--------------|  <--------------------------------| <-----|
        // |    Title     |                                   |body   |readingDotsHeightOffset
        // |              |                                   |       |
        // | |Actor 1.    |  <---------------|                | <-----|
        // | |My line     |                  |script section  |
        // |           <==|  <--reading dot  |                |
        // | |Actor 2.    |                  |                |
        // | |Their line  |                  |                |
        // |______________|  <---------------| <---------------
        let position = (window.scrollY - readingDotsHeightOffset) / (document.body.scrollHeight - readingDotsHeightOffset);

        // fetch request to update position
        postPosition(currentActor.id, currentScriptId, position);
      }

      // Update while scrolling if it has been going on for more than 5ms, otherwise delay until 5ms have elapsed.
      // This ensures that other users see scrolling changes as they occur rather than only after they've stopped.
      if (performance.now() - lastReportedTime > 5) {
        report();
      } else {
        scrollTimeout = setTimeout(report, 5);
      }
    };

    addEventListener('scroll', positionReporter);

    // Clear any running timeouts when component unmounts to prevent them from stacking up
    return () => {
      source.removeEventListener('message', positionReceiver);
      source.close();

      removeEventListener('scroll', positionReporter);
      clearTimeout(scrollTimeout);
    };

  }, [currentScriptId, currentActor]);

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
      <span className='readingDot' key={`dot ${id}`} style={{ top: `${position * 100}%`, backgroundColor: color }}>
        {actorNameMap[id]}
      </span>
    );
  }

  return (
    <div id='readingDots' className='readingDots'>
      {dotElements}
    </div>
  );
};

/**
 * Generate a unique and stable hue based on the actor name
 * @param {string} actor The actor's name
 * @return {number} Total value of the character's in the actor's name, capped at 360 with wrap around.
 */
function getActorHue(actor) {
  let input = 0;
  for (const char of actor) {
    input += char.charCodeAt(0);
  }

  return input % 360;
}

export default ReadingDots;
