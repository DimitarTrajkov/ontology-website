import React, { useState, useEffect } from "react";
import './NestedSelect.css';
import axios from "axios";

const Parameter2Select = ({ datasetName, modelName, paramName, chosenCombinations, setChosenCombinations}) => {
  const [hyperParams, setHyperParams] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/performance/trained_hyperparams/${datasetName}/${modelName}/${paramName}`
        );
        const data = response.data;
        const preprocess = data.map(item => item.hyper_param_name.value);
        const transformedData = preprocess.map(param => ({
          picked: false, 
          name: param
        }));
        // console.log(transformedData)


        const updatedData = transformedData.map(item => ({
          ...item,
          picked: chosenCombinations.some(combination =>
            combination.dataset === datasetName &&
            combination.model === modelName &&
            combination.param === paramName &&
            combination.hyperParam === item.name
          )
        }));
        
        setHyperParams(updatedData);        

      } catch (error) {
        console.error(`Error fetching available models for ${datasetName}:`, error);
        return null;
      }
    };
    
    fetchData();    
    
  }, []);

  
  // const handleHyperParamsChange = (hyperParamterName) => {
  //   // change the state of the hyperParams with the given name
  //   setHyperParams(hyperParams.map((hyperParams) => {
  //     if (hyperParams.name === hyperParamterName) {
  //       return { ...hyperParams, picked: !hyperParams.picked };
  //     }
  //     return hyperParams;
  //   }));
  //   // push hyperParamterName to chosenCombinations
  //   const hyperParameterFullName = `${datasetName}-${modelName}-${paramName}-${hyperParamterName}`;
  //   if (!chosenCombinations.includes(hyperParameterFullName)) {
  //     setChosenCombinations([...chosenCombinations, hyperParameterFullName]);
  //   } else {
  //     setChosenCombinations(chosenCombinations.filter((item) => item !== hyperParameterFullName));}
  // }
  const handleHyperParamsChange = (hyperParamterName) => {
    // Update hyperParams state
    setHyperParams(hyperParams.map((hyperParam) => {
      if (hyperParam.name === hyperParamterName) {
        return { ...hyperParam, picked: !hyperParam.picked };
      }
      return hyperParam;
    }));
  
    // Create dictionary object instead of string with '-'
    const hyperParameterObj = {
      dataset: datasetName,
      model: modelName,
      param: paramName,
      hyperParam: hyperParamterName
    };
  
    // Check if the object already exists in chosenCombinations
    const exists = chosenCombinations.some(
      (item) =>
        item.dataset === datasetName &&
        item.model === modelName &&
        item.param === paramName &&
        item.hyperParam === hyperParamterName
    );
  
    if (!exists) {
      setChosenCombinations([...chosenCombinations, hyperParameterObj]);
    } else {
      setChosenCombinations(
        chosenCombinations.filter(
          (item) =>
            item.dataset !== datasetName ||
            item.model !== modelName ||
            item.param !== paramName ||
            item.hyperParam !== hyperParamterName
        )
      );
    }
  };  
  
  return (
<div>
  {hyperParams.map((item, index) => (
    <div key={index}>
      <button 
      className={`multiSelectButton level2 ${item.picked ? 'picked' : ''}`}
      onClick={() => {handleHyperParamsChange(item.name)}}>
        {item.name}
      </button>
    </div>
  ))}
</div>

  );
};

export default Parameter2Select;
