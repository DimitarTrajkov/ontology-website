import React, { useState, useEffect } from "react";
import axios from 'axios';
import ChooseParams from "./ChooseParams";
import './NestedSelect.css';
import CloseIcon from '@mui/icons-material/Close';
import ParameterSelect from "./ParameterSelect";




const NestedMultiSelect1 = ({ datasetName, chosenCombinations, setChosenCombinations }) => {
  const [models, setModels] = useState([]);

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
    const updatedCombinations = chosenCombinations.filter(comb => 
      JSON.stringify(comb.params) !== JSON.stringify(combinationToRemove.params)
    );
    setChosenCombinations(updatedCombinations);
  };

  return (
    <div id="NestedContainer">
      <div id="multiSelectContainer1">
        {models.map((model, index) => (
          <div key={index}>
            <button
              className={`multiSelectButton level0 ${model.open ? 'open' : ''} ${model.picked ? 'picked' : ''}`}
              onClick={() => handleModelChange(model.name)}
            >
              {model.name}
            </button>
            {model.open && (
              <ParameterSelect
                datasetName={datasetName}
                modelName={model.name}
                chosenCombinations={chosenCombinations}
                setChosenCombinations={setChosenCombinations}
              />
            )}
          </div>
        ))}
      </div>

      <div id="selectedCombinationsContainer">
        <button>See Selected HyperParameters:</button>
        {/* <div className="chosenCombinationsContainer">
          {chosenCombinations.map((comb, index) => (
            <div key={index} className="combinationBubble">
              <div className="bubbleTextContainer">
              <p className="bubbleText">{comb.metric} - {comb.modelName} </p>
              <p className="bubbleText" >{comb.params.map(param => `${param.key}: ${param.value}`).join(", ")}</p>
              </div>
              <div id="xButtonContainer">
              <button className="xButton"onClick={() => removeCombination(comb)}>x</button>
              </div>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default NestedMultiSelect1;
