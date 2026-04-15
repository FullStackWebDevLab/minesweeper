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
        this.buildComponents();
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

        // Build constraints for each unsolved cell.
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
            // Solved cells have no variables and no mineCount.
            if (variables.length === 0 && mineCount === 0) {
                this.solvedCells.push(cellIndex);
                continue;
            }

            const constraint = { "variables": variables, "mineCount": mineCount }
            constraints.push(constraint);
        }

        // Build constraint for the entire board.
        const mineCount = this.difficulty.mineCount - flaggedCells.length;
        const variables = [];
        for (let i = 0; i < this.difficulty.cellCount; i++) {
            if (openCells.includes(i) || flaggedCells.includes(i)) continue;
            variables.push(i);
        }

        const constraint = { "variables": variables, "mineCount": mineCount };
        // constraints.push(constraint);

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
        * The cycle repeats until no new straight forward constraints are found
        * or when the game is won.
        */
    solveStraightForwardConstraints() {
        let changed = true;
        while (changed) {
            changed = false;
            const constraints = this.buildConstraints();

            for (const constraint of constraints) {
                const variables = constraint.variables;
                const mineCount = constraint.mineCount;

                /*
                    * Start by flagging cells with mines and end with
                    * opening safe cells. This is because, the game ends
                    * when all safe cells are opened. If you start by opening
                    * safe cells, and lets say you open all safe cells and
                    * win the game, this function will continue to play the
                    * already won game by trying to flag the cells with mines.
                    *
                    * In the api, `this.api.flag` doesn't do anything when
                    * the game is won. This means that this function will be
                    * in an infinite loop calling `this.api.flag` on the same
                    * cell(s) and the cells will never be flagged.
                    *
                    * To avoid this, start by flagging the cells with mines, then
                    * open safe cells, then check if the game is won before repeating
                    * the cycle. Break if the game is won.
                    */

                // Flag cells with mines.
                if (variables.length === mineCount) {
                    for (const variable of variables) {
                        this.api.flag(variable); 
                    }
                    changed = true;
                }

                // Open safe cells.
                if (mineCount === 0) {
                    for (const variable of variables) {
                        this.api.open(variable);
                    }
                    changed = true;
                }
            }

            // Break when the game is won.
            if (this.api.checkWin()) break;
        }
    }

    /*
        * Build and return an array of components.
        * A component is a set of connected variables. 2 variables belong
        * in the same component if they share at least one constraint.
        */
    buildComponents() {
        /*
            * Build a graph.
            * The graph is represented as an adjacency map.
            * The key is a Number index representing a node on the graph.
            * The value is a set of indices of the node's neighbours.
            */
        const constraints = this.buildConstraints();
        const adjacencyMap = new Map(); // index: Set(indices)

        for (const constraint of constraints) {
            for (const variable of constraint.variables) {
                if (!adjacencyMap.has(variable)) adjacencyMap.set(variable, new Set());

                for (const variable2 of constraint.variables) {
                    if (variable === variable2) continue;
                    adjacencyMap.get(variable).add(variable2);
                }
            }
        }

        /*
            * Use breadth-first search to build components.
            */

        console.log(adjacencyMap);
    }
}
