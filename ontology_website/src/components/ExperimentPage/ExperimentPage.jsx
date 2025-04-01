import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Header';
import './ExperimentPage.css';
import NavigationBar from '../NavigationComponent/NavigationBar';
import Footer from '../Footer/Footer';

const ExperimentPage = () => {
  const { experimentEncoded } = useParams();
  const [experiment, setExperiment] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(experimentEncoded)
    const decodedItem = JSON.parse(experimentEncoded);
    console.log(decodedItem)
    setExperiment(decodedItem)

    const fetchData = async () => {
        const jsonData = {
        name: decodedItem.modelName,
        publisher: "Scribner",
        publisher_url: "https://en.wikipedia.org/wiki/Charles_Scribner%27s_Sons",
        date: "1925",
        type: "Regression",
        description: "The Great Gatsby is a novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, near New York City, the novel depicts first-person narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan.",
        url: "https://en.wikipedia.org/wiki/The_Great_Gatsby",
        licence: "Public Domain",
        trainedModels: ["Linear Regression", "Logistic Regression", "Random Forest", "Gradient Boosting", "Support Vector Machines", "Neural Networks", "K-Nearest Neighbors"],
        }
        setData(jsonData);
        setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading dataset...</div>;
  }

  if (!data) {
    return <div>Dataset not found.</div>;
  }

  return (
    <div className="mainContainer">
    <Header />
      <h1 className='TitleTextExpiriment FirstItem'> <u> Experiment</u>: {experiment.datasetName}</h1>
      <h1 className='TitleTextExpiriment'>{experiment.modelName}</h1>
      <div className="HyperParamExpirimentTitleContainer">
        <p className="HyperParamTitleTextExpiriment">
          {experiment.params
            .map((comb) => `${comb.paramName}: ${comb.paramValue}`)
            .join(", ")}
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default ExperimentPage;