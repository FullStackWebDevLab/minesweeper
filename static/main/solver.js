export default class Solver {
    constructor(api) {
        this.api = api;
        this.difficulty = this.api.getDifficulty();
    }

    /*
        * Attempt to solve the board.
        */
    solve() {
        this.openRandomCell();
    }

    /*
        * Open a random cell to start off the game.
        */
    openRandomCell() {
        const index = Math.floor(Math.random() * this.difficulty.cellCount);
        this.api.openCell(index);
    }
}
