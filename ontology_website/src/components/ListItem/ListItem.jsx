import './ListItem.css';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom'; 

const ListItem = (props) => {
  const { title, publisher, date, type, subtype } = props.data;
  const navigate = useNavigate();

  const handleDatasetClick = (item) => {
    const encodedTitle = encodeURIComponent(item); // Encode the title
    navigate(`/info/${encodedTitle}`);
  };

  return (
    <div id="ItemContainer" onClick={() => {handleDatasetClick(title)}}>
      <div id="ItemTitle">
        <h2>{title}</h2>
      </div>

      <div id="ItemInfo">
        {publisher && <p>{publisher}</p>}
        {date && <p>{date}</p>}
        <p>{type}</p>
        {subtype && <p>{subtype}</p>}
      </div>
    </div>
  );
};

export default ListItem;