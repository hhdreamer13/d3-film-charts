import { useState } from "react";
import data from "./utils/poanimaDataset.json";
import EpisodeWordsBarChart from "./components/EpisodeWordsBarChart/EpisodeWordsBarChart";
import TitleWordsBarChart from "./components/TitleWordsBarChart/TitleWordsBarChart";

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
    <div className="my-20 flex min-h-screen w-screen flex-col items-center">
      <h1>New React Project</h1>
      <p>React + Vite + Tailwind</p>
      <button className="btn-ghost btn my-20" onClick={handleChange}>
        Change Season: {season}
      </button>
      <EpisodeWordsBarChart data={films} />
      <TitleWordsBarChart data={films} />
    </div>
  );
}

export default App;
