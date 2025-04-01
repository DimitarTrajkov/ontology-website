import Footer from '../Footer/Footer';
import Header from '../Header';
import './NotFound.css';

const NotFound = () => {
    return(
    <div id="notFoundMainCointer">
      <Header/>
      <div id='notFoundTextContainer'>
      <h1>404 Page not found</h1>
      <h3>Sorry, the page you are looking for does not exist.</h3>
      </div>
      <div id='footerDiv'>
      <Footer/>
      </div>
    </div>
    ); 
  };
  
export default NotFound;
  