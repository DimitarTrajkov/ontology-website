import axios from "axios";
import React, { useEffect, useState } from "react";
import './NestedSelect.css';

const NestedSelectExpModel = ({ metric, datasetName, chosenCombinations, setChosenCombinations }) => {
  const [data, setData] = useState();
  const [selectedValues, setSelectedValues] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available models
        const modelResponse = await axios.get(
          `http://localhost:5000/performance/trained_models/${datasetName}`
        );
        const modelData = modelResponse.data;
  
        const transformedModels = modelData.map((item) => item.model_name.value);
        // console.log("Fetched models:", transformedModels);
        if (transformedModels.length === 0) return; // No models, exit early
  
        // Fetch hyperparameter combinations for each model
        const responses = await Promise.all(
          transformedModels.map(async (model) => {
            const response = await axios.get(
              `http://localhost:5000/performance/trained_hyperparam_comb/${datasetName}/${model}`
            );
            return { modelName: model, data: response.data };
          })
        );
  
        const paramComb = {};
  
        responses.forEach(({ modelName, data }) => {
          paramComb[modelName] = [];
          data.forEach(({ param_string }) => {
            const tmp = param_string.value.slice(1).split('=').map((item)=>item.replace("_", ", ")).join("=")
            paramComb[modelName].push({combinations: tmp, picked: false});
          });
        });

        let formattedParams = Object.entries(paramComb).map(([key, values]) => ({
          name: key,
          values: Array.from(values),
          open: false,
          picked: false,
        }));
        // const pickedOpened = TODO TODO TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        formattedParams = formattedParams.map((param) => {
          const updatedValues = param.values.map((value) => ({
            ...value,
            picked: chosenCombinations.some(
              (chosen) => (
                chosen.metric === metric &&
                chosen.datasetName === datasetName &&
                chosen.modelName === param.name &&
                chosen.params === value.combinations.replace(/, /g, "_")
              )
            ),
          }));
  
          return {
            ...param,
            values: updatedValues,
            picked: updatedValues.some((value) => value.picked), // Set outer picked if any value is picked
          };
        });
        // console.log("Processed Parameter Map:", formattedParams);
        setData(formattedParams);
      } catch (error) {
        console.error(`Error fetching models or hyperparameters for ${datasetName}:`, error);
      }
    };
  
    fetchData();
  }, [datasetName]);



  // when metric is swithed the picked options are changed apropriate to that metric
  useEffect(() => {
    if(!data || data.length == 0)
      return;
    setData((prevData) => {
      return prevData.map((param) => {
        const updatedValues = param.values.map((value) => ({
          ...value,
          picked: chosenCombinations.some(
            (chosen) =>
              chosen.metric === metric &&
              chosen.datasetName === datasetName &&
              chosen.modelName === param.name &&
              chosen.params === value.combinations.replace(/, /g, "_")
          ),
        }));
  
        return {
          ...param,
          values: updatedValues,
          picked: updatedValues.some((value) => value.picked),
        };
      });
    });
  }, [metric, chosenCombinations]);
  
  const handleSelectionModel = (index) => {
    // console.log(data[0].open)
    // console.log("Toggling open for index:", index);
    setData((prevData) => {
      // Ensure you're correctly modifying the state with a shallow copy and the toggle
      return prevData.map((item, i) =>
        i === index ? { ...item, open: !item.open } : item
      );
    });
  };
  

const addCombination = (index, modelName, combination, i) => {
  const newCombination = {
    metric,
    datasetName,
    modelName,
    params: combination.combinations.replace(/, /g, "_"),
  };

  // Check if the combination is already picked
  if (combination.picked) {
    // Remove the combination from the chosenCombinations
    setChosenCombinations((prevCombinations) =>
      prevCombinations.filter(
        (comb) =>
          !(
            comb.metric === newCombination.metric &&
            comb.datasetName === newCombination.datasetName &&
            comb.modelName === newCombination.modelName &&
            comb.params === newCombination.params
          )
      )
    );

    // Mark the combination as unpicked in the `data` state and update the first-level `picked`
    setData((prevData) => {
      const updatedData = [...prevData];
      updatedData[index].values = updatedData[index].values.map((item, idx) =>
        idx === i ? { ...item, picked: false } : item
      );

      // Check if all combinations are picked
      const allPicked = updatedData[index].values.every((item) => item.picked === false);
      updatedData[index].picked = allPicked ? false : true; // Update the `picked` state at the first level

      return updatedData;
    });
  } else {
    // Add the combination to `chosenCombinations`
    setChosenCombinations((prevCombinations) => [...prevCombinations, newCombination]);

    // Mark the combination as picked in the `data` state and update the first-level `picked`
    setData((prevData) => {
      const updatedData = [...prevData];
      updatedData[index].values = updatedData[index].values.map((item, idx) =>
        idx === i ? { ...item, picked: true } : item
      );

      updatedData[index].picked = true ; // Update the `picked` state at the first level

      return updatedData;
    });
  }

  console.log('data', data);
};

  return (
    <div>
    <div>
      {data &&
        data.map((model, index) => (
          <div key={index} className="level1Container">
            <div onClick={() => handleSelectionModel(index)}
               className={`multiSelectButton level1 ${model.open ? 'open' : ''} ${model.picked ? 'picked' : ''}  `}>
              {model.name}:
            </div>
            <div className="level2Container">
              {model.open &&
                model.values.map((combination, i) => (
                  <div
                    key={i}
                    onClick={() => addCombination(index, model.name, combination, i)}
                    className={`multiSelectButton level2 ${combination.picked ? 'picked' : ''}`}

                  >
                    {combination.combinations}
                  </div>
                ))}
            </div>
          </div>
        ))}
    </div>
  </div>
  
  );
};

export default NestedSelectExpModel;
