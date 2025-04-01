import axios from "axios";
import React, { useEffect, useState } from "react";

const ChooseParams = ({ metric, datasetName, modelName, chosenCombinations, setChosenCombinations }) => {
  const [data, setData] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/performance/trained_hyperparam_comb/${datasetName}/${modelName}`
        );
        const rawData = response.data;
        
        const paramMap = {};

        rawData.forEach(({ param_string }) => {
          const paramStr = param_string.value;
          const regex = /_(.*?)=(.*?)(?=_|$)/g;
          let match;
          while ((match = regex.exec(paramStr)) !== null) {
            const paramName = match[1];
            const paramValue = match[2];

            if (!paramMap[paramName]) {
              paramMap[paramName] = new Set();
            }
            paramMap[paramName].add(paramValue);
          }
        });

        const formattedParams = Object.entries(paramMap).map(([key, values]) => ({
          param_name: key,
          values: Array.from(values),
        }));

        setData(formattedParams);
        console.log("cisto da vidam", formattedParams);
        setSelectedValues(Array(formattedParams.length).fill("")); // Reset selected values
      } catch (error) {
        console.error(`Error fetching available models for ${datasetName}:`, error);
      }
    };

    fetchData();
    console.log(data)
  }, [datasetName, modelName]);

  const handleSelection = (paramIndex, value) => {
    const newSelectedValues = [...selectedValues];
    newSelectedValues[paramIndex] = value;
    setSelectedValues(newSelectedValues);
  };

  const addCombination = () => {
    if (selectedValues.includes("")) {
      alert("Please select all parameters before adding.");
      return;
    }

    const newCombination = {
      metric,
      datasetName,
      modelName,
      params: data.map((param, index) => ({ key: param.param_name, value: selectedValues[index] }))
    };

    const exists = chosenCombinations.some(comb => 
      comb.metric === metric &&
      comb.datasetName === datasetName &&
      comb.modelName === modelName &&
      JSON.stringify(comb.params) === JSON.stringify(newCombination.params)
    );
    // console.log("exists", exists)
    // console.log("newCombination", newCombination)
    // console.log("allCMB", [...chosenCombinations, newCombination])
    if (!exists) {
      setChosenCombinations([...chosenCombinations, newCombination]);
      setSelectedValues(Array(data.length).fill("")); // Clear selected values
    } else {
      alert("This parameter combination is already added.");
    }
  };

  return (
    <div>
      <div>
        {data.map((param, index) => (
          <div key={index} className="hyperParamName">
            {param.param_name}:
            <div>
              {param.values.map((option, i) => (
                <div 
                  key={i}
                  className={`multiSelectButton hyperParamVal ${ selectedValues[index] === option ? 'picked' : ''}`}
                  onClick={() => handleSelection(index, option)}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className={`generalAddButton ${selectedValues.includes("") ? 'disabledAddButton' : 'enabledAddButton' }`} onClick={addCombination} disabled={selectedValues.includes("")}>ADD</button>
    </div>
  );
};

export default ChooseParams;
