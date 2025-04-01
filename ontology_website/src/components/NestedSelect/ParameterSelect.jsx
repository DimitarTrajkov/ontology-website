import React, { useState, useEffect } from "react";
import './NestedSelect.css';
import axios from "axios";

const ParameterSelect = ({  datasetName, modelName, chosenCombinations, setChosenCombinations }) => {
  const [params, setParams] = useState([]);
  const [allPicked, setAllPicked] = useState(false);
  // Load fake params

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/performance/trained_params/${datasetName}/${modelName}`
        );
        const data = response.data;
    
        const preprocess = data[0].param_string.value.split('=').slice(0,-1);
        const allParams = preprocess.map(item => item.split('_').slice(1).join("_"))
        // console.log("tmp2",allParams);
        const transformedData = allParams.map(param => ({
          picked: false, 
          name: param
        }));


        const updatedData = transformedData.map(item => ({
          ...item,
          picked: item.some(combination => 
            combination.dataset === datasetName &&
            combination.model === modelName &&
            combination.param === item.name)
        }));
        setParams(updatedData);

      } catch (error) {
        console.error(`Error fetching available models for ${datasetName}:`, error);
        return null;
      }
    };
    
    fetchData();    
    
  }, []);
  

  useEffect(() => {
    if (params.length === 0) {
      return;
    }
  
    const updatedData = params.map(item => ({
      ...item,
      picked: chosenCombinations.some(combination => 
        combination.dataset === datasetName &&
        combination.model === modelName &&
        combination.param === item.name
      )
    }));
  
    setParams(updatedData);
  
    // Check if all params are picked
    const allPicked = updatedData.every(item => item.picked);
    setAllPicked(allPicked);
  }, [chosenCombinations]);
  


// useEffect(() => {
//   if (!allPicked)
//     return;
//   console.log("we did it ")
// }, [allPicked]);



const handleModelChange = (modelName) => {
  // setParams(params.map((model) => {
  //   if (model.name === modelName) {
  //     return { ...model, open: !model.open };
  //   }
  //   return model;
  // }));
}

  return (
<div>
  {params.map((model, index) => (
    <div key={index}>
      <button 
      className={`multiSelectButton level1 ${model.picked ? 'picked' : ''}`}
      onClick={() => {handleModelChange(model.name)}}>
        {model.name}
      </button>
    </div>
  ))}
</div>

  );
};

export default ParameterSelect;
