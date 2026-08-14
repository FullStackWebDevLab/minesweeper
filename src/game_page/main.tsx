import styles from "./styles.module.css";

export default function GamePage() {
    return <Cell />;
}

// Components
/**
 * @param {string} state - Indicates whether the cell is opened or closed.
 *   Values are "opened" or "closed". Defaults to "closed".
 * @param {Number} mineCount - A number indicating the number of mines around the cell.
 *   Must be given when state is "opened". Should not be given when state is "closed".
 *   The number will be displayed on the cell.
 * @param {Boolean} flagged - Indicates whether the cell is flagged or not.
 *   Should only be given when state is "closed". A flag will be shown on the cell.
 *   Defaults to false.
 */
function Cell({ state = "closed", mineCount, flagged = false }) {
    if (state === "closed") {
        return <div className={styles.closedCell} >
        { flagged ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flag-triangle-left-icon lucide-flag-triangle-left"><path d="M18 22V2.8a.8.8 0 0 0-1.17-.71L5.45 7.78a.8.8 0 0 0 0 1.44L18 15.5"/></svg>: "" }
        </div>;
    } else if (state === "opened") {
        return <div className={styles.openedCell} >{mineCount}</div>;
    }
}
