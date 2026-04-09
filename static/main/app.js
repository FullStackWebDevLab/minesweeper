// HTML Elements
const boardElement = document.querySelector(".board");
const timePassedElement = document.getElementById("timePassed");
const remainingFlagsElement = document.getElementById("remainingFlagsLabel");

function main() {
    const gameLogic = new GameLogic();

    // Init the board.
    globalThis.BOARD = [];

    const searchParams = new URLSearchParams(window.location.search);
    globalThis.DIFFICULTY = new Difficulty(searchParams.get("difficulty"));

    init();

    // Handle events.
    boardElement.addEventListener("click", (event) => gameLogic.clickHandler(event));
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
    // this.hasMine (Boolean) indicates whether the cell has a mine or not.
    // this.mineCount (Number) stores the number of mines around the cell.
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

    /*
        * Open the current cell and display the number of mines around it.
        * If the cell doesn't have any mines around it, open all of its neighbours.
        *
        * Return the number of cells opened.
        */
    openCellAndNeighbours() {
        let openedCellsCount = 0;
        if (this.state === "opened") return openedCellsCount;

        this.state = "opened"; openedCellsCount++;
        this.element.classList.remove("closed");
        this.element.classList.add("opened");
        this.element.innerHTML = this.mineCount;

        // Open neighbouring cells if they don't have mines.
        if (this.mineCount > 0) return openedCellsCount;
        this.element.innerHTML = "";
        for (const neighbourIndex of this.neighbours) {
            const neighbourCellObject = BOARD[neighbourIndex];
            const neighbourOpenCellsCount = neighbourCellObject.openCellAndNeighbours();
            openedCellsCount = openedCellsCount + neighbourOpenCellsCount;
        }

        return openedCellsCount;
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

    countMines() {
        // Count the number of mines around the cell.
        if (this.hasMine) return;

        this.mineCount = 0;
        for (const index of this.neighbours) {
            const neighbourCell = BOARD[index];
            if (neighbourCell.hasMine) this.mineCount++;
        }
    }
}

/*
    * Handle main game logic; open cells, check wins and losses, etc.
    */
class GameLogic {
    constructor() {
        this.openedCellsCount = 0; // game is won when this equals DIFFICULTY.safeCellsCount.
        this.minesPlaced = false;

        this.secondsPassed = 0;
        // this.timerIntervalId stores the Interval ID of the timer.
    }

    // Runs when a cell is clicked to open.
    clickHandler(event) {
        // Determine if and which cell was clicked.
        if (!event.target.classList.contains("cell")) return;
        const clickedCellObject = BOARD[event.target.dataset.index];

        /*
            * Start timer, place mines, and count number of mines around safe cells
            * on first click.
            */
        if (!this.minesPlaced) {
            this.timerIntervalId = setInterval(() => {
                if (this.secondsPassed === 999) return;
                this.secondsPassed++;
                timePassedElement.innerHTML = this.secondsPassed.toString().padStart(3, "0");
            }, 1000);

            // Place mines.
            placeMines(clickedCellObject);
            this.minesPlaced = true;

            // Count the number of mines around the cells.
            for (const cell of BOARD) cell.countMines();
        }

        // End the game if the cell has a mine.
        if (clickedCellObject.hasMine) {
            console.log("Game ended.");
        }

        // Open the cell.
        const cellsOpened = clickedCellObject.openCellAndNeighbours();
        this.openedCellsCount = this.openedCellsCount + cellsOpened;

        // Check if the game has been won.
        console.log(`Opened cells count: ${this.openedCellsCount}  Safe cells count: ${DIFFICULTY.safeCellsCount}`);
        if (this.openedCellsCount == DIFFICULTY.safeCellsCount) {
            console.log("Game won.");
        }
    }

    /*
        * Open the given cell.
        * End the game if the cell has a mine.
        * If the cell is safe, check if the game has been won.
        * The game is won when all safe cells are opened.
        *
        * Parameters:
        *   `cell`: An instance of the Cell class representing the clicked cell.
        */
    openCell(cell) {
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
