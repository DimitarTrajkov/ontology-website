import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../Header";
import "../MetaFeaturePage/MetaFeaturePage.css";
import "./PerformancePage.css";
import MyViolinPlot from "../PlotComponents/MyViolinPlot";
import NavigationBar from "../NavigationComponent/NavigationBar";
import axios from "axios";
import NestedMultiSelect from "../NestedSelect/NestedMultiLevelSelect";
import MyRadarPlot from "../PlotComponents/MyRadarPlot";
import TableContainer from "../TableComponent/TableComponent";
import { Switch } from "@mui/material";
import ViolinTableContainer from "../ExperimentList/ViolinTableContainer";

const PerformancePage = () => {
  const { datasetName } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [dataAverage, setdataAverage] = useState([]);
  const [chosenCombinations, setChosenCombinations] = useState([]);
  const [chosenCombinationsData, setChosenCombinationsData] = useState({});
  const [radarPlotData, setRadarPlotData] = useState({});
  const [metrics, SetMetrics] = useState([]);
  const [tableData, SetTableData] = useState();
  const [outterTrueCheck, setOutterTrueCheck] = useState(false); // State to track the switch status

  const [selectedMetric1, setSelectedMetric1] = useState("");
  const handleMetricChange1 = (event) => {
    setSelectedMetric1(event.target.value);
  };

  const [selectedMetric2, setSelectedMetric2] = useState([]);
  // const handleMetricChange2 = (event) => {
  //   setSelectedMetric2(event.target.value);
  // };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/performance/metrics/${datasetName}`
        );
        const data = response.data;
        setLoading(false);

        const transformedData = data.map((item) => item.metrics.value);
        console.log("metrics", transformedData);
        SetMetrics(transformedData);
        setSelectedMetric1(transformedData[0]);
        setSelectedMetric2(transformedData[0]);
      } catch (error) {
        console.error(`Error fetching metrics data for ${datasetName}:`, error);
        return null;
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const outterORinner = outterTrueCheck ? "outter_data" : "inner_data";
        const response = await axios.get(
          `http://localhost:5000/table/${outterORinner}/${datasetName}`
        );
        const data = response.data;
        setLoading(false);

        const transformedData = data.map((item) => {
          const { model, hypercomb, outter_fold, metrics_values, inner_fold } =
            item;

          // Split the metrics_values string into individual metric-value pairs
          const metricsArray = metrics_values.value
            .split(", ")
            .map((metric) => {
              // Split each pair into metric name and value
              const [metricName, value] = metric.split(": ");
              return { [metricName]: parseFloat(value) }; // Convert value to float
            })
            .reduce((acc, curr) => ({ ...acc, ...curr }), {}); // Merge the metric objects into one

          // Combine the original values with the transformed metrics
          // If inner_fold exists, include it, otherwise omit it
          return {
            id: outterTrueCheck
              ?`${model.value}-${hypercomb.value}-${outter_fold.value}`
              : `${model.value}-${hypercomb.value}-${inner_fold.value}-${outter_fold.value}`,
            model: model.value,
            hypercomb: hypercomb.value,
            outter_fold: outter_fold.value,
            ...(inner_fold ? { inner_fold: inner_fold.value } : {}),
            ...metricsArray, // Spread the metrics as individual fields
          };
        });
        console.log("table data", transformedData);
        SetTableData(transformedData);
      } catch (error) {
        console.error(`Error fetching metrics data for ${datasetName}:`, error);
        return null;
      }
    };

    fetchData();
  }, [outterTrueCheck]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!selectedMetric1) {
          return;
        }
        const response = await axios.get(
          `http://localhost:5000/performance/${datasetName}/${selectedMetric1}`
        );
        const data = response.data;
        setLoading(false);

        const transformedData = data.map((item) => ({
          modelName: item.model_name.value,
          outterFoldNum: parseFloat(item.fold_num.value),
          score: parseFloat(item.value.value),
        }));
        setData(transformedData);

        const modelScores = transformedData.reduce(
          (acc, { modelName, score }) => {
            if (!acc[modelName]) {
              acc[modelName] = { totalScore: 0, count: 0 };
            }
            if (!isNaN(score)) {
              // Ensure score is a valid number
              acc[modelName].totalScore += score;
              acc[modelName].count += 1;
            }
            return acc;
          },
          {}
        );

        // Check the accumulated scores before calculating averages
        // console.log(modelScores);

        // Calculate average and sort by descending average score
        const dataAverage = Object.keys(modelScores)
          .map((modelName) => ({
            modelName,
            averageScore: (
              modelScores[modelName].totalScore / modelScores[modelName].count
            ).toFixed(2), // Ensuring 2 decimal places
          }))
          .sort((a, b) => b.averageScore - a.averageScore);

        setdataAverage(dataAverage);
        console.log("radar data", transformedData);
      } catch (error) {
        console.error(` BLABLA Error fetching data for ${datasetName}:`, error);
        return null;
      }
    };

    fetchData();
  }, [datasetName, selectedMetric1]);

  useEffect(() => {
    // Function to format combination string
    const formatCombinationString = (combination) => {
      const paramString = combination.params
        .map((param) => `${param.key}=${param.value}`)
        .join("_")
        .replace(/\[/g, "\\\\[")
        .replace(/]/g, "\\\\]");
      return encodeURIComponent(
        `${combination.datasetName}_${combination.modelName}_${paramString}`
      );
    };

    const formatForStoring = (combination) => {
      const paramString = combination.params
        .map((param) => `${param.key}=${param.value}`)
        .join("_")
        .replace(/\[/g, "\\\\[")
        .replace(/]/g, "\\\\]");
      return encodeURIComponent(
        `${combination.metric}_${combination.modelName}_${paramString}`
      );
    };

    // Make a copy of the current chosenCombinationsData
    const newCombinationsData = { ...chosenCombinationsData };
    const newRadarPlotData = { ...radarPlotData };
    // console.log("newCombinationsData", newCombinationsData)
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
          const response = await axios.get(
            `http://localhost:5000/performance/inner_hyperparam/avg_all_metrics/${combinationString}`
          );
          const data = response.data;

          // Store fetched data in newCombinationsData
          newRadarPlotData[combinationString] = data.map((item) => ({
            value: item.average_value.value,
            label: item.metric.value,
          }));
          console.log("newRadarPlotData", newRadarPlotData);

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
    console.log("data for radar: ", transformedRadarData(updatedRadarData));

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
    console.log("picked combo", updatedCombinationsData);
    setChosenCombinationsData(updatedCombinationsData);
  }, [chosenCombinations]);

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
  // if (loading) {
  //   return <div>Loading dataset...</div>;
  // }

  // if (!data) {
  //   return <div>Dataset not found.</div>; // Handle cases where data is null
  // }

  const transformedRadarData = (data) => {
    return Object.entries(data).map(([key, value]) => ({
      modelName: key,
      ...value,
    }));
  };

  return (
    <div className="mainContainer">
      <Header />
      <h1 className="TitleText">Dataset: {datasetName}</h1>
      <NavigationBar datasetName={datasetName} />
      <div id="PerformanceContainer" className="basicContainer">
      <ViolinTableContainer data={data} metrics={metrics} selectedMetric1={selectedMetric1} handleMetricChange1={handleMetricChange1}/>

        <div id="modelPerformanceContainer">
          <div className="brakeLine"></div>
          <h3 id="perModelPerformanceTitle">
            Comparison on inner fold performance on hyperparameter combination
            on different dataset
          </h3>

          <div id="perModelPerformance">
            <div id="rightSidePerModelPerformance">
              <NestedMultiSelect
                metrics={metrics}
                setSelectedMetric2={setSelectedMetric2}
                selectedMetric2={selectedMetric2}
                datasetName={datasetName}
                chosenCombinations={chosenCombinations}
                setChosenCombinations={setChosenCombinations}
              />
            </div>
          </div>
        </div>

        {chosenCombinationsData &&
          transformDataForPlot(chosenCombinationsData).length > 0 &&
          radarPlotData &&
          Object.keys(radarPlotData).length > 0 && (
            <div id="violinRadarPlotsContainer">
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

        <div id="HyperInfluenceHeatMapContainer">
          <div className="brakeLine"></div>
          {tableData && (
            <div id="tableContainerMUI">
              <TableContainer
                data={tableData}
                outterTrueCheck={outterTrueCheck}
                setOutterTrueCheck={setOutterTrueCheck}
                title={`Performance of the dataset on ${
                  outterTrueCheck ? "outter" : "inner"
                } folds`}
                innerOutter={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;
