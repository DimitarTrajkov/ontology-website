import './styles/header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faUser } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom'; 
import PropTypes from 'prop-types'; // Import PropTypes

const Header = ({ filterText, setFilterText }) => {
  const navigate = useNavigate();

  const handleSearchChange = (event) => {
    setFilterText(event.target.value);  // Update the filterText in Home component
  };

  return (
    <div id="headerContainer">
        <button id="headerLogo" className='buttonAsText' onClick={() => {navigate('/')}}>InsightML</button>
        <div id="searchBar">
            <input
              className='searchInput'
              type="text"
              placeholder="Search for ontologies"
              value={filterText}
              onChange={handleSearchChange}  // Handle the search input change
            />
            <button id="searchButton">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
        </div>
        <div id="headerButtons">
          <button id="signInButton" className='buttonAsText'><u>Sign In</u></button>
          <button id="Account" className='buttonAsText'><FontAwesomeIcon icon={faUser} /></button>
        </div>
    </div>
  );
};


Header.propTypes = {
  filterText: PropTypes.string.isRequired,  
  setFilterText: PropTypes.func.isRequired,
};

export default Header;
