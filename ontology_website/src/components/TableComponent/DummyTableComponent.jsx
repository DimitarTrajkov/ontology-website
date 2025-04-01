import React, { useEffect, useState } from "react";
import { Skeleton, Switch } from "@mui/material";
import "./TableComponent.css";
import DownloadIcon from '@mui/icons-material/Download';


const DummyTableComponent = ({outterTrueCheck, setOutterTrueCheck, title, innerOutter}) => {

  return (
    <div style={{ height: 400, width: "100%" }}>
        <div id="tableHeaderAndButtonsContainer">
          {innerOutter ? (
            <div id="innerOutterToggleContainer">
              <p>Toggle Inner/Outter</p>
              <Switch
                  checked={outterTrueCheck}
                  onChange={(e) => {setOutterTrueCheck(e.target.checked)}}
                  inputProps={{ 'aria-label': 'controlled' }}
                  sx={{
                    // '& .MuiSwitch-switchBase.Mui-checked': {color: 'var(--color1)',},
                    // '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {backgroundColor: '#727D73',},
                  }}
                  />
            </div>
          ) : (<div></div>)}
            <h2>{title}</h2>
            <button id="downloadCSVButton" style={{ marginBottom: 10 }}>
            <p>Download CSV</p>
            <DownloadIcon />
            </button>
        </div>
        <Skeleton sx={{ bgcolor: '#C1BAA1', width: '100%', height: '100%'}} variant="rounded"/>
    </div>
  );
};

export default DummyTableComponent;
