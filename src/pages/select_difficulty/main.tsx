import styles from "./styles.module.css";

export default function SelectDifficulty() {
    return <div class={styles.container}>
        <h1>Minesweeper</h1>
        <h2>Select Difficulty</h2>
        <div class={styles.cardGrid} >
            <DifficultyCard heading="8x8" description="Beginner" />
            <DifficultyCard heading="16x16" description="Intermediate" />
            <DifficultyCard heading="32x16" description="Advanced" />
            <DifficultyCard heading="Custom" description="Define your own grid" />
        </div>
        <footer class="secondary-text">Made by <a href="https://github.com/raymondmwaura-osdev">Raymond</a></footer>
    </div>;
}

// Components
function DifficultyCard({ heading, description }) {
    return <div class={styles.card} >
        <h3>{heading}</h3>
        <p>{description}</p>
    </div>;
}
