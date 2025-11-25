import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import MainPage from "./pages/MainPage";

function App() {
  const [started, setStarted] = useState(false);

  return started ? (
    <MainPage />
  ) : (
    <LandingPage onStart={() => setStarted(true)} />
  );
}

export default App;
