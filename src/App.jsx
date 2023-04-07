import { useState } from "react";
import data from "./utils/poanimaDataset.json";
import EpisodeWordsBarChart from "./components/EpisodeWordsBarChart/EpisodeWordsBarChart";
import SeasonSchoolHeatmap from "./components/SeasonSchoolHeatmap/SeasonSchoolHeatmap";
// import TitleWordsRadial from "./components/TitleWordsRadial/TitleWordsRadial";
import SeasonTechniqueHeatmap from "./components/SeasonTechniqueHeatmap/SeasonTechniqueHeatmap";
import TitleWordsRadialAnimated from "./components/TitleWordsRadial/TitleWordsRadialAnimated";

let filteredData = data;

function App() {
  const [films, setFilms] = useState(filteredData);
  const [season, setSeason] = useState(1);

  const handleChange = () => {
    const randomSeason = Math.floor(Math.random() * 10) + 1;
    setFilms(filteredData.filter((d) => d.season === randomSeason));
    setSeason(randomSeason);
  };

  return (
    <div className="my-10 flex min-h-screen w-screen flex-col items-center">
      <h1>Data visualization</h1>
      <button className="btn-ghost btn my-10" onClick={handleChange}>
        Change Season: {season}
      </button>
      <div className="mb-20">
        <TitleWordsRadialAnimated data={data} />
      </div>
      <div className="mb-20">
        <SeasonTechniqueHeatmap data={data} />
      </div>
      <div className="mb-20">
        <SeasonSchoolHeatmap data={data} />
      </div>
      <div className="">
        <EpisodeWordsBarChart data={films} />
      </div>
    </div>
  );
}

export default App;
