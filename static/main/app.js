// HTML Elements
const boardElement = document.querySelector(".board");
const remainingFlagsElement = document.getElementById("remainingFlagsLabel");

function main() {
    const gameLogic = new GameLogic();

    // Init the board.
    globalThis.BOARD = [];

    const searchParams = new URLSearchParams(window.location.search);
    globalThis.DIFFICULTY = new Difficulty(searchParams.get("difficulty"));

    init();

    // Handle events.
    boardElement.addEventListener("click", gameLogic.clickHandler);
}

/*
    * Initiate the game based on difficulty by:
    *   Displaying remaining flags count.
    *   Creating and displaying the required number of cell elements.
    *
    * Parameters:
    */
function init() {
    remainingFlagsElement.innerHTML = DIFFICULTY.mineCount;

    boardElement.style.setProperty("--columns", DIFFICULTY.columnCount);
    for (let i = 0; i < DIFFICULTY.cellCount; i++) {
        const cell = new Cell(i);
        boardElement.appendChild(cell.element);
        BOARD.push(cell);
    }
}

/*
    * Place mines across the board.
    *
    * The clicked cell and all its neighbours are guaranteed to be safe.
    * Mines are then placed randomly (using the Fisher-Yates shuffle) in
    * the remaining cells.
    * The number of mines placed depends on the difficulty.
    *
    * Parameters:
    *   clickedCellObject:
    *       An instance of the Cell class representing the clicked cell.
    */
function placeMines(clickedCellObject) {
    const excludedCellsIndices = [clickedCellObject.index];
    excludedCellsIndices.push(...clickedCellObject.neighbours)

    const validCellsIndices = [];
    for (let i = 0; i < DIFFICULTY.cellCount; i++) {
        if (excludedCellsIndices.includes(i)) continue;
        validCellsIndices.push(i);
    }

    /*
        * Shuffle validCellsIndices using Fisher-Yates shuffle:
        *   Start at the last element of the list.
        *   Generate a random integer `j` such that `0 ≤ j ≤ i`, where `i` is the current index.
        *   Swap the element at index `i` with the element at index `j`.
        *   Repeat the process for index `i-1`, continuing until you reach the beginning of the list.
        */
    for (let i = validCellsIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [validCellsIndices[i], validCellsIndices[j]] = [validCellsIndices[j], validCellsIndices[i]];
    }

    // Place mines in the first `DIFFICULTY.mineCount` cells.
    for (let i = 0; i < DIFFICULTY.mineCount; i++) {
        const cellIndex = validCellsIndices[i];
        BOARD[cellIndex].hasMine = true;
    }
}

class Difficulty {
    constructor(difficulty) {
        if (difficulty === "beginner") {
            this.rowCount = 8;
            this.columnCount = 8;
            this.mineCount = 10;
        } else if (difficulty === "intermediate") {
            this.rowCount = 16;
            this.columnCount = 16;
            this.mineCount = 40;
        } else if (difficulty === "expert") {
            this.rowCount = 16;
            this.columnCount = 30;
            this.mineCount = 99;
        } else {
            console.log("Invalid difficulty.");
        }

        this.cellCount = this.rowCount * this.columnCount;
        this.safeCellsCount = this.cellCount - this.mineCount;
    }
}

class Cell {
    // this.hasMine is a boolean that indicates whether the cell has a mine or not.
    constructor(index) {
        this.index = index;
        this.state = "closed"; // "opened" or "closed"

        // Create cell HTML element.
        this.element = document.createElement("div");
        this.element.classList.add("cell", this.state);
        this.element.dataset.index = this.index;

        // Calculate cell's row and column.
        this.row = Math.floor(this.index / DIFFICULTY.columnCount);
        this.col = this.index % DIFFICULTY.columnCount;

        this.neighbours = this.getNeighbours();
    }

    openCellAndNeighbours() {
        /*
            * Open the current cell and display the number of mines around it.
            * If the cell doesn't have any mines around it, open all of its neighbours.
            *
            * Return the number of cells opened.
            */
    }

    /*
        * Calculate and return the indices of the current cell's neighbours.
        *
        * Returns an array of indices of this cell's neighbours.
        * index = (row * columnCount) + col
        */
    getNeighbours() {
        const neighbours = [];

        for (const deltaRow of [-1, 0, 1]) {
            for (const deltaCol of [-1, 0, 1]) {
                if (deltaRow === 0 & deltaCol === 0) continue;
                
                const newRow = this.row + deltaRow;
                const newCol = this.col + deltaCol;

                if (
                    newRow >= 0 &&
                    newRow < DIFFICULTY.rowCount &&
                    newCol >= 0 &&
                    newCol < DIFFICULTY.columnCount
                ) {
                    const neighbourIndex = (newRow * DIFFICULTY.columnCount) + newCol;
                    neighbours.push(neighbourIndex);
                }
            }
        }

        return neighbours;
    }

}

/*
    * Handle main game logic; open cells, check wins and losses, etc.
    */
class GameLogic {
    constructor() {
        this.openedCellsCount = 0; // game is won when this equals DIFFICULTY.safeCellsCount.
        this.minesPlaced = false;
    }

    clickHandler(event) {
        // Determine if and which cell was clicked.
        if (!event.target.classList.contains("cell")) return;
        const clickedCellObject = BOARD[event.target.dataset.index];

        // Place mines on the first click.
        if (!this.minesPlaced) {
            this.minesPlaced = true;
            placeMines(clickedCellObject);
        }
    }

    /*
        * Open the cell at the given index.
        * End the game if the cell has a mine.
        * If the cell is safe, check if the game has been won.
        * The game is won when all safe cells are opened.
        */
    openCell(index) {
        const cell = BOARD[index];

        // End the game if the cell has a mine.
        if (cell.hasMine) { console.log("Game ended."); }

        // Open safe cell.
        const cellsOpened = cell.openCellAndNeighbours();
        this.openedCellsCount = this.openedCellsCount + cellsOpened;

        // Check if game is won.
        if (this.openedCellsCount == this.safeCellsCount) {
            console.log("Game won.");
        }
    }
}

main();
