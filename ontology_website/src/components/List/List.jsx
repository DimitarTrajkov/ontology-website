import React, { useState, useEffect } from 'react';
import Header from "../Header";
import ListItem from "../ListItem/ListItem";
import './list.css';
import axios from 'axios';


import Skeleton from '@mui/material/Skeleton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Pagination } from '@mui/material';
import Footer from '../Footer/Footer';
import { useLocation } from 'react-router-dom'; // For getting the filterText from navigation


const List = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const filterTextFromUrl = searchParams.get('filterText') || ''; 

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState(filterTextFromUrl || '');
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debounceTimeout, setDebounceTimeout] = useState(null);


  const types = ['Regression', 'Classification', 'Images'];

const fetchData = async () => {
  try {
    const response = await axios.get('http://localhost:5000/search');
    const result = response.data;
    setData(result);
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }

  const timeout = setTimeout(() => {
    fetchData();  // Call fetchData after 200ms delay
  }, 400);

  setDebounceTimeout(timeout);  // Store the new timeout ID

  // Clean up the timeout on component unmount or on filterText change
  return () => clearTimeout(timeout);

}, [filterText, sortField, sortOrder, selectedTypes, currentPage]);


  const handleSortClick = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleTypeChange = (event) => {
    setSelectedTypes(event.target.value);
  };

  // msm deka ne ni treba veke
  // const filteredData = data.filter((item) => selectedTypes.length === 0 || selectedTypes.includes(item.type));
  const filteredData = data


  const handlePageChange = (event, value) => {
    setCurrentPage(value); // Update the page number on page change
  };

  return (
    <div id="screenContainer">
    <Header filterText={filterText} setFilterText={setFilterText} />
      <div id="filterContainer">
        <button  className="filterButtons" onClick={() => handleSortClick('title')}>
          Title
          {sortField === 'title' && (sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
        </button>

        <button className="filterButtons" onClick={() => handleSortClick('publisher')}>
          Publisher
          {sortField === 'publisher' && (sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
        </button>
        <button className="filterButtons" onClick={() => handleSortClick('date')}>
          Date
          {sortField === 'date' && (sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
        </button>
        <button className="filterButtons" onClick={() => handleSortClick('type')}>
          Type
          {sortField === 'type' && (sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
        </button>

        <FormControl id="typeFilter">
          <InputLabel id="type-multiple-label" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>Selected types</InputLabel>
          <Select
            labelId="type-multiple-label"
            id="type-multiple"
            multiple
            value={selectedTypes}
            onChange={handleTypeChange}
            renderValue={(selected) => selected.map(item => item.charAt(0)).join(', ')}
            sx={{ width: '100%',height: '100%' }}
            >
            {types.map((type) => (
              <MenuItem
                key={type}
                value={type}
                sx={{
                  backgroundColor: '#ECEBDE',
                  '&:hover': {
                    backgroundColor: '#C1BAA1',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#C1BAA1',
                  },
                  '&:focus': {
                    backgroundColor: '#ECEBDE',
                  },
                }}
              >
                <Checkbox checked={selectedTypes.includes(type)} />
                <ListItemText primary={type} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div id="listContainer">
      {loading ? (
        [1, 2, 3, 4, 5].map((index) => (
          <div key={index} style={{ marginBottom: '16px' }}>
            <Skeleton sx={{ bgcolor: '#C1BAA1', marginBottom: '4vh', width: '100%', height: '12vh'}} variant="rounded" />
          </div>
        ))
      ) : (
        filteredData.length > 0 ? (
          filteredData.map((item) => (
            <ListItem key={item.dataset} data={item}/>
          ))
        ) : (
          <div id='noResultsContainer'>
            No results found.
          </div>
        )
      )}
      </div>
      {filteredData.length > 0 && (
      <div id="paginationContainer" className='alignCenter'>
      <Pagination
          className='pagination'
          count={totalPages}  // Total number of pages
          page={currentPage}  // Current page
          onChange={handlePageChange}  // Page change handler
        />
        </div>
      )}
        <Footer />
    </div>
  );
};

export default List;