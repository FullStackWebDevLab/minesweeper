/*
    * This API provides an interface for programs to access the minesweeper game.
    * It is originally intended to be used by the solver to play the game.
    */
class MinesweeperAPI() {
    openCell(index) {
        // Open the cell at the given index.
        // Return true if the cell was safe, false if the cell had a mine.
    }
    flagCell(index) {
        // Flag the cell at the given index.
    }
    haveWon() {
        // Return true if the game is won, false otherwise.
        // False does not mean that the game is lost.
    }
    haveLost() {
        // Return true if the game is lost, false otherwise.
        // False does not mean that the game is won.
    }
    getUnopenedCells() {
        // Return an array of indices of unopened and unflagged cells.
    }
}
