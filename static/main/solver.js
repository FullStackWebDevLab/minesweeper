export default class Solver {
    constructor(api) {
        this.api = api;
        this.difficulty = this.api.getDifficulty();

        /*
            * Solved cells are cells that are open, and all its safe neighbours
            * are opened as well. It's a cell where the number of unopened
            * neighbours equals the number displayed on the cell (the number
            * of mines around the cell). The constraints produced by these cells
            * are satisfied.
            *
            * They are tracked in the array below to know which cells to avoid
            * when building new constraints.
            */
        this.solvedCells = [];
    }

    /*
        * Attempt to solve the board.
        */
    solve() {
        this.openRandomCell();

        const constraints = this.buildConstraints();
        console.log(constraints);
    }

    /*
        * Open a random cell to start off the game.
        */
    openRandomCell() {
        const index = Math.floor(Math.random() * this.difficulty.cellCount);
        this.api.openCell(index);
    }

    /*
        * Build constraints for all unsolved cells. Unsolved cells are cell
        * that have more covered neighbours than the number of mines around
        * them, meaning that some of its neighbours are covered and need to
        * be opened.
        *
        * A constraints contains an array of variables, and the mine count.
        * Variables are covered unflagged cells. The mine count is the number
        * of mines around the cell. Example constraint:
        *   { variables: [0, 2, 8], mineCount: 2 }
        *
        * This function returns an array of constraints.
        */
    buildConstraints() {
        const openCells = this.api.getOpenCells();
        const flaggedCells = this.api.getFlaggedCells();

        // Remove solved cells.
        const unsolvedCells = [];
        for (const index of openCells) {
            if (this.solvedCells.includes(index)) continue;
            unsolvedCells.push(index);
        }

        // Build constraints.
        const constraints = [];
        for (const cellIndex of unsolvedCells) {
            const variables = [];
            let mineCount = this.api.getCellMineCount(cellIndex);

            const cellNeighbours = this.api.getCellNeighbours(cellIndex);
            for (const neighbourIndex of cellNeighbours) {
                // Reduce required mines for every flagged neighbour.
                const flagged = this.api.isFlagged(neighbourIndex);
                if (flagged) mineCount--;

                // Add unflagged closed neighbours to variables.
                const state = this.api.getCellState(neighbourIndex);
                if (!flagged && state === "closed") {
                    variables.push(neighbourIndex);
                }
            }

            // Keep track of solved cells and skip them.
            // Solved cells have a no variables and no mineCount.
            if (variables.length === 0 && mineCount === 0) {
                this.solvedCells.push(cellIndex);
                continue;
            }

            // Final constraint.
            const constraint = { "variables": variables, "mineCount": mineCount }
            constraints.push(constraint);
        }

        return constraints;
    }
}
