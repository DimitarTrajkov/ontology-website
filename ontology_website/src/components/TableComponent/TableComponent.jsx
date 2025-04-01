import React, { useEffect, useState } from "react";
import { Button, Switch } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { saveAs } from "file-saver";
import "./TableComponent.css";
import DownloadIcon from '@mui/icons-material/Download';


const TableContainer = ({data, outterTrueCheck, setOutterTrueCheck, title, innerOutter}) => {

    const [columns, setColumns] = useState([]);

    // useEffect(() => {
    //   if (data.length > 0) {
    //     // console.log("data for the tables", data)
    //     // Dynamically extract columns from the first data entry
    //     const newColumns = Object.keys(data[0]).map((key) => ({
    //       field: key,
    //       headerName: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    //       width: 140,
    //     }));
  
    //     setColumns(newColumns);
    //   }
    // }, [data]); 
    
    useEffect(() => {
      if (data.length > 0) {
        const newColumns = Object.keys(data[0])
          .filter((key) => key !== "id") // Exclude "id" from columns
          .map((key) => ({
            field: key,
            headerName: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
            width: 140,
          }));
    
        setColumns(newColumns);
      }
    }, [data]);
    


  const convertToCSV = (data) => {
    // Extract column names dynamically from the data
    const headers = columns.map((col) => col.headerName).join(",");
    const rowsData = data.map((row) =>
      columns.map((col) => row[col.field] || '').join(",")
    );
    return [headers, ...rowsData].join("\n");
  };

  const downloadCSV = () => {
    const csvData = convertToCSV(data); // Use the correct data variable
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "table_data.csv");
  };

  return (
    <div style={{ height: 400, width: "100%" }}>
        <div id="tableHeaderAndButtonsContainer">
          {innerOutter ? (
            <div id="innerOutterToggleContainer">
              <p>Toggle Inner/Outter</p>
              <Switch
                  checked={outterTrueCheck}
                  onChange={(e) => {setOutterTrueCheck(e.target.checked)}}
                  inputProps={{ 'aria-label': 'controlled' }}
                  sx={{
                    // '& .MuiSwitch-switchBase.Mui-checked': {color: 'var(--color1)',},
                    // '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {backgroundColor: '#727D73',},
                  }}
                  />
            </div>
          ) : (<div></div>)}
            <h2>{title}</h2>
            <button id="downloadCSVButton" onClick={downloadCSV} style={{ marginBottom: 10 }}>
            <p>Download CSV</p>
            <DownloadIcon />
            </button>
        </div>
        <DataGrid rows={data} columns={columns} pageSize={5}
            getRowId={(row) => row.id}/>
    </div>
  );
};

export default TableContainer;
