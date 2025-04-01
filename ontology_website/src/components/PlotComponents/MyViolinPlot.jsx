import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import PropTypes from 'prop-types';

const MyViolinPlot = ({ data, title = "Violin Plot for all models" }) => {
  const [plotlyData, setPlotlyData] = useState([]);
  const [layout, setLayout] = useState({});
  const plotRef = useRef(null);

  useEffect(() => {
    // console.log("violin",data);
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error("The 'data' prop is required and must be a non-empty array.");
      return;
    }

    const modelNames = [...new Set(data.map(item => item.modelName))];

    const plotlyData = modelNames.map(modelName => {
      const scores = data.filter(item => item.modelName === modelName).map(item => parseFloat(item.score));

      // Check if scores are valid numbers
      const validScores = scores.filter(score => !isNaN(score));
      if (validScores.length !== scores.length) {
        console.warn(`Some scores for model ${modelName} are not valid numbers. These will be ignored.`);
      }
      // console.log("data in the violin plot", data)
      const pointLabels = data.map(item => 
        `Outer fold: ${item.outterFoldNum}` + 
        (item.innerFoldNum ? `<br>Inner fold: ${item.innerFoldNum}` : "")
      );
      
      return {
        type: 'violin',
        x: Array(validScores.length).fill(modelName),
        y: validScores,
        text: pointLabels,  
        hoverinfo: 'text',
        name: modelName,
        box: { visible: true },
        meanline: { visible: true },
        points: 'all',
        jitter: 0.05,
        scalemode: 'count',
      };
    });

    const plotlyLayout = {
      title: {
        text: title,
        font: {
          family: 'Arial, sans-serif',
          size: 30,
          color: 'black',
          weight: 'bold'
        },
      },
      yaxis: { zeroline: false },
      violinmode: 'group',
      plot_bgcolor: '#D7D3BF',
      paper_bgcolor: 'transparent',
      legend: {
        x: 1,
        y: 1,
        traceorder: "normal",
        font: {
          size: 10, // Reduce font size to fit more text
        },
        orientation: "v",
        itemwidth: 80, // Increase width to allow wrapping
      }      
    };
    

    setPlotlyData(plotlyData);
    setLayout(plotlyLayout);

  }, [data, title]); // Add data and title to dependency array

  return (
    <div className='ChartsMainContainer alingCenter' style={{ width: '100%', height: '100%'}}>
      {plotlyData.length > 0 && layout && (
        <Plot data={plotlyData} layout={layout} ref={plotRef} style={{ width: '100%', height: '100%' }} />
      )}
    </div>
  );
};

MyViolinPlot.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    modelName: PropTypes.string.isRequired,
    outterFoldNum: PropTypes.string.isRequired, // Score should be a string
    innerFoldNum: PropTypes.string, // Score should be a string
    score: PropTypes.string.isRequired, // Score should be a string
  })).isRequired,
  title: PropTypes.string,
};

export default MyViolinPlot;