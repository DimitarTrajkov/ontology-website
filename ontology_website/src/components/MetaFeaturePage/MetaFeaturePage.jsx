import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Plot from 'react-plotly.js';
import Header from '../Header'; // Assuming you have these components
import NavigationBar from '../NavigationComponent/NavigationBar';
import Footer from '../Footer/Footer';
import './MetaFeaturePage.css'; // We'll add some CSS for styling
import BoxLikePlot from './BoxLikePlot';

const MetaFeaturePage = () => {
    const { datasetName } = useParams();
    // For demonstration, using the data you provided.
    // In a real app, you would fetch this data.
    const [rawMeta, setRawMeta] = useState(null);
    const [processedMeta, setProcessedMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper function to transform the flat array into a key-value object
    const transformData = (dataArray) => {
        if (!dataArray) return null;
        return dataArray.reduce((obj, item) => {
            const value = isNaN(Number(item.value)) ? item.value : Number(item.value);
            obj[item.metafeature] = value;
            return obj;
        }, {});
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Using the provided JSON directly for this example.
                // Replace this with your actual fetch logic.
                      const [rawResponse, processedResponse] = await Promise.all([
                    fetch(`http://localhost:5000/meta_features/raw/${datasetName}`),
                    fetch(`http://localhost:5000/meta_features/pre_processed/${datasetName}`)
                ]);
                const rawData = await rawResponse.json();
                const processedData = await processedResponse.json();

                setRawMeta(transformData(rawData));
                setProcessedMeta(transformData(processedData));

            } catch (err) {
                setError(`Failed to load data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [datasetName]);

    // Render helpers
    const toInt = (val) => val?.toLocaleString() ?? 'N/A';
    const toPercent = (val) => val !== undefined ? `${(val * 100).toFixed(2)}%` : 'N/A';
    const toFixed = (val, places = 4) => val !== undefined ? val.toFixed(places) : 'N/A';

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;

    const chartLayout = { height: 350, margin: { t: 40, b: 40, l: 40, r: 40 }, legend: { x: 1, xanchor: 'right', y: 1 }};
    const plotConfig = { displayModeBar: false };
    
    return (
        <div className="mainContainer">
            <Header />
            <h1 className='TitleText'>Metafeatures for: {datasetName}</h1>
            <NavigationBar datasetName={datasetName} />

            <div className='meta-grid'>
                {/* 1. General Overview Table */}
                <div className="meta-card">
                    <h4>General Overview</h4>
                    <table>
                        <thead><tr><th>Metric</th><th>Raw</th><th>Pre-processed</th></tr></thead>
                        <tbody>
                            <tr><td>Instances</td><td>{toInt(rawMeta.instances)}</td><td>{toInt(processedMeta.instances)}</td></tr>
                            <tr><td>Features</td><td>{toInt(rawMeta.features)}</td><td>{toInt(processedMeta.features)}</td></tr>
                            <tr><td>Number of Classes</td><td>{toInt(rawMeta['number of classes'])}</td><td>{toInt(processedMeta['number of classes'])}</td></tr>
                            <tr><td>Duplicate Features</td><td>{toPercent(rawMeta['proportion duplicate features'])}</td><td>{toPercent(processedMeta['proportion duplicate features'])}</td></tr>
                            <tr><td>Duplicate Rows</td><td>{toPercent(rawMeta['proportion duplicate rows'])}</td><td>{toPercent(processedMeta['proportion duplicate rows'])}</td></tr>
                        </tbody>
                    </table>
                </div>

                {/* 2. Raw Feature Types */}
                <div className="meta-card">
                    <h4>Raw Feature Types</h4>
                    <Plot
                        data={[{
                            type: "sunburst",
                            labels: ["Numeric", "Binary", "Nominal"],
                            parents: ["", "Numeric", ""],
                            values:  [
                                rawMeta['number numeric features'] - rawMeta['number binary features'],
                                rawMeta['number binary features'],
                                rawMeta['number nominal features']
                            ],
                            outsidetextfont: {size: 20, color: "#377eb8"},
                            leaf: {opacity: 0.6},
                            marker: {line: {width: 2}},
                        }]}
                        layout={{...chartLayout, title: 'Raw Feature Distribution'}}
                        config={plotConfig}
                    />
                    <p className="chart-subtitle">Constant Features: {rawMeta['number constant features']}</p>
                </div>
                
                {/* 3. Pre-processed Feature Types */}
                <div className="meta-card">
                    <h4>Pre-processed Feature Types</h4>
                     <Plot
                        data={[{
                            type: "sunburst",
                            labels: ["Numeric", "Binary"],
                            parents: ["", "Numeric"],
                            values:  [
                                processedMeta['number numeric features'] - processedMeta['number binary features'],
                                processedMeta['number binary features']
                            ],
                            outsidetextfont: {size: 20, color: "#377eb8"},
                            leaf: {opacity: 0.6},
                            marker: {line: {width: 2}},
                        }]}
                        layout={{...chartLayout, title: 'Processed Feature Distribution'}}
                        config={plotConfig}
                    />
                </div>
                
                {/* 4. Raw Class Frequency */}
                <div className="meta-card">
                    <h4>Raw Class Frequency</h4>
                     <Plot 
                        data={[{
                            x: ['Min Freq', 'Max Freq', 'Std Dev Freq'],
                            y: [rawMeta['min class frequency'], rawMeta['max class frequency'], rawMeta['std class frequency']],
                            type: 'bar'
                        }]}
                        layout={{...chartLayout, title: 'Raw Class Frequencies', yaxis: {tickformat: '.2f'}}}
                        config={plotConfig}
                    />
                </div>

                {/* 5. Pre-processed Class Frequency */}
                <div className="meta-card">
                    <h4>Pre-processed Class Frequency</h4>
                    <Plot 
                        data={[{
                            x: ['Min Freq', 'Max Freq', 'Std Dev Freq'],
                            y: [processedMeta['min class frequency'], processedMeta['max class frequency'], processedMeta['std class frequency']],
                            type: 'bar',
                            marker: {color: '#ff7f0e'}
                        }]}
                        layout={{...chartLayout, title: 'Processed Class Frequencies', yaxis: {tickformat: '.2f'}}}
                        config={plotConfig}
                    />
                </div>

                {/* 6. Numeric Feature Statistics */}
                <div className="meta-card">
                    <h4>Numeric Feature Statistics</h4>
                    <table>
                        <thead><tr><th>Metric</th><th>Raw</th><th>Pre-processed</th></tr></thead>
                        <tbody>
                            <tr><td>Mean Feature Range</td><td>{toFixed(rawMeta['mean feature range'], 2)}</td><td>{toFixed(processedMeta['mean feature range'], 2)}</td></tr>
                            <tr><td>Mean of Means</td><td>{toFixed(rawMeta['mean of mean numeric features'], 2)}</td><td>{toFixed(processedMeta['mean of mean numeric features'], 2)}</td></tr>
                            <tr><td>Mean of Medians</td><td>{toFixed(rawMeta['mean of median numeric features'], 2)}</td><td>{toFixed(processedMeta['mean of median numeric features'], 2)}</td></tr>
                            <tr><td>Mean of Std Devs</td><td>{toFixed(rawMeta['mean of std numeric features'], 2)}</td><td>{toFixed(processedMeta['mean of std numeric features'], 2)}</td></tr>
                            <tr><td>Mean of Variances</td><td>{toFixed(rawMeta['mean of var numeric features'], 2)}</td><td>{toFixed(processedMeta['mean of var numeric features'], 2)}</td></tr>
                            <tr><td>Mean of G-Means</td><td>{toFixed(rawMeta['mean of gmean numeric features'], 2)}</td><td>{toFixed(processedMeta['mean of gmean numeric features'], 2)}</td></tr>
                            <tr><td>Mean of H-Means</td><td>{toFixed(rawMeta['mean of hmean numeric features'], 2)}</td><td>{toFixed(processedMeta['mean of hmean numeric features'], 2)}</td></tr>
                            <tr><td>Mean of MADs</td><td>{toFixed(rawMeta['mean of mad numeric features'], 2)}</td><td>{toFixed(processedMeta['mean of mad numeric features'], 2)}</td></tr>
                            <tr><td>Mean of T-Means</td><td>{toFixed(rawMeta['mean of tmean numeric features'], 2)}</td><td>{toFixed(processedMeta['mean of tmean numeric features'], 2)}</td></tr>
                        </tbody>
                    </table>
                </div>

                {/* 7. PCA Variance */}
                <div className="meta-card">
                    <h4>PCA Variance Explained</h4>
                     <Plot 
                        data={[{
                            x: ['PC 1', 'PC 2', 'PC 3'],
                            y: [processedMeta['PCA var1'], processedMeta['PCA var2'], processedMeta['PCA var3']],
                            type: 'bar',
                        }]}
                        layout={{...chartLayout, title: 'Variance by Top 3 PCs', yaxis: {tickformat: '.1%'}}}
                        config={plotConfig}
                    />
                    <p className="chart-subtitle">{processedMeta['N components PCA']} components explain 95% of the variance.</p>
                </div>
                
                {/* 8. Raw Missing Data */}
                <div className="meta-card">
                    <h4>Raw Missing Data</h4>
                     <table>
                        <tbody>
                            <tr><td>Proportion Missing Data</td><td>{toPercent(rawMeta['proportion missing data'])}</td></tr>
                            <tr><td>Feats w/ Missing Values</td><td>{toPercent(rawMeta['proportion features with missing values'])}</td></tr>
                            <tr><td>Instances w/ Missing Values</td><td>{toPercent(rawMeta['proportion instances with missing values'])}</td></tr>
                            <tr><td>Missing in Target Feature</td><td>{toPercent(rawMeta['proportion missing data in target feature'])}</td></tr>
                        </tbody>
                    </table>
                </div>

                {/* 9. Kurtosis and Skewness */}
                <div className="meta-card">
                    <h4>Kurtosis & Skewness</h4>
                     <Plot
                        data={[
                            { x: ['High Kurtosis', 'High Skewness'], y: [rawMeta['proportion high kurtosis features'], rawMeta['proportion high skewness features']], name: 'Raw', type: 'bar' },
                            { x: ['High Kurtosis', 'High Skewness'], y: [processedMeta['proportion high kurtosis features'], processedMeta['proportion high skewness features']], name: 'Pre-processed', type: 'bar' }
                        ]}
                        layout={{...chartLayout, title: 'Proportion of Features', barmode: 'group', yaxis: {tickformat: '.1%'}}}
                        config={plotConfig}
                    />
                </div>

                {/* 10. Target Correlation */}
                {/* <div className="meta-card">
                    <h4>Target Correlation</h4>
                    <table><tbody>
                        <tr><td>Mean</td><td>{toFixed(processedMeta['mean target correlation'])}</td></tr>
                        <tr><td>Std Dev</td><td>{toFixed(processedMeta['std target correlation'])}</td></tr>
                        <tr><td>Min</td><td>{toFixed(processedMeta['min target correlation'])}</td></tr>
                        <tr><td>Max</td><td>{toFixed(processedMeta['max target correlation'])}</td></tr>
                    </tbody></table>
                </div> */}
                <div className="meta-card">
                  <h4>Target Correlation</h4>
                  <BoxLikePlot
                  mean={processedMeta['mean target correlation']}
                  min={processedMeta['min target correlation']}
                  max={processedMeta['max target correlation']}
                  std={processedMeta['std target correlation']}
                  />
                </div>

                {/* 11. Mutual Information */}
                {/* <div className="meta-card">
                    <h4>11. Mutual Information</h4>
                    <table><tbody>
                        <tr><td>Mean</td><td>{toFixed(processedMeta['mean mutual information'])}</td></tr>
                        <tr><td>Std Dev</td><td>{toFixed(processedMeta['std mutual information'])}</td></tr>
                        <tr><td>Min</td><td>{toFixed(processedMeta['min mutual information'])}</td></tr>
                        <tr><td>Max</td><td>{toFixed(processedMeta['max mutual information'])}</td></tr>
                    </tbody></table>
                </div> */}
                <div className="meta-card">
                  <h4>Mutual Information</h4>
                  <BoxLikePlot
                  mean={processedMeta['mean mutual information']}
                  min={processedMeta['min mutual information']}
                  max={processedMeta['max mutual information']}
                  std={processedMeta['std mutual information']}
                  />
                </div>

                {/* 12. Joint Entropy */}
                {/* <div className="meta-card">
                    <h4>12. Joint Entropy</h4>
                     <table><tbody>
                        <tr><td>Mean</td><td>{toFixed(processedMeta['mean joint entropy'])}</td></tr>
                        <tr><td>Std Dev</td><td>{toFixed(processedMeta['std joint entropy'])}</td></tr>
                        <tr><td>Min</td><td>{toFixed(processedMeta['min joint entropy'])}</td></tr>
                        <tr><td>Max</td><td>{toFixed(processedMeta['max joint entropy'])}</td></tr>
                    </tbody></table>
                </div> */}
                <div className="meta-card">
                  <h4>Joint Entropy</h4>
                  <BoxLikePlot
                  mean={processedMeta['mean joint entropy']}
                  min={processedMeta['min joint entropy']}
                  max={processedMeta['max joint entropy']}
                  std={processedMeta['std joint entropy']}
                  />
                </div>

                {/* 13. Feature Entropy */}
                {/* <div className="meta-card">
                    <h4>13. Feature Entropy</h4>
                     <table><tbody>
                        <tr><td>Mean</td><td>{toFixed(processedMeta['mean feature entropy'])}</td></tr>
                        <tr><td>Std Dev</td><td>{toFixed(processedMeta['std feature entropy'])}</td></tr>
                        <tr><td>Min</td><td>{toFixed(processedMeta['min feature entropy'])}</td></tr>
                        <tr><td>Max</td><td>{toFixed(processedMeta['max feature entropy'])}</td></tr>
                    </tbody></table>
                </div> */}

                <div className="meta-card">
                  <h4>Feature Entropy</h4>
                  <BoxLikePlot
                  mean={processedMeta['mean feature entropy']}
                  min={processedMeta['min feature entropy']}
                  max={processedMeta['max feature entropy']}
                  std={processedMeta['std feature entropy']}
                  />
                </div>

                {/* 14. Decision Tree Metrics */}
                <div className="meta-card">
                    <h4>Decision Tree Metrics</h4>
                     <table><tbody>
                        <tr><td>Tree Depth</td><td>{toInt(processedMeta['tree depth'])}</td></tr>
                        <tr><td>Number of Leaves</td><td>{toInt(processedMeta['number of leaves'])}</td></tr>
                        <tr><td>Leaves to Instances Ratio</td><td>{toFixed(processedMeta['ratio leaves to instances'])}</td></tr>
                    </tbody></table>
                </div>
                
                {/* 15. Landmarker Accuracies */}
                <div className="meta-card">
                    <h4>Landmarker Accuracies</h4>
                    <Plot
                        data={[{
                            x: ['1-NN', 'Decision Tree', 'Lin. Separable', 'Naive Bayes'],
                            y: [
                                processedMeta['1NN accuracy'], 
                                processedMeta['DecisionTree accuracy'],
                                processedMeta['linear separability'],
                                processedMeta['NaiveBayes accuracy']
                            ],
                            type: 'bar'
                        }]}
                        layout={{...chartLayout, title: 'Simple Model Performance', yaxis: {tickformat: '.1%'}}}
                        config={plotConfig}
                    />
                </div>
                
                {/* 16. Outliers & Distribution */}
                <div className="meta-card">
                    <h4>Outliers & Distribution</h4>
                     <table><tbody>
                        <tr><td>Features with Outliers</td><td>{toPercent(processedMeta['proportion features with outliers'])}</td></tr>
                        <tr><td>Normally Distributed Feats</td><td>{toPercent(processedMeta['proportion features with normal distribution'])}</td></tr>
                    </tbody></table>
                </div>

            </div>
            <Footer />
        </div>
    );
};

export default MetaFeaturePage;