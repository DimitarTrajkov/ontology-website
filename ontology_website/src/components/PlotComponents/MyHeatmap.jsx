import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import PropTypes from 'prop-types';

const MyHeatmap = ({ data, x, y, title = 'HeatMap', xAxisTitle = 'Metrics', yAxisTitle = 'Fold Number' }) => {
  const [plotData, setPlotData] = useState([]);
  const [layout, setLayout] = useState({});
  const plotRef = useRef(null);

  useEffect(() => {
    if (!data || !x || !y) {
      console.error("data, x, and y props are required.");
      return;
    }

    if (!Array.isArray(data) || !Array.isArray(x) || !Array.isArray(y)) {
      console.error("data, x, and y props must be arrays.");
      return;
    }

    if (data.length === 0 || x.length === 0 || y.length === 0) {
      console.error("data, x, and y arrays must not be empty.");
      return;
    }

    // Basic validation to ensure dimensions are compatible
    if (data.length !== y.length || data[0].length !== x.length) {
      console.error("Dimensions of data, x, and y are incompatible.");
      return;
    }

    const heatmapData = [{
      z: data,
      x: x,
      y: y,
      type: 'heatmap',
      hoverongaps: false,
      colorscale: 'RdBu', //'RdBu', 'Viridis', 'Cividis', 'Magma', 'Inferno', 'Plasma', 'Greys', 'Cool', 'Jet'
      colorbar: {
        title: 'Heatmap Value',
      },
      xgap: 1,
      ygap: 1,
    }];

    const heatmapLayout = {
      title: {
        text: title,
        font: {
          color: 'black',
          size: 24,
          family: 'Arial',
          weight: 'bold'
        },
      },
      xaxis: {
        tickfont: {
          color: 'black',
          size: 14,
          family: 'Arial'
        },
        title: {
          text: xAxisTitle,
          font: {
            color: 'black'
          }
        }
      },
      yaxis: {
        tickfont: {
          color: 'black'
        },
        title: {
          text: yAxisTitle,
          font: {
            color: 'black'
          }
        }
      },
      plot_bgcolor: '#D7D3BF',
      paper_bgcolor: 'transparent',
    };

    setPlotData(heatmapData);
    setLayout(heatmapLayout);

  }, [data, x, y, title, xAxisTitle, yAxisTitle]);

  return (
    <div className='ChartsMainContainer alingCenter' style={{ width: '50%', height: '60vh'}}>
      {plotData.length > 0 && layout && ( 
        <Plot data={plotData} layout={layout} ref={plotRef} style={{ width: '100%', height: '100%' }} />
      )}
    </div>
  );
};

MyHeatmap.propTypes = {
  data: PropTypes.arrayOf(PropTypes.array).isRequired,
  x: PropTypes.array.isRequired,
  y: PropTypes.array.isRequired,
  title: PropTypes.string,
  xAxisTitle: PropTypes.string,
  yAxisTitle: PropTypes.string,
};

export default MyHeatmap;