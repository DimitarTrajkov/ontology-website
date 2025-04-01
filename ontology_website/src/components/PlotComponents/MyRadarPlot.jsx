import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import PropTypes from 'prop-types';

const MyRadarPlot = ({ data, title = "Radar Chart for Model Comparison" }) => {
  const [plotlyData, setPlotlyData] = useState([]);
  const [layout, setLayout] = useState({});
  // const [minVal,setMinVal] = useState()
  // const [maxVal,setMaxVal] = useState()
  const plotRef = useRef(null);

  useEffect(() => {
    console.log('DO VIOLIN PLOTO STIGA: ',data)
    var minVal = undefined;
    var maxVal = undefined;
    const plotlyData = Object.entries(data).map(([key, value]) => {
      // SREDI GO TAJ RED!!!!!!!!!!
      const groupName = decodeURIComponent(key).replace(/_/, " ").replace(/_/, "<br>").replace(/_/, "<br>").replace(/\\/g, "");

      // Extract the scores (or other properties as needed)
      const values = value.map(item => item.value);
      const labels = value.map(item => item.label.replace(/ /, "<br>")); // You can extract metrics or other properties here
      console.log(labels)
      const currMinVal = Math.min(...values);
      const newMinVal = minVal !== undefined ? Math.min(minVal, currMinVal) : currMinVal;
      const currMaxVal = Math.max(...values);
      const newMaxVal = maxVal !== undefined ? Math.max(maxVal, currMaxVal) : currMaxVal;
      minVal = newMinVal;
      maxVal = newMaxVal;

      console.log(newMinVal);
      console.log(newMaxVal);
      return {
        type: 'scatterpolar',
        r: values.concat(values[0]),
        theta: labels.concat(labels[0]),
        fill: 'tonext',
        name: groupName,
        line: {
          width: 2,
        },
      };
    });

    

    const plotlyLayout = {
      polar: {
        radialaxis: {
          visible: true,
          range: [minVal,maxVal],
          angle: 0, // starting angle
        },
        bgcolor: '#ECEBDE',
      },
      title: {
        text: title,
        font: {
          family: 'Arial, sans-serif',
          size: 24,
          color: 'black',
          weight: 'bold'
        },
      },
      plot_bgcolor: '#D7D3BF',
      paper_bgcolor: 'transparent',
       legend: {
        x: 0.5,  // Center the legend horizontally (50% of the width)
        y: -0.2, // Place the legend below the plot (negative value moves it down)
        xanchor: 'center',  // Anchor the legend at the center horizontally
        yanchor: 'top',  // Anchor the legend at the top vertically (so it starts from y)
        orientation: 'h',  // Display the legend items horizontally
        font: {
          size: 10,  // Font size of the legend items
        },
        height: "10vh",  // Limit the legend width to 20% of the plot width
      }         
    };

    setPlotlyData(plotlyData);
    setLayout(plotlyLayout);


  }, [data]);

  return (
    <div className='ChartsMainContainer alingCenter' style={{ width: '100%', height: '100%'}}>
      {plotlyData.length > 0 && layout && (
        <Plot data={plotlyData} layout={layout} ref={plotRef} style={{ width: '100%', height: '100%' }} 
        />
      )}
    </div>
  );
};

MyRadarPlot.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    modelName: PropTypes.string.isRequired,
    // ... other metric props (you might want to be more specific here)
  })).isRequired,
  metrics: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.string,
};

export default MyRadarPlot;
