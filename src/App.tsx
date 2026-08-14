import { BrowserRouter, Routes, Route } from "react-router-dom";
import SelectDifficulty from "./select_difficulty_page/main.tsx";
import GamePage from "./game_page/main.tsx";

export default function App() {
    return <>
    <BrowserRouter>
        <Routes>
            <Route path="/select_difficulty" element={<SelectDifficulty />} />
            <Route path="/" element={<GamePage />} />
        </Routes>
    </BrowserRouter>
    </>;
}
