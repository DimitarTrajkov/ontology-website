import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Header';
import './InfoPage.css';
import NavigationBar from '../NavigationComponent/NavigationBar';
import Footer from '../Footer/Footer';
import axios from 'axios';


const InfoPage = () => {
  const { datasetName } = useParams();
  const [data, setData] = useState(null);
  const [models, setModels] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchData = async () => {
  //       const jsonData = {
  //       name: datasetName,
  //       publisher: "Scribner",
  //       publisher_url: "https://en.wikipedia.org/wiki/Charles_Scribner%27s_Sons",
  //       date: "1925",
  //       type: "Regression",
  //       description: "The Great Gatsby is a novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, near New York City, the novel depicts first-person narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan.",
  //       url: "https://en.wikipedia.org/wiki/The_Great_Gatsby",
  //       licence: "Public Domain",
  //       trainedModels: ["Linear Regression", "Logistic Regression", "Random Forest", "Gradient Boosting", "Support Vector Machines", "Neural Networks", "K-Nearest Neighbors"],
  //       }
  //       setData(jsonData);
  //       setLoading(false);
  //   };

  //   fetchData();
  // }, [datasetName]);


function safeSplit(value) {
  // Handles null, undefined, or empty strings
  if (!value || value.trim() === "") {
    return [];
  }

  const items = value.split(", ").map(item => item.trim()).filter(item => item !== "");
  return items;
}
const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  const monthName = d.toLocaleString('default', { month: 'long' }); // e.g., "September"
  const year = d.getFullYear();
  return `${monthName} ${year}`;
};

useEffect(() => {

      const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/search/${datasetName}`);
        const result = response.data[0]; // because i have always one dataset in response
        
        console.log(result)
        result.identifiers = safeSplit(result.identifiers)
        result.publisher = safeSplit(result.publishers)
        result.publisher_url = safeSplit(result.publisher_urls)
        result.creator = safeSplit(result.creators)
        result.creator_url = safeSplit(result.creator_url)
        console.log(result)
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
}, [datasetName]);

useEffect(() => {

      const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/search/models/${datasetName}`);
        const result = response.data;
        console.log(result)
        setModels(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
}, [datasetName]);




  // if (loading) {
  //   return <div>Loading dataset...</div>;
  // }

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

        <h3>Short analysis:</h3>
        <p className='paragraphStyle'>{data.analysis}</p>

        {models && models.length > 0 && (
          <div>
            <h3>Models trained:</h3>
            <div>
              {models.map((model) => (
                <p key={model} className='paragraphStyle'>{model}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div id='middleInfoContainer'>
        <div id='breakLine'></div>
      </div>

      <div id="rightSideInfoContainer">
        <h4>Dataset type: </h4>
        <p className='paragraphStyle'>{data.type}</p>



        {data.publisher && data.publisher.length > 0 && (
          <div>
            <h4>Published by:</h4>
            {data.publisher.map((name, i) => (
              <p key={i} className="paragraphStyle">
                {data.publisher_url[i]
                  ? <a href={data.publisher_url[i]} target="_blank" rel="noopener noreferrer" className="linksAsRegular">{name}</a>
                  : name}
              </p>
            ))}
          </div>
        )}

        {data.identifiers && data.identifiers.length > 0 && (
          <div>
            <h4>Identifiers:</h4>
            {data.identifiers.map((id, i) => (
              <p key={i} className="paragraphStyle">
                {id.startsWith("http") || id.startsWith("https") ? (
                  <a href={id} target="_blank" rel="noopener noreferrer" className="linksAsRegular">
                    {id}
                  </a>
                ) : (
                  id
                )}
              </p>
            ))}
          </div>
        )}

        <h4>Published on:</h4>
        <p className='paragraphStyle'>{formatDate(data.date)}</p>

        <h4>Licence:</h4>
        <p className='paragraphStyle'>
          <a href={data.license} target="_blank" rel="noopener noreferrer" className="linksAsRegular">
            {data.license}
          </a>
        </p>

      </div>

    </div>
    <Footer />
  </div>
);
}
export default InfoPage;
