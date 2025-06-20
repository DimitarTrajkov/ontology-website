import Plot from 'react-plotly.js';

const BoxLikePlot = ({ mean, min, max, std }) => {
    // Calculate the boundaries for the +/- 1 standard deviation box
    const stdLower = mean - std;
    const stdUpper = mean + std;

    const data = [
        {
            // This trace will represent the min and max as a line
            x: [0, 0], // A single x-coordinate for a vertical line
            y: [min, max],
            mode: 'lines',
            line: {
                color: 'black',
                width: 2,
            },
            name: 'Min/Max'
        },
        {
        type: 'scatter',
        mode: 'lines',
        x: [-0.1, 0.1], // horizontal span
        y: [min, min],
        line: {
        color: 'black',
        width: 2,
        },
        showlegend: false,
        name: 'Min Line'
        },
        {
        type: 'scatter',
        mode: 'lines',
        x: [-0.1, 0.1], // horizontal span
        y: [max, max],
        line: {
        color: 'black',
        width: 2,
        },
        showlegend: false,
        name: 'Max Line'
        },
        {
            // This trace will represent the mean as a dot
            x: [0],
            y: [mean],
            mode: 'markers',
            marker: {
                color: 'red',
                size: 10,
                symbol: 'circle'
            },
            name: 'Mean'
        },
        {
            // This trace will create the colored box for +/- 1 standard deviation
            // We'll use a 'box' type but customize its appearance to look like a colored rectangle
            type: 'box',
            y: [stdLower, stdUpper], // These points define the top and bottom of the box
            x: [0.0, 0.0], // Adjust x to control box width and position
            boxpoints: false, // Don't show individual data points
            hoverinfo: 'none', // Don't show hover info for this box
            fillcolor: 'rgba(0, 128, 0, 0.3)', // Green with some transparency
            line: {
                width: 0 // No border line for the box
            },
            name: 'Std Dev (±1)'
        }
    ];

    const layout = {
        title: 'Custom Box-Like Plot',
        yaxis: {
            title: 'Value',
            zeroline: false // Optional: remove the zero line on y-axis
        },
        xaxis: {
            showgrid: false, // Hide x-axis grid lines
            zeroline: false, // Hide x-axis zero line
            showticklabels: false, // Hide x-axis tick labels
            fixedrange: true // Prevent zooming/panning on x-axis
        },
        showlegend: true,
        margin: {
            l: 50,
            r: 50,
            b: 50,
            t: 50,
            pad: 4
        }
    };

    return (
        <Plot
            data={data}
            layout={layout}
        />
    );
};

export default BoxLikePlot;