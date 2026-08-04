import { BrowserRouter, Routes, Route } from "react-router-dom";
import SelectDifficulty from "./pages/select_difficulty/main.tsx";

export default function App() {
    return <>
    <BrowserRouter>
        <Routes>
            <Route path="/select_difficulty" element={<SelectDifficulty />} />
        </Routes>
    </BrowserRouter>
    </>;
}
