import React, { useState, useEffect } from "react";
import Header from "../Header";
import "./ExperimentList.css";
import axios from "axios";
import Skeleton from "@mui/material/Skeleton";
import {CircularProgress, FormControl,Input,InputLabel,MenuItem,Select,} from "@mui/material";
import Footer from "../Footer/Footer";
import MetricDialog from "./MetricDialog";
import { FilterList } from "@mui/icons-material";
import TableContainer from "../TableComponent/TableComponent";
import NestedSelectExpDataset from "../NestedSelectExp/NestedSelectExpDataset";
import MyViolinPlot from "../PlotComponents/MyViolinPlot";
import MyRadarPlot from "../PlotComponents/MyRadarPlot";
import ViolinTableContainer from "./ViolinTableContainer";
import DummyTableComponent from "../TableComponent/DummyTableComponent";

const ExperimentList = () => {
  const [data, setData] = useState([]);
  const [data1, setData1] = useState();
  const [outterFoldData, setOutterFoldData] = useState();
  const [filterText, setFilterText] = useState([]);
  const [loadingMain, setLoadingMain] = useState(true);
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [loading3, setLoading3] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [metricRange, setMetricRange] = useState();

  const [metrics, setMetrics] = useState([]);
  const [selectedMetric2, setSelectedMetric2] = useState([]);
  const [selectedMetric1, setSelectedMetric1] = useState();
  const [chosenCombinations, setChosenCombinations] = useState([]);
  const [modelNames, setModelNames] = useState([]);
  const [datasetNames, setDatasetNames] = useState([]);
  const [chosenCombinationsData, setChosenCombinationsData] = useState({});
  const [radarPlotData, setRadarPlotData] = useState({});
  const [models, setModels] = useState();
  const [selectedModel, setSelectedModel] = useState();

  const [openDialog, setOpenDialog] = useState(false);
  const [filters, setFilters] = useState([]);
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const [dataType, setDataType] = useState("tabular");
  const [taskType, setTaskType] = useState("binaryClassification");

  const handleMetricChange1 = (event) => {
    setSelectedMetric1(event.target.value);
  };
  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  useEffect(() => {
    if (!loading1 && !loading2 && !loading3) {
      setLoadingMain(false);
    }
  }, [loading1, loading2, loading3]);
  // TABLE USEEFFECT
  useEffect(() => {
    if (!metricRange) return;
    const fetchData = async () => {
      try {
        setLoadingTable(true);

        // take the metric ranges that are changed and the others set them to default
        const queryFilters = metricRange.map((metric) => {
          const existingFilter = filters.find( (filter) => filter.metricName === metric.metricName );
          return existingFilter ? existingFilter : metric;
        });
        const response = await axios.get(
          `http://localhost:5000/table/all_experiments_range_filtered`,
          {params: {metricList: JSON.stringify(queryFilters),},}
        );
        const data = response.data;

        const transformedData = data.map((item) => {
          const { experiment, metrics_values } = item;
          const parts = experiment.value.split("_");

          const metricsArray = metrics_values.value.split(", ")
            .map((metric) => {
              // Split each pair into metric name and value
              const [metricName, value] = metric.split(": ");
              return { [metricName]: parseFloat(value) }; // Convert value to float
            })
            .reduce((acc, curr) => ({ ...acc, ...curr }), {}); // Merge the metric objects into one

          return {
            id: experiment.value,
            "dataset name": parts.slice(0, 2).join("_"),
            "model name":  parts[2],
            "hyperparameters combination": parts.slice(3).join("_"),
            ...metricsArray,
          };
        });

        setData1(transformedData);
        setLoadingTable(false);
      } catch (error) {
        console.error(`Error fetching experiments`, error);
        return null;
      }
    };

    fetchData();
  }, [metricRange, filters]);

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    // Function to format combination string
    const formatCombinationString = (combination) => {
      // console.log(combination.params);
      const paramString = combination.params.replace(/\[/g, "\\\\[").replace(/]/g, "\\\\]");
      return encodeURIComponent(`${combination.datasetName}_${combination.modelName}_${paramString}`);
    };

    const formatForStoring = (combination) => {
      const paramString = combination.params.replace(/\[/g, "\\\\[").replace(/]/g, "\\\\]");
      return encodeURIComponent(`${combination.datasetName}_${combination.metric}_${combination.modelName}_${paramString}`
      );
    };

    // Make a copy of the current chosenCombinationsData
    const newCombinationsData = { ...chosenCombinationsData };
    const newRadarPlotData = { ...radarPlotData };
    console.log("newCombinationsData", newCombinationsData);
    // console.log("newRadarPlotData", newRadarPlotData)
    // console.log("chosenCombinations", chosenCombinations);
    // Fetch data for new combinations
    chosenCombinations.forEach(async (combination) => {
      // console.log(combination)
      const combinationString = formatCombinationString(combination);
      // Check if data exists for the formatted combination string

      if (!newRadarPlotData[combinationString]) {
        try {
          // If data does not exist, fetch it using axios
          // console.log("strigno za fetchane", combinationString);
          const response = await axios.get(`http://localhost:5000/performance/inner_hyperparam/avg_all_metrics/${combinationString}`);
          const data = response.data;
          // Store fetched data in newCombinationsData
          newRadarPlotData[combinationString] = data.map((item) => ({
            value: item.average_value.value,
            label: item.metric.value,
          }));
          // console.log("newRadarPlotData", newRadarPlotData);

          // Update state with the new data
          setRadarPlotData((prevData) => ({
            ...prevData,
            [combinationString]: newRadarPlotData[combinationString],
          }));
        } catch (error) {
          console.error(
            `Error fetching data for combination ${combinationString}:`,
            error
          );
        }
      }
      if (!newCombinationsData[formatForStoring(combination)]) {
        try {
          // If data does not exist, fetch it using axios
          const response = await axios.get(
            `http://localhost:5000/performance/inner_hyperparam/${selectedMetric2}/${combinationString}`
          );
          const data = response.data;
          // Store fetched data in newCombinationsData
          newCombinationsData[formatForStoring(combination)] = data.map(
            (item) => ({
              score: item.value.value,
              outterFoldNum: item.outter_fold.value,
              innerFoldNum: item.inner_fold.value,
            })
          );
          // console.log(newCombinationsData);
          // Update state with the new data
          setChosenCombinationsData((prevData) => ({
            ...prevData,
            [formatForStoring(combination)]:
              newCombinationsData[formatForStoring(combination)], // Add new combination
          }));
        } catch (error) {
          console.error(
            `Error fetching data for combination ${combinationString}:`,
            error
          );
        }
      }
    });

    const updatedRadarData = Object.keys(newRadarPlotData).reduce(
      (acc, combinationString) => {
        const isCombinationSelected = chosenCombinations.some(
          (comb) => formatCombinationString(comb) === combinationString
        );

        // Only keep combinations that are still selected
        if (isCombinationSelected) {
          acc[combinationString] = newRadarPlotData[combinationString];
        }

        return acc;
      },
      {}
    );

    setRadarPlotData(updatedRadarData);
    // console.log("data for radar: ", transformedRadarData(updatedRadarData));

    // Remove data for combinations that are no longer present in chosenCombinations
    const updatedCombinationsData = Object.keys(newCombinationsData).reduce(
      (acc, combinationString) => {
        const isCombinationSelected = chosenCombinations.some(
          (comb) => formatForStoring(comb) === combinationString
        );

        // Only keep combinations that are still selected
        if (isCombinationSelected) {
          acc[combinationString] = newCombinationsData[combinationString];
        }

        return acc;
      },
      {}
    );

    // After the removal logic, update state with the filtered combinations data
    setChosenCombinationsData(updatedCombinationsData);
  }, [chosenCombinations]);
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const transformedRadarData = (data) => {
    return Object.entries(data).map(([key, value]) => ({
      modelName: key,
      ...value,
    }));
  };

  const transformDataForPlot = (chosenCombinationsData) => {
    // console.log(chosenCombinationsData)
    return Object.entries(chosenCombinationsData).flatMap(([key, scores]) => {
      // Extract model name from the key (assuming format: datasetName_modelName_params)
      const modelName = decodeURIComponent(key)
        .replace(/_/, " ")
        .replace(/_/, "<br>")
        .replace(/_/, "<br>")
        .replace(/\\/g, "");

      return scores.map(({ score, outterFoldNum, innerFoldNum }) => ({
        modelName,
        score,
        outterFoldNum,
        innerFoldNum,
      }));
    });
  };

  const handleAddFilter = (newFilter) => {
    const existingFilterIndex = filters.findIndex(
      (filter) => filter.metricName === newFilter.metricName
    );

    if (existingFilterIndex !== -1) {
      const updatedFilters = filters.map((filter, index) =>
        index === existingFilterIndex ? newFilter : filter
      );
      setFilters(updatedFilters);
    } else {
      setFilters([...filters, newFilter]);
    }
  };

  const handleRemoveFilter = (index) => {
    // Remove the filter from the filters array by index
    const updatedFilters = filters.filter(
      (_, filterIndex) => filterIndex !== index
    );
    setFilters(updatedFilters);
  };

  // this need to be changed when the filters will work
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading1(true);
        // const response = await axios.get( "http://localhost:5000/performance/metrics/dataset_5" );
        const response = await axios.get( "http://localhost:5000/performance/metrics/" );
        const result = response.data; 

        // transorm the data to the format name, from, to
        const transformedData = result.map((item) => {
          return { metricName: item.metrics.value, from: 0, to: 1 };
        });
        setMetricRange(transformedData);

        // save the metric names only
        const metrics_Names_Only = result.map((item) => item.metrics.value);
        setMetrics(metrics_Names_Only);
        setSelectedMetric2(metrics_Names_Only[0]);
        setSelectedMetric1(metrics_Names_Only[0]);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading1(false);
      }

      try {
        setLoading2(true);
        const response = await axios.get(
          "http://localhost:5000/table/all_models_filtered"
        );
        const result = response.data; 

        const transformedData = result.map((item) => item.model.value);
        setModels(transformedData);
        setSelectedModel(transformedData[0]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading2(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!metricRange) return;

    const fetchData = async () => {
      try {
        // console.log('all metrics', metricRange);
        // console.log('filtered once', filters);
        setLoading3(true);
        const queryFilters = filters.length > 0 ? filters : metricRange;
        const response = await axios.get("http://localhost:5000/experiments/", {
          params: {
            metricList: JSON.stringify(queryFilters),
          },
        });
        const rawData = response.data;

        const formattedData = rawData.map(({ param_string }) => {
          const paramStr = param_string.value;
          const datasetName = paramStr.split("_").slice(0, 2).join("_");
          const modelName = paramStr.split("_").slice(2, 3)[0];

          const hyperparams = paramStr.split("_").slice(3).join("_").split("=");
          const hyperparams1 = hyperparams.slice(1, -1).flatMap((item) => {
            const [first, ...rest] = item.split("_");
            return [first, rest.join("_")];
          });

          const finalHyperparams = [
            hyperparams[0],
            ...hyperparams1,
            hyperparams[hyperparams.length - 1],
          ];

          const params = finalHyperparams.reduce((acc, val, index, arr) => {
            if (index % 2 === 0 && index + 1 < arr.length) {
              acc.push({ paramName: val, paramValue: arr[index + 1] });
            }
            return acc;
          }, []);

          return { datasetName, modelName, params };
        });

        // Set data and model/dataset names for multi-select options
        setData(formattedData);

        const uniqueModels = [
          ...new Set(formattedData.map((item) => item.modelName)),
        ];
        const uniqueDatasets = [
          ...new Set(formattedData.map((item) => item.datasetName)),
        ];

        setModelNames(uniqueModels);
        setDatasetNames(uniqueDatasets);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading3(false);
      }
    };

    fetchData();
  }, [metricRange, filters]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // set_Loading(true);
        if (!selectedMetric1 || !selectedModel) {
          return;
        }
        console.log(
          `http://localhost:5000/performance/outter_results_my_model/${selectedModel}/${selectedMetric1}`
        );
        const response = await axios.get(
          `http://localhost:5000/performance/outter_results_my_model/${selectedModel}/${selectedMetric1}`
        );
        const data = response.data;
        
        const transformedData = data.map((item) => ({
          modelName: item.dataset_name.value,
          outterFoldNum: parseFloat(item.fold_num.value),
          score: parseFloat(item.value.value),
        }));
        
        setOutterFoldData(transformedData);
        // set_Loading(false);
      } catch (error) {
        console.error(` BLABLA Error fetching data for FIX ERROR MSGs:`, error);
        return null;
      }
    };

    fetchData();
  }, [selectedModel, selectedMetric1]);

  if (loadingMain) {
    return (
      <div className="LoadingScreen alignCenter">
          <CircularProgress thickness={6}   size={60}  sx={{ color: "#A59D84"}} />
      </div>
    )
  }

  return (
    <div id="screenContainer">
      <Header filterText={filterText} setFilterText={setFilterText} />
      <div id="FilterExperimentsContainer">
        <div id="FilterExperimentsUp">

            <FormControl className="formControll">
              <InputLabel>Task Type</InputLabel>
              <Select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                input={<Input />}
                MenuProps={{ disableScrollLock: true }}
              >
                <MenuItem value="regression">Regression</MenuItem>
                <MenuItem value="multiClassClassification">
                  Multi-Class Classification
                </MenuItem>
                <MenuItem value="binaryClassification">
                  Binary Classification
                </MenuItem>
              </Select>
            </FormControl>

          <button
            className="ExperimentFilterButtons"
            onClick={handleOpenDialog}
          >
            <FilterList /> Metric Filter
          </button>

          {metricRange && (
            <MetricDialog
              open={openDialog}
              onClose={handleCloseDialog}
              metricRange={metricRange}
              onAddFilter={handleAddFilter}
            />
          )}
        </div>
        {filters.length > 0 && (
          <>
            <div className="brakeLine"></div>
            <div id="FilterExperimentsDown">
              {filters.map((filter, index) => (
                <div
                  key={index}
                  className="ExperimentalRangeMetricFilterContanier"
                >
                  <p className="ExperimentalRangeMetricFilterP">{`${filter.metricName}: [${filter.from}, ${filter.to}]`}</p>
                  <button
                    className="ExperimentalRangeMetricFilterButton"
                    onClick={() => handleRemoveFilter(index)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div id="ExperimentMainContainer">
        <div id="expTableContainer">
          {loadingTable ? ( 
            <DummyTableComponent title={`All experiments with their performances`}innerOutter={false}/>
          ): ( data1 && (
            <TableContainer data={data1} title={`All experiments with their performances`} innerOutter={false} />
          ))}
        </div> 

        <div id="allExpCompContainer">
          {metrics && metrics.length > 0 && (
            <>
              <div className="brakeLine"></div>
              <h3 id="perModelPerformanceTitle">
                Inner fold performance comparicon across all experiments
              </h3>
              <NestedSelectExpDataset
                metrics={metrics}
                selectedMetric2={selectedMetric2}
                setSelectedMetric2={setSelectedMetric2}
                chosenCombinations={chosenCombinations}
                setChosenCombinations={setChosenCombinations}
              />
            </>
          )}
          {chosenCombinationsData &&
            transformDataForPlot(chosenCombinationsData).length > 0 &&
            radarPlotData &&
            Object.keys(radarPlotData).length > 0 && (
              <div id="EXPviolinRadarPlotsContainer">
                <div id="leftViolinRadarPlotsContainer">
                  <MyViolinPlot
                    data={transformDataForPlot(chosenCombinationsData) || []}
                    title="Violin Plot of Test Performance Across Inner Folds"
                  />
                </div>

                <div id="rightViolinRadarPlotsContainer">
                  <MyRadarPlot
                    data={radarPlotData}
                    title="All metrics model comparison"
                  />
                </div>
              </div>
            )}
        </div>
        <div className="brakeLine"></div>
        <div id="experiment_outter_performance_container">
          <h3 id="perModelPerformanceTitle">Outter fold</h3>

          {models && models.length > 0 && (
            <select
              id="modelselectViolinAndRadar"
              value={selectedModel}
              onChange={handleModelChange}
              className="selectUnderlineStyle ExperimentTitleSelect"
            >
              {models.map((metric) => (
                <option key={metric} value={metric}>
                  {" "}
                  {metric}{" "}
                </option>
              ))}
            </select>
          )}

          <h3 id="perModelPerformanceTitle">
            Performance on different datasets
          </h3>
        </div>
        <div id="ViolinTableContainer">
          {outterFoldData && metrics && (
            <ViolinTableContainer
              data={outterFoldData}
              metrics={metrics}
              selectedMetric1={selectedMetric1}
              handleMetricChange1={handleMetricChange1}
            />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ExperimentList;
