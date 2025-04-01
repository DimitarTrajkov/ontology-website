import React from 'react';
import Plot from 'react-plotly.js';
import PropTypes from 'prop-types';

const MyPieChart = ({ values, labels, title = 'Pie Chart' }) => {
  return (
    <div style={{ width: '50%', height: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Plot
        data={[
          {
            values: values,
            labels: labels,
            type: 'pie',
            hole: 0.4, // Change this value for a donut chart effect
            textinfo: 'label+percent',
            hoverinfo: 'label+percent+value',
            marker: {
              colors: ['#1f77b4', '#ff7f0e', '#2ca02c'], // Customize colors
            },
          },
        ]}
        layout={{
          title: {
            text: title,
            font: {
              size: 24,
              color: 'black',
            },
          },
          height: 400,
          width: 500,
          paper_bgcolor: 'transparent',
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

MyPieChart.propTypes = {
  values: PropTypes.arrayOf(PropTypes.number).isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.string,
};

export default MyPieChart;
