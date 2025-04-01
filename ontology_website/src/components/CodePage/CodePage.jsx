import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Header';
import '../MetaFeaturePage/MetaFeaturePage.css';
import './CodePage.css';
import { useNavigate } from 'react-router-dom'; 

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';


import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-javascript'; // Import the language mode
import 'ace-builds/src-noconflict/theme-monokai'; // Import a theme
import NavigationBar from '../NavigationComponent/NavigationBar';
import Footer from '../Footer/Footer';


const CodePage = () => {
  const navigate = useNavigate();
  const { datasetName } = useParams();
  const [loading, setLoading] = useState(true);
  const codeSnippet = `
    function myFunction() {
      console.log("Hello, world!");
      return 42;
    }
    function myFunction() {
      console.log("Hello, world!");
      return 42;
    }
    function myFunction() {
      console.log("Hello, world!");
      return 42;
    }
    function myFunction() {
      console.log("Hello, world!");
      return 42;
    }
    function myFunction() {
      console.log("Hello, world!");
      return 42;
    }
    function myFunction() {
      console.log("Hello, world!");
      return 42;
    }
  `;



  useEffect(() => {
    const fetchData = async () => {
        setLoading(false);
    };

    fetchData();
  }, [datasetName]);
  

  if (loading) {
    return <div>Loading dataset...</div>;
  }

  return (
    <div className="mainContainer">
    <Header />
      <h1 className="TitleText">Dataset: {datasetName}</h1>
      <NavigationBar datasetName={datasetName} />
      <div id="CodeContainer" className='basicContainer'>
      <div id="codeSnippet" >
        <SyntaxHighlighter  
          language="python" // Specify the language for highlighting
          style={coy} // Apply a theme
          >
          {codeSnippet}
        </SyntaxHighlighter>
      </div>


      <AceEditor
        mode="javascript"
        theme="monokai"
        value={codeSnippet}
        onChange={(newValue) => {
          // Handle code changes if needed
          console.log(newValue);
        }}
        name="UNIQUE_ID_OF_DIV" // Important for AceEditor
        editorProps={{ $blockScrolling: true }}
        width="600px" // Set width as needed
        height="400px" // Set height as needed
      />

      </div>
      <Footer />
    </div>
  );
};

export default CodePage;