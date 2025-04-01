import React, { useState, useEffect } from "react";
import axios from 'axios';
import ChooseParams from "./ChooseParams";
import './NestedSelect.css';
import Popper from "@mui/material/Popper";


const NestedMultiSelect = ({ metrics, setSelectedMetric2, selectedMetric2, datasetName, chosenCombinations, setChosenCombinations }) => {
  const [models, setModels] = useState([]);
  const [anchorEl1, setAnchorEl1] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);

  const handleMouseEnter = (event, setAnchor) => {
    setAnchor(event.currentTarget);
  };

  const handleMouseLeave = (setAnchor) => {
    setAnchor(null);
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/performance/trained_models/${datasetName}`);
        const data = response.data;

        const transformedData = data.map(item => ({
          name: item.model_name.value,
          open: false,
          picked: false
        }));

        setModels(transformedData);
      } catch (error) {
        console.error(`Error fetching available models for ${datasetName}:`, error);
      }
    };

    fetchData();
  }, [datasetName]);

  const handleMetricChange2 = (event) => {
    setSelectedMetric2(event.target.value);
  };
  const handleModelChange = (modelName) => {
    setModels(models.map((model) => {
      if (model.name === modelName) {
        return { ...model, open: !model.open };
      }
      return model;
    }));
  };

  // Remove a combination from chosenCombinations
  const removeCombination = (combinationToRemove) => {
    console.log(chosenCombinations)
    console.log(combinationToRemove)
    const updatedCombinations = chosenCombinations.filter(comb => 
      JSON.stringify(comb) !== JSON.stringify(combinationToRemove)
    );
    setChosenCombinations(updatedCombinations);
  };



  return (
    <div id="NestedContainer">

      <div id="NestedContainerLeft">

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
                  {" "}
                  {metric}{" "}
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
          {models.map((model, index) => (
            <div key={index}>
              <button
                className={`multiSelectButton level0 ${model.open ? 'open' : ''} ${model.picked ? 'picked' : ''}`}
                onClick={() => handleModelChange(model.name)}
                >
                {model.name}
              </button>
              {model.open && (
                <ChooseParams
                  metric={selectedMetric2}
                  datasetName={datasetName}
                  modelName={model.name}
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
              <p className="bubbleText" >{comb.metric} - {comb.modelName}: {comb.params.map(param => `${param.key}: ${param.value}`).join(", ")}</p>
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

export default NestedMultiSelect;
