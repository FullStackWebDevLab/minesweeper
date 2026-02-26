/*
# Board Representation

Represent the board as an array. Have a cell object. This object will contain all the information about that cell.
When creating the cells, have a `data-id` html attribute that contains the id of the cell starting from 0. This
id will be the cell's index in the array.

Init board:
    + Create an array with all the Cell objects.

Drawing the board:
    + Iterate over the board array.
    + Draw each cell depending on it's attributes.
        - Opened or closed.
        - Flagged.
        - If opened, the number on the cell (number of mines around the cell).
    + Create all the divs.

    Should I draw the entire board every time or should I update only the modified cell?
    If I update only the modified cell, what about when multiple neighbouring cells are automatically opened because the clicked cell doesn't have any mines around it? How will I know which cells to update? I think I'll take the 8 cells around the clicked cell.

Updating the board:
    + Have a function that updates only the changed cells on the board.
    + This function should take an array of the indices of the target cells.
    + Get the div of the target cell and modify its classList (open or closed), text content, and innerHTML (to add flag svg).

When the user clicks on a cell:
    + Get the index of the cell from `cell.dataset.index`.
    + Get the cell's Cell object from the board array.
    + Check if the cell has a mine. This information will be stored in the cell's Cell object ('hasMine').
    + If the cell has a mine, end the game.
    + If the cell doesn't have a mine, open the cell. Opening a cell involves:
        - Set the state of the corresponding Cell object to "opened".
        - Remove "closed" and add "opened" in the cell's classList.
        - Write the number of mines around the cell on the cell. Write nothing if there are no mines around the cell.
    + If there are no mines around the cell, open all cells around the clicked cell.

When the user right-clicks on a cell:
    + Set a flag on the cell.
    + Decrement flag count.
    + Set the 'isFlagged' attribute of the cell object. This flag will prevent the cell from being automatically opened when the user double clicks on a neighbouring cell.

When the user double clicks on a cell:
    + Open all cells that are not flagged around that cell.
*/
const boardArray = []; // Array representation of the board.
const boardElement = document.querySelector(".board");
let minesPlaced = false;

function main() {
    const searchParams = new URLSearchParams(window.location.search);
    globalThis.difficulty = new Difficulty(searchParams.get("difficulty"));

    initBoard();

    // Detect click events in the cells.
    boardElement.addEventListener("click", (event) => {
        const clickedCell = event.target;
        if (!clickedCell.classList.contains("cell")) return;

        // Place mines on first click.
        if (!minesPlaced) {
            placeMines(clickedCell);
            minesPlaced = true;
        }
    });
}

function initBoard() {
    /*
    Create Cell objects for each cell on the board, and draw the board
    by creating 'div' elements for each cell.
    */
    boardElement.style.setProperty("--columns", difficulty.columnsCount);

    let cell, cellElement;
    for (let i = 0; i < difficulty.cellsCount; i++) {
        cell = new Cell(i);
        boardArray.push(cell);

        cellElement = document.createElement("div");
        cellElement.classList.add("cell", cell.state);
        cellElement.dataset.index = i;
        boardElement.appendChild(cellElement);
    }
}


function placeMines(clickedCell) {
    /*
    Place mines across the board.

    Parameters:
        clickedCell:
            An HTMLElement object of the first cell that was clicked.
    */
    /*
    Get an array of cells that can contain a mine. Don't include the clicked cell and the cells around the clicked cell.
    Shuffle the array.
    Place the mines in the first N items in the array, where N is the number of mines based on difficulty.
    */
    console.log("Placing mines.");
}

// Classes
class Cell {
    state = "closed"; // Can be "opened" or "closed".
    minesCount; // Number of mines around the cell.
    flagged; // Boolean indicating whether the cell is flagged.

    constructur(index) {
        this.index = index;

        // Calculate cell's row and column.
        this.row = Math.floor(index / difficulty.columnsCount);
        this.col = index % difficulty.columnsCount;
    }
    
    getNeighbours() {
        // Calculate the indices of the neighbouring cells.
    }
}

class Difficulty {
    constructor(difficulty) {
        if (difficulty === "beginner") {
            this.rowsCount = 8;
            this.columnsCount = 8;
            this.minesCount = 10;
        } else if (difficulty === "intermediate") {
            this.rowsCount = 16;
            this.columnsCount = 16;
            this.minesCount = 40;
        } else if (difficulty === "advanced") {
            this.rowsCount = 30;
            this.columnsCount = 16;
            this.minesCount = 99;
        } else {
            console.log("Invalid difficulty.");
        }

        this.cellsCount = this.rowsCount * this.columnsCount;
    }
}

main();
