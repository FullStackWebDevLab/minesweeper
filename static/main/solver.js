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
        this.solveStraightForwardConstraints();
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
        // TODO: Build one constraint for the entire board.
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

    /*
        * This function builds constraints, then searches for straight
        * forward constraints. Straight forward constraints are:
        *   + Constraints where the number of variables equals the mine count.
        *       For such constraints, all the variables contain mines.
        *   + Constraints where the mine count is zero. For such constraints,
        *       all variables are safe (if any).
        * This function then solves these straight forward constraints and
        * repeats the cycle (build then solve constraints).
        * The cycle repeats until no new straight forward constraints are found.
        */
    solveStraightForwardConstraints() {
        let changed = true;
        while (changed) {
            changed = false;
            const constraints = this.buildConstraints();

            for (const constraint of constraints) {
                const variables = constraint.variables;
                const mineCount = constraint.mineCount;

                // Get constraints where all variables are mines.
                if (variables.length === mineCount) {
                    for (const variable of variables) {
                        this.api.flag(variable); 
                    }
                    changed = true;
                }

                // Get constraints where the mine count is 0.
                if (mineCount === 0) {
                    for (const variable of variables) {
                        this.api.open(variable);
                        console.log("Opening cell");
                    }
                    changed = true;
                }
            }
        }
    }
}
