import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../Header";
import "../MetaFeaturePage/MetaFeaturePage.css";
import "./ComparePage.css";
import MyRadarPlot from "../PlotComponents/MyRadarPlot";
import MyHeatmap from "../PlotComponents/MyHeatmap";
import MyBarChart from "../PlotComponents/MyBarChart";
import { Alert, Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select, Skeleton } from "@mui/material";
import NavigationBar from "../NavigationComponent/NavigationBar";
import axios from 'axios';
import Footer from "../Footer/Footer";


const ComparePage = () => {
  const { datasetName } = useParams();
  const [loading, setLoading] = useState(true);

  const metrics = [
    { label: "Accuracy", value: "acc" },
    { label: "F1 Score", value: "f1" },
    { label: "Precision", value: "precision" },
    { label: "Recall", value: "recall" },
  ];

  const models = [
    { label: "Adaboost", value: "Adaboost" },
    { label: "Support Vector Classifier", value: "SVC" },
    { label: "Decision Tree", value: "decision Tree" },
  ];

  const [selectedMetric, setSelectedMetric] = useState(metrics[0].value); // Default to the first metric
  const handleMetricChange = (event) => {
    setSelectedMetric(event.target.value);
  };

  const [selectedModel1, setSelectedModel1] = useState(""); // Default to the first Model
  const handleModelChange1 = (event) => {
    setSelectedModel1(event.target.value);
  };
  const [selectedModel2, setSelectedModel2] = useState(""); // Default to the first Model
  const handleModelChange2 = (event) => {
    setSelectedModel2(event.target.value);
  };


  const [showAlert, setShowAlert] = useState(false);
  const [selectedMetricsForBarPlot, setSelectedMetricsForBarPlot] = useState([]);
  const handleTypeChange = (event) => {
    const selectedOptions = event.target.value;


    if (selectedOptions.length > 3) {
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    }

    const limitedSelections = selectedOptions.length > 3
      ? selectedOptions.slice(0, 3)
      : selectedOptions;

    setSelectedMetricsForBarPlot(limitedSelections);
  };



  const [model1Data, setModel1Data] = useState(null);
  const [model2Data, setModel2Data] = useState(null);
  useEffect(() => {
    const fetchData = async (modelName, existingData) => {
      if (modelName && modelName !== (existingData?.modelName || null)) {
        try {
          // setLoading(true);
          const response = await axios.get(`http://localhost:5000/${datasetName}/${modelName}`);
          const data = response.data;
          // setLoading(false);
          return data;
        } catch (error) {
          console.error(`Error fetching data for ${modelName}:`, error);
          // setLoading(false);
          return null;
        }
      } else {
        return existingData;
      }
    };
    
    const fetchModelsData = async () => {
      const data1 = await fetchData(selectedModel1, model1Data); // Pass existing data
      setModel1Data(data1);
      console.log(model1Data);
      
      
      const data2 = await fetchData(selectedModel2, model2Data); // Pass existing data
      setModel2Data(data2);
      console.log(model2Data);
    };
    
    if (selectedModel1 || selectedModel2) { // Fetch if at least one model is selected
      fetchModelsData();
    } else {
      // Clear data if no models are selected
      setModel1Data(null);
      setModel2Data(null);
      setHeatMapData(null);
    }
  }, [selectedModel1, selectedModel2, datasetName]);
  
  
  
  
  const [heatMapData, setHeatMapData] = useState(null);
  
  useEffect(() => {
    if (model1Data && model2Data) {
      const calculateHeatmapData = () => {
        const numRows = model1Data.length;
        const numCols = model1Data[0].length;
        const newHeatMapData = Array(numRows).fill(null).map(() => Array(numCols).fill(0));

        for (let i = 0; i < numRows; i++) {
          for (let j = 0; j < numCols; j++) {
            newHeatMapData[i][j] = model1Data[i][j] - 0.2*model2Data[i][j];
            // newHeatMapData[i][j] = model1Data[i][j] - model2Data[i][j];
          }
        }
        return newHeatMapData;
      };

      const calculatedHeatmap = calculateHeatmapData();
      setHeatMapData(calculatedHeatmap);
    } else {
      setHeatMapData(null);
    }
  }, [model1Data, model2Data]);

  // if (loading) {
  //   return <div>Loading dataset...</div>;
  // }

  
  return (
    <div className="mainContainer">
      {showAlert && (
        <Alert
          id="compareAlertContainer"
          className="alert"
          variant="filled"
          severity="warning"
          onClose={() => setShowAlert(false)}
        >
          You can select up to 3 options only!
        </Alert>)}
      <Header />
      <h1 className="TitleText">Dataset: {datasetName}</h1>
      <NavigationBar datasetName={datasetName} />
      <div id="CompareContainer" className="basicContainer">
        <div id="ComparingTextContainer">
          <p id="compareMetricText">Comparing models primarly on: </p>
          <select
            id="metricSelect"
            value={selectedMetric}
            onChange={handleMetricChange}
            className="selectUnderlineStyle"
          >
            {metrics.map((metric) => (
              <option key={metric.value} value={metric.value}>
                {metric.label}
              </option>
            ))}
          </select>
        </div>
        <div id="compareTitleContainer">
          <h4 id="compareTitle">Choose Model that you want to compare</h4>
        </div>
        <div id="chooseModelsContainer">
          <select
            id="modelSelect1"
            value={selectedModel1}
            onChange={handleModelChange1}
            className="selectUnderlineStyle modelCompare"
          >
            <option value="" disabled>Select a model</option>
            {models.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
          <select
            id="modelSelect1"
            value={selectedModel2}
            onChange={handleModelChange2}
            className="selectUnderlineStyle modelCompare"
          >
          <option value="" disabled>Select a model</option>
            {models.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
        </div>
        {
          selectedModel1 && selectedModel2 ? (
            <div>
        <div id="basicComparesonContainer">
        {heatMapData ? (
          <MyRadarPlot 
          data = {[
            { modelName: "Adaboost", performance: 0.8, overfitting: 0.75, fit_time: 0.85, predict_time: 0.8,  robustness: 0.3 },
            { modelName: "Random Forest", performance: 0.7, overfitting: 0.72, fit_time: 0.8, predict_time: 1, robustness: 0.6 },
            // { modelName: "Adaboost", fold1: 0.8, fold2: 0.75, fold3: 0.85, fold4: 0.8,  fold5: 0.3, fold6: 0.85, fold7: 0.8,  fold8: 0.3, fold9: 0.85, fold10: 0.8 },
            // { modelName: "Random Forest", fold1: 0.7, fold2: 0.72, fold3: 0.8, fold4: 1, fold5: 0.6, fold6: 0.65, fold7: 0.98,  fold8: 0.93, fold9: 0.18, fold10: 0.38 },
          ]}
          // metrics = {["fold1", "fold2", "fold3", "fold4","fold5","fold6", "fold7" ,  "fold8" , "fold9", "fold10"]}
          metrics = {["performance", "overfitting", "fit_time", "predict_time","robustness"]}
          title="Radar model performance ACCURACY"
          />
          ) : (
          <Skeleton sx={{ bgcolor: '#C1BAA1', width: '30%', height: '60vh'}} className="ChartsMainContainer alingCenter" variant="rounded" />
          )}
          {heatMapData ? (
            <MyHeatmap 
            data = {heatMapData}
            x={['1', '2', '3', '4', '5','6', '7', '8', '9', '10','11', '12', '13', '14', '15','16', '17', '18', '19', '20','21', '22', '23', '24', '25','26', '27', '28', '29', '30']}
            y ={ ['C = 0.1', 'C = 1', 'C = 10', 'C = 100']}
            title="Difference between model performances "
            xAxisTitle="Number of fold"
            yAxisTitle="Metric"
            />
          ) : (
          <Skeleton sx={{ bgcolor: '#C1BAA1', width: '50%', height: '60vh'}} className="ChartsMainContainer alingCenter" variant="rounded" />
          )}
        </div>
      <div id='BarChartComponentContainer'>

        <div className='brakeLine'></div>

        <div id='BarChartComponentText'>
          <p>Pick metrics which you want to visualize on the bar plot: </p>
          <FormControl id="typeFilter" sx={{ width: '100%', height: '100%' }}>
            <InputLabel id="type-multiple-label" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>Selected types</InputLabel>
            <Select
              labelId="type-multiple-label"
              id="type-multiple"
              multiple
              value={selectedMetricsForBarPlot}
              onChange={handleTypeChange}
              renderValue={(selected) => selected.map(item => item).join(', ')}
              sx={{ width: '100%', height: '100%' }}
            >
            {metrics.map((metric) => (
              <MenuItem
                key={metric.label}  // Use a unique key (important!)
                value={metric.label}      // Store the entire object as the value
                sx={{
                  backgroundColor: '#ECEBDE',
                  '&:hover': {
                    backgroundColor: '#C1BAA1',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#C1BAA1',
                  },
                  '&:focus': {
                    backgroundColor: '#ECEBDE',
                  },
                }}
              >
                <Checkbox checked={selectedMetricsForBarPlot.some(selectedMetric => selectedMetric === metric.label)} />
                <ListItemText primary={metric.label} />
              </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div id='BarChartComponentPlot'>
          <MyBarChart
          data={[
            [ 0.02, 0.88,  0.2, 0.38, 0.47, 0.11, 0.99, 0.11, 0.92, 0.59],
            [ 0.23, 0.77, 0.41, 0.04, 0.32, 0.34, 0.18, 0.54, 0.98, 0.62],
            [ 0.18, 0.74, 0.85, 0.61, 0.37,  0.5, 0.24,  0.5, 0.49, 0.03],
            [ 0.7, 0.61, 0.84, 0.39,  0.4, 0.57, 0.44, 0.77, 0.81, 0.99 ],
            [ 0.96, 0.62, 0.02, 0.05, 0.35, 0.25, 0.2, 0.02, 0.94, 0.24 ],
            [ 0.29, 0.05, 0.28, 0.71, 0.84, 0.04, 0.98, 0.91, 0.46, 0.14 ]
            ]}
            labels={['fold 1', 'fold 2', 'fold 3', 'fold 4', 'fold 5', 'fold 6', 'fold 7', 'fold 8', 'fold 9', 'fold 10']} // Length mismatch!
            seriesNames={['accuracy Adaboost', 'acciracy SVC', 'precision Adaboost',  'precision SVC', 'recall Adaboost', 'recall SVC',]} // Length mismatch!
            title={`Bar plot comparing performnace across ${selectedModel1} and ${selectedModel2}`}
            barmode="group" // Or "stack" "overlay" "relative" "group"
            />
        </div>

      </div>
        </div>) : (
          <div id="beforeSelectionContainer" className="alignCenter">
            <p> select model to see detailed analysis </p>
          </div >
          )}
      </div>
      <Footer />
    </div>
  );
};

export default ComparePage;
