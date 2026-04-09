// HTML Elements
const boardElement = document.querySelector(".board");
const remainingFlagsElement = document.getElementById("remainingFlagsLabel");

function main() {
    // Init the board.
    globalThis.BOARD = [];

    const searchParams = new URLSearchParams(window.location.search);
    globalThis.DIFFICULTY = new Difficulty(searchParams.get("difficulty"));

    init();
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
    constructor(index) {
        this.index = index;

        this.state = "closed"; // "opened" or "closed"

        // Create cell HTML element.
        this.element = document.createElement("div");
        this.element.classList.add("cell", this.state);
        this.element.dataset.index = this.index;
    }

    openCellAndNeighbours() {
        /*
            * Open the current cell and display the number of mines around it.
            * If the cell doesn't have any mines around it, open all of its neighbours.
            *
            * Return the number of cells opened.
            */
    }
}

/*
    * Handle main game logic; open cells, check wins and losses, etc.
    */
class GameLogic {
    constructor() {
        this.openedCellsCount = 0; // game is won when this equals DIFFICULTY.safeCellsCount.
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
