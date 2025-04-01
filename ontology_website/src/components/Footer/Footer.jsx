import './Footer.css';
import MailIcon from '@mui/icons-material/Mail';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';


const Footer = () => {
  return (
    <div id="footerContainer">
        <div id='mainFooterContainer'>
            <div id='footerLogoContainer' className='alignCenter'>
                <img id='ijsLogoFooter' src='https://upload.wikimedia.org/wikipedia/sl/thumb/3/39/Logotip_IJS.svg/1200px-Logotip_IJS.svg.png' alt='Ontario Logo'/>
            </div>
            <div className='horizontalBrakeLine'></div>
            <div id='footerTextContainer'>
                <h3>Our team:</h3>
                <p>Dimitar Trajkov</p>
                <p>Ana Kostovska</p>
                <p>Dragi Kocev</p>
            </div>
        </div>
        <div id='LinkContainer' className='alignCenter'>
          <a href="mailto:dimtiar.trajkovv@gmail.com" target="_blank" rel="noopener noreferrer"><   MailIcon fontSize="large"/>   </a>
          <a href="https://www.linkedin.com/in/dimitar-trajkov-b176992a3/" target="_blank" rel="noopener noreferrer">   <LinkedInIcon fontSize="large"/>   </a>
          <a href="https://github.com/DimitarTrajkov" target="_blank" rel="noopener noreferrer">   <GitHubIcon fontSize="large"/>   </a>
        </div>
    </div>
  );
};

export default Footer;