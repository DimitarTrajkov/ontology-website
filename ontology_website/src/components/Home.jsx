import styled from 'styled-components';
import './styles/home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'; 
import { useNavigate } from 'react-router-dom'; 
import { useState } from 'react';
import { Assignment, Analytics, Science, Storage } from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();
  const [filterText, setFilterText] = useState('');

  const handleSearchChange = (event) => {
    setFilterText(event.target.value);
  };

  const handleSearchSubmit = () => {
    // Navigate to the List page with filterText as a query parameter
    navigate(`/library?filterText=${filterText}`);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };


  return ( 
    <div id="homeScreen">
      <div id="container1">
        <h1>InsightML</h1>
        <p id="websiteDescription">
        Welcome to InsightML! This platform gathers over 1000 experiments on Brain Stroke data, offering powerful
         visualizations and analyses for easy exploration. Compare results seamlessly across different models and 
         identical hyperparameter configurations on various datasets, ensuring a clear and convenient evaluation 
         process. Unlock valuable insights effortlessly with InsightML!
        </p>

        <div id="searchBar">
          <input 
            className='searchInput' 
            type="text" 
            placeholder="Search for datasets"
            value={filterText}
            onChange={handleSearchChange}
            onKeyDown={handleKeyPress}
          />
          <button id="searchButton" onClick={handleSearchSubmit}>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>

        <div id='homeButtonsContainer'>
          <div className="libraryButton"><button onClick={() => {navigate('/library')}}><Storage />Search from library</button></div>
          <div className="libraryButton"><button onClick={() => {navigate('/experiments')}}><Science />Explore experiments</button></div>
        </div>
      </div>
    </div>
  );
};

export default Home;
