import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import './NavigationBar.css';

const NavigationButton = ({ to, children, datasetName, isInitiallySelected }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isActive, setIsActive] = useState(isInitiallySelected); // State for active status

  useEffect(() => {
    // Update isActive based on location change, but only if not initially selected
    if (!isInitiallySelected) {
        const encodedTo = to.replace(':datasetName', datasetName);
        const decodedPathname = decodeURIComponent(location.pathname);
        // console.log(encodedTo, decodedPathname);
        setIsActive(decodedPathname === (encodedTo));
    }
  }, [location.pathname, datasetName, to, isInitiallySelected]); // Add location.pathname to dependencies

  const handleClick = () => {
    if (!isActive) {
      navigate(to.replace(':datasetName', datasetName));
    }
  };

  return (
    <button
      className={`NavigationButtons ${isActive ? 'selected' : ''}`}
      onClick={handleClick}
      disabled={isActive}
    >
      {children}
    </button>
  );
};

NavigationButton.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  datasetName: PropTypes.string.isRequired,
  isInitiallySelected: PropTypes.bool, // Add prop for initial selection
};

const NavigationBar = ({ datasetName }) => {
  return (
    <div id="navigationBar">
      <NavigationButton to={`/info/:datasetName`} datasetName={datasetName} > 
        Basic Info
      </NavigationButton>
      <NavigationButton to={`/meta_features/:datasetName`} datasetName={datasetName}>
        Meta features
      </NavigationButton>
      <NavigationButton to={`/performance/:datasetName`} datasetName={datasetName}>
        Performance
      </NavigationButton>
      {/* <NavigationButton to={`/code/:datasetName`} datasetName={datasetName}>
        Code
      </NavigationButton> */}
      <NavigationButton to={`/compare_dataset/:datasetName`} datasetName={datasetName}>
        Compare
      </NavigationButton>
    </div>
  );
};

NavigationBar.propTypes = {
  datasetName: PropTypes.string.isRequired,
};

export default NavigationBar;