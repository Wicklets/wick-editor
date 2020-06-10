import React, { useRef, useState } from 'react';

import '../_outliner.scss';

import { DragPreviewImage, useDrag, useDrop } from 'react-dnd';
import DragDropTypes from 'Editor/DragDropTypes.js';

import OutlinerDropdown from './OutlinerDropdown/OutlinerDropdown'
import OutlinerWidget from '../OutlinerWidget/OutlinerWidget'

import layerIcon from 'resources/object-icons/layer.svg';
import frameIcon from 'resources/object-icons/frame.svg';
import pathIcon from 'resources/object-icons/path.svg';
import buttonIcon from 'resources/object-icons/button.svg';
import clipIcon from 'resources/object-icons/clip.svg';
import textIcon from 'resources/object-icons/text.svg';
import imageIcon from 'resources/object-icons/image.svg';

import scriptIcon from 'resources/outliner-icons/script.svg';
import soundIcon from 'resources/outliner-icons/sound.svg';

import editTimelineIcon from 'resources/outliner-icons/edit_timeline.svg';
import hiddenIcon from 'resources/outliner-icons/hidden.svg';
import lockedIcon from 'resources/outliner-icons/locked.svg';

let icons = {layer: layerIcon, frame: frameIcon, path: pathIcon, button: buttonIcon, 
            clip: clipIcon, text: textIcon, image: imageIcon};

var classNames = require("classnames");

export const OutlinerObject = ({clearSelection, selectObjects, 
  editScript, playhead, depth, maxDepth, display, highlighted, 
  toggle, data, isActive, collapsedUUIDs, dragging, setDragging, setFocusObject}) => {

  const ref = useRef(null);

  const [, drag, preview] = useDrag({
    item: {
      type: DragDropTypes.GET_OUTLINER_SOURCE({data}),
      uuid: data.uuid,
    },
    begin: () => {
      setDragging(true);

      if (data.isSelected) {
        return;
      }
      
      clearSelection();
      selectObjects([data]);

    },
    end: () => {
      setDragging(false);
    },
  })

  const [hoverLocation, setHoverLocation] = useState(null);

  const [{ isOverCurrent }, drop] = useDrop({
    accept: DragDropTypes.GET_OUTLINER_TARGETS({data}),
    drop: (item, monitor) => {
      //const dropLocation = monitor.getClientOffset();
      //const draggedItem = monitor.getItem();
    },
    collect: (monitor) => ({
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
    hover: (item, monitor) => {
      const types = ['object', 'frame', 'layer'];

      if (types.indexOf(item.type) === 
          types.indexOf(DragDropTypes.GET_OUTLINER_SOURCE({data}))) {
        // Drop above or below
        // Determine rectangle on screen
        const hoverBoundingRect = ref.current ? ref.current.getBoundingClientRect() : null;

        // Get vertical half
        const hoverMiddle = (hoverBoundingRect.bottom - hoverBoundingRect.top - (hoverLocation ? 5 : 0)) / 2.0 ;
        // Determine mouse position
        const clientOffset = monitor.getClientOffset();
        // Get pixels to the top
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        if (hoverClientY <= hoverMiddle) {
          //above
          setHoverLocation('hover-top');
        }
        else {
          //below
          setHoverLocation('hover-bottom');
        }
      }
      else {
        // Drop inside
        setHoverLocation('hover-middle');
      }
    },
  })

  const name = data.classname === "Layer" ? data.name : data.identifier;

  let empty = true;
  const children = data.getChildren();
  if (depth < maxDepth) {
    for (let i = 0; i < children.length; i++) {
      let object = children[i];

      if (isActive(object)) {
        empty = false;
          break;
      }
    }
  }

  const typeIcon = data.classname === 'Path' ? 
                    icons[data.pathType] : 
                    icons[data.classname.toLowerCase()];

  drag(drop(ref));

  return (
  <>
  <DragPreviewImage connect={preview} src={typeIcon}/>
  <div 
  className={classNames("outliner-object-container")}> 
    <button ref={ref}
      className={classNames("outliner-object", 
        {"object-selected": data.isSelected},
        {"object-dragging": (data.isSelected || data.parent.isSelected || data.parent.parent.isSelected) && dragging},
        {"highlighted": highlighted === data},
        isOverCurrent && hoverLocation)}
      onClick={(e) => toggle(e, [], 'select')}
    >
    <OutlinerDropdown 
    empty={empty}
    collapsed={collapsedUUIDs[data.uuid]}
    toggle={(e) => toggle(e, [], 'dropdown')}/>

    <img
    className="row-icon"
    src={typeIcon}
    alt={data.classname}
    />

    <span className="outliner-name">
    {name}
    </span>

    <span className="outliner-buttons-container">
      {data.classname === 'Layer' &&
        <OutlinerWidget onClick={(e) => {toggle(e, [], 'hidden')}} on={!data.hidden} src={hiddenIcon} alt="hidden"/>
      }
      {data.classname === 'Layer' &&
        <OutlinerWidget onClick={(e) => {toggle(e, [], 'locked')}} on={!data.locked} src={lockedIcon} alt="locked"/>
      }
      {(data.classname === 'Button' || data.classname === 'Clip') &&
        <OutlinerWidget onClick={() => {setFocusObject(data)}} src={editTimelineIcon} alt="edit timeline"/>
      }
      {data.sound && 
        <img className="outliner-sound-icon" src={soundIcon} alt="sound"/>}
      {data.hasContentfulScripts && 
        <input 
        type="image" 
        className="outliner-script-icon" 
        src={scriptIcon} 
        alt="script"
        onClick={() => {
          clearSelection();
          selectObjects([data]);
          editScript(data.scripts[0].name);
        }}/>}
    </span>
</button>

    {!empty && !collapsedUUIDs[data.uuid] && 
    <div className="indentation">
      {children.map((object, i) => {
        if (data.classname === 'Frame') {
          //reverse order of children of frames 
          //so items rendered on top are on top 
          //of list
          object = children[children.length - i - 1];
        }

        return (isActive(object) &&
        <OutlinerObject
          key={object.uuid}
          clearSelection={clearSelection}
          selectObjects={selectObjects}
          editScript={editScript}
          playhead={playhead}
          depth={depth + 1}
          maxDepth={maxDepth}
          display={display}
          highlighted={highlighted}
          toggle={(e, indices, property) => {
            indices.unshift(i);
            toggle(e, indices, property);
          }}
          data={object}
          isActive={isActive}
          collapsedUUIDs={collapsedUUIDs}
          dragging={dragging}
          setDragging={setDragging}
          setFocusObject={setFocusObject}
        />)
      })}
    </div>}
  </div>
  </>);
}
