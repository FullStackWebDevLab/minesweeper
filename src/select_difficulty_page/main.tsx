import styles from "./styles.module.css";
import { Link } from "react-router-dom";

export default function SelectDifficulty() {
    return <div className={styles.container}>
        <h1>Minesweeper</h1>
        <h2>Select Difficulty</h2>
        <div className={styles.cardGrid} >
            <DifficultyCard heading="8x8" difficulty="Beginner" />
            <DifficultyCard heading="16x16" difficulty="Intermediate" />
            <DifficultyCard heading="32x16" difficulty="Advanced" />
            <DifficultyCard heading="Custom" difficulty="Define your own grid" />
        </div>
        <footer className="secondary-text">Made by <a href="https://github.com/raymondmwaura-osdev">Raymond</a></footer>
    </div>;
}

// Components
/**
 * A card displaying a difficulty mode, with a heading showing the size (e.g. 8x8, or Custom) and a description of the difficulty level (e.g. 'beginner').
 * @param {string} heading - Can be "Custom" or a size like 8x8.
 * @param {string} difficulty - Can be 'beginner', 'intermediate', or 'advanced'. It will be used twice. First, it will be displayed on the difficulty card (with the first letter capitalized). Second, it will be used as the value of 'difficulty' in the url where the link will poin to (e.g "?difficulty=beginner".
 */
function DifficultyCard({ heading, difficulty }) {
    return <Link to={`../?difficulty=${difficulty.toLowerCase()}`} className={styles.card}>
            <h3>{heading}</h3>
            <p>{difficulty}</p>
    </Link>;
}
