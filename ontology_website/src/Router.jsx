import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
// import About from "./pages/About";
// import Contact from "./pages/Contact";
import NotFound from "./components/NotFoundPage/NotFound";
import List from "./components/List/List";
import InfoPage from "./components/InfoPage/InfoPage";
import MetaFeaturePage from "./components/MetaFeaturePage/MetaFeaturePage";
import PerformancePage from "./components/PerformancePage/PerformancePage";
import CodePage from "./components/CodePage/CodePage";
import ComparePage from "./components/ComparePage/ComparePage";
import ExperimentList from "./components/ExperimentList/ExperimentList";
import ExperimentPage from "./components/ExperimentPage/ExperimentPage";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<List />} />
        <Route path="/experiments" element={<ExperimentList />} />
        <Route path="/info/:datasetName" element={<InfoPage />} />
        <Route path="/experiment/:experimentEncoded" element={<ExperimentPage />} />
        <Route path="/meta_features/:datasetName" element={<MetaFeaturePage />} />
        <Route path="/performance/:datasetName" element={<PerformancePage />} />
        {/* <Route path="/code/:datasetName" element={<CodePage />} /> */}
        <Route path="/compare_dataset/:datasetName" element={<ComparePage />} />
        {/* <Route path="/about" element={<About />} /> */}
        {/* <Route path="/contact" element={<Contact />} /> */}
        <Route path="*" element={<NotFound />} /> {/* Handles 404 */}
      </Routes>
    </Router>
  );
};

export default AppRouter;
