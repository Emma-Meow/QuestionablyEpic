import React from "react";
import { Button } from "@material-ui/core/";
import classIcons from "../../CooldownPlanner/Functions/IconFunctions/ClassIcons";
import { classColoursJS } from "../../CooldownPlanner/Functions/ClassColourFunctions";

export default function CharacterHeaderButton(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // const handleClose = () => {
  //   setAnchorEl(null);
  // };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const currentCharacter = props.allChars.allChar[props.allChars.activeChar];

  return (
    <div style={{ textAlign: "center" }}>
      <Button disabled={true} aria-describedby={id} style={{ color: classColoursJS(currentCharacter.spec) }} onClick={handleClick}>
        {props.allChars.getAllChar().length > 0 ? (
          // TODO: Change classIcons to accept a styles prop to remove the padding on the right for this component only
          <div style={{ display: "inline-flex" }}>
            {classIcons(currentCharacter.spec, { height: 18, width: 18, margin: "2px 5px 0px 0px", verticalAlign: "middle", borderRadius: 4, border: "1px solid rgba(255, 255, 255, 0.12)" })}
            {currentCharacter.charName}
          </div>
        ) : (
          ""
        )}
      </Button>
    </div>
  );
}