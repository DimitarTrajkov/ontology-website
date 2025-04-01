import React, { useState, useEffect } from "react";
import axios from 'axios';
import NestedSelectExpModel from "./NestedSelectExpModel";
import './NestedSelect.css';
import Popper from "@mui/material/Popper";


const NestedSelectExpDataset = ({ metrics, setSelectedMetric2, selectedMetric2, chosenCombinations, setChosenCombinations }) => {
  const [datasets, setDatasets] = useState([]);
  const [anchorEl1, setAnchorEl1] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);

  const handleMouseEnter = (event, setAnchor) => {
    setAnchor(event.currentTarget);
  };

  const handleMouseLeave = (setAnchor) => {
    setAnchor(null);
  };


  useEffect(() => {
    // console.log("problem with metrics", metrics)
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/table/all_datasets`);
        const data = response.data;

        const transformedData = data.map(item => ({
          name: item.dataset.value,
          open: false,
          picked: false
        }));
        // console.log("first", transformedData)
        setDatasets(transformedData);
      } catch (error) {
        console.error(`Error fetching available models for all datasets`, error);
      }
    };

    fetchData();
  }, []);

  const handleMetricChange2 = (event) => {
    setSelectedMetric2(event.target.value);
  };
  const handleDatasetChange = (modelName) => {
    setDatasets(datasets.map((model) => {
      if (model.name === modelName) {
        return { ...model, open: !model.open };
      }
      return model;
    }));
  };

  // Remove a combination from chosenCombinations
  const removeCombination = (combinationToRemove) => {
    // console.log(chosenCombinations)
    // console.log(combinationToRemove)
    const updatedCombinations = chosenCombinations.filter(comb => 
      JSON.stringify(comb) !== JSON.stringify(combinationToRemove)
    );
    setChosenCombinations(updatedCombinations);
  };



  return (
    <div id="NestedContainerEXP">

      <div id="NestedContainerLeftEXP">

        <div id="selectMetricForInnerContainer" className="alignCenter">
          <p 
            onMouseEnter={(e) => handleMouseEnter(e, setAnchorEl1)}
            onMouseLeave={() => handleMouseLeave(setAnchorEl1)}
            >
            Select metric: </p>
          <Popper  open={Boolean(anchorEl1)} anchorEl={anchorEl1} placement="top">
            <p className="popUpText">data added to the charts will be from the selected metric</p>
          </Popper>


          {metrics && metrics.length > 0 && (
            <select
              id="metricSelectViolinAndRadar"
              value={selectedMetric2}
              onChange={handleMetricChange2}
              className="selectUnderlineStyle"
              >
              {metrics.map((metric) => (
                <option key={metric} value={metric}>
                  {" "}{metric}{" "}
                </option>
              ))}
            </select>
          )}
        </div>


        <div id="multiSelectContainer1">
          <p
            id="multiSelectText"
           onMouseEnter={(e) => handleMouseEnter(e, setAnchorEl2)}
           onMouseLeave={() => handleMouseLeave(setAnchorEl2)}
           >
            Available Models:</p>
          <Popper  open={Boolean(anchorEl2)} anchorEl={anchorEl2} placement="top">
            <p className="popUpText">select the model and hyperparameter that you want to compare</p>
          </Popper>
          {datasets.map((dataset, index) => (
            <div key={index}>
              <button
                className={`multiSelectButton level0 ${dataset.open ? 'open' : ''} ${dataset.picked ? 'picked' : ''}`}
                onClick={() => handleDatasetChange(dataset.name)}
                >
                {dataset.name}
              </button>
              {dataset.open && (
                <NestedSelectExpModel
                  metric={selectedMetric2}
                  datasetName={dataset.name}
                  chosenCombinations={chosenCombinations}
                  setChosenCombinations={setChosenCombinations}
                  />
              )}
            </div>
          ))}
        </div>

      </div>

      <div id="selectedCombinationsContainer">
        <p>Selected Combinations:</p>
        <div className="chosenCombinationsContainer">
          {chosenCombinations.map((comb, index) => (
            <div key={index} className="combinationBubble">
              <div className="bubbleTextContainer">
              <p className="bubbleText" >{comb.datasetName}-{comb.metric} - {comb.modelName}: {comb.params}</p>
              </div>
              <div id="xButtonContainer">
              <button className="xButton"onClick={() => removeCombination(comb)}>x</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NestedSelectExpDataset;
