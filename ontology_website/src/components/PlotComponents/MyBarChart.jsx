import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import Plot from 'react-plotly.js';


const MyBarChart = ({ data, labels, seriesNames, title, barmode = 'group' }) => {
  const [plotlyData, setPlotlyData] = useState([]);
  const [plotlyLayout, setPlotlyLayout] = useState({});
  const plotRef = useRef(null);

  useEffect(() => {
    // Check if the required props are missing
    if (!data) {
      console.error("Data prop is missing.");
      return;
    }
    if (!labels) {
      console.error("Labels prop is missing.");
      return;
    }
    if (!seriesNames) {
      console.error("seriesNames prop is missing.");
      return;
    }

    if (!Array.isArray(data)) {
      console.error("Data prop must be an array.");
      return;
    }
    if (!Array.isArray(labels)) {
      console.error("Labels prop must be an array.");
      return;
    }
    if (!Array.isArray(seriesNames)) {
      console.error("seriesNames prop must be an array.");
      return;
    }

    const numSeries = data.length;
    const numCategories = labels.length;

    if (numCategories === 0) {
      console.error("Labels must have at least one element");
      return;
    }

    if (numSeries !== seriesNames.length) {
      console.error("The data and the seriesNames must have the same length");
      return;
    }

    const allSeriesHaveCorrectLength = data.every(series => series.length === numCategories);

    if (!allSeriesHaveCorrectLength) {
      console.error("Each data series must have the same length as the labels array.");
      console.log("Data:", data);
      console.log("Labels:", labels);
      return;
    }

    const traces = data.map((yValues, index) => {
      return {
        x: labels,
        y: yValues,
        type: 'bar',
        text: yValues.map(String),
        textposition: 'auto',
        hoverinfo: 'none',
        opacity: 0.5,
        name: seriesNames[index],
        marker: {
          color: `rgba(${58 + index * 20},${200 - index * 20},225,0.5)`,
          line: {
            color: 'rgb(8,48,107)',
            width: 1.5,
          },
        },
      };
    });

    const layout = {
      title: {
        text: title,
      },
      barmode: barmode,
      plot_bgcolor: '#D7D3BF',
      paper_bgcolor: 'transparent',
    };

    setPlotlyData(traces);
    setPlotlyLayout(layout);

  }, [barmode, data, labels, seriesNames, title]);

  return (
    <div  className='ChartsMainContainer alingCenter' style={{ width: '95%', height: '60vh'}}>
      {plotlyData.length > 0 && plotlyLayout && (
        <Plot
          data={plotlyData}
          layout={plotlyLayout}
          ref={plotRef}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  );
};

MyBarChart.propTypes = { 
  data: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  seriesNames: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  barmode: PropTypes.string,
};

export default MyBarChart;