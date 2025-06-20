import './ListItem.css';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom'; 

const ListItem = (props) => {
  const { dataset, publishers,creators, date, type } = props.data;
  const navigate = useNavigate();

  const handleDatasetClick = (item) => {
    const encodedTitle = encodeURIComponent(item); // Encode the title
    navigate(`/info/${encodedTitle}`);
  };


  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    const monthName = d.toLocaleString('default', { month: 'long' }); // e.g., "September"
    const year = d.getFullYear();
    return `${monthName}-${year}`;
  };

  return (
    <div id="ItemContainer" onClick={() => {handleDatasetClick(dataset)}}>
      <div id="ItemTitle">
        <h2>{dataset}</h2>
      </div>

      <div id="ItemInfo">
        {publishers && <p>{publishers}</p>}
        {date && <p>{formatDate(date)}</p>}
        <p>{type}</p>
        {/* {subtype && <p>{subtype}</p>} */}
      </div>
    </div>
  );
};

export default ListItem;