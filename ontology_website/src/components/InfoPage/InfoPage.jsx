import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Header';
import './InfoPage.css';
import NavigationBar from '../NavigationComponent/NavigationBar';
import Footer from '../Footer/Footer';

const InfoPage = () => {
  const { datasetName } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        const jsonData = {
        name: datasetName,
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
  }, [datasetName]);

  if (loading) {
    return <div>Loading dataset...</div>;
  }

  if (!data) {
    return <div>Dataset not found.</div>; // Handle cases where data is null
  }

  return (
    <div className="mainContainer">
    <Header />
      <h1 className='TitleText'>Dataset: {datasetName}</h1>
      <NavigationBar datasetName={datasetName} />
      <div id="infoContainer" className='basicContainer'>

        <div id="leftSideInfoContainer">
          <h3>About dataset:</h3>
          <p className='paragraphStyle'>{data.description}</p>

          <h3>Motels trained:</h3>
          <div>
            {data.trainedModels.map((model) => {
              return <p className='paragraphStyle'>{model}</p>
            })}
          </div>
        </div>

        <div id='middleInfoContainer'>
          <div id='breakLine'></div>
        </div>


        <div id="rightSideInfoContainer">
          <h4>Dataset type: </h4>
          <p className='paragraphStyle'>{data.type}</p>

          <h4>Published by:</h4>
          <p className='paragraphStyle'><a  className='linksAsRegular' href={data.publisher_url} >{data.publisher}</a></p>

          <h4>Published on:</h4>
          <p className='paragraphStyle'>{data.date}</p>

          <h4>Licence:</h4>
          <p className='paragraphStyle'>{data.licence}</p>

          <h4>Original source:</h4>
          <p className='paragraphStyle'><a className='linksAsRegular' href={data.url}>{data.url}</a></p>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default InfoPage;