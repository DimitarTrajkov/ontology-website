import React, { useState, useEffect } from "react";
import "./ExperimentList.css";
import MyViolinPlot from "../PlotComponents/MyViolinPlot";
import { use } from "react";

const ViolinTableContainer = ({data, metrics, selectedMetric1, handleMetricChange1}) => {
  const [dataAverage, setdataAverage] = useState([]);
  
  useEffect(() => {
    const modelScores = data.reduce(
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

    const dataAverage = Object.keys(modelScores)
    .map((modelName) => ({
      modelName,
      averageScore: (
        modelScores[modelName].totalScore / modelScores[modelName].count
      ).toFixed(2), // Ensuring 2 decimal places
    }))
    .sort((a, b) => b.averageScore - a.averageScore);

  setdataAverage(dataAverage); 

  }, [data]);

return (
        <div id="basicPerformanceContainer">
          <div id="leftSideBasicPerformanceContainer">
            {data.length > 0 && (
              <MyViolinPlot
                data={data || []}
                title="Violin Plot for all outter fold models performance"
              />
            )}
          </div>

          <div id="rightSideBasicPerformanceContainer">
            <h3 id="modelLeaderBoard">model leaderboard</h3>
            <p id="modelLeaderBoardSubtext">
              on average outter fold performance
            </p>
            <div id="metricSelectContainer">
              <p id="rankingText">ranking models by best</p>
              {metrics.length != 0 && (
                <select
                  id="metric-select"
                  value={selectedMetric1}
                  onChange={handleMetricChange1}
                  className="selectUnderlineStyle"
                >
                  {metrics.map((metric) => (
                    <option key={metric} value={metric}>
                      {metric}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div id="tableContainer">
              <ol>
                {dataAverage.map((item, index) => (
                  <li key={index}>
                    <div className="listItem">
                      <p>{item.modelName}</p> {/* Access the title property */}
                      <p className="metricText">{item.averageScore}</p>{" "}
                      {/* Access the performance property */}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
  );
};

export default ViolinTableContainer;
