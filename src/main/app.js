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
        if (!event.target.classList.contains("cell")) return;
        const clickedCellObject = boardArray[event.target.dataset.index];

        // Place mines and count number of mines around each cell on first click.
        if (!minesPlaced) {
            placeMines(clickedCellObject);
            minesPlaced = true;

            for (const cell of boardArray) cell.countMines();
        }

        /*
        For each click:
            + Check if the cell has a mine.
            + If it has a mine, end the game.
            + If it doesn't have a mine, open the cell and display the number of mines around the cell.
            + If the cell doesn't have any mines around it, open all its neighbours.
        */

        // End the game when a cell with a mine is clicked.
        if (clickedCellObject.hasMine) {
        }
        
        clickedCellObject.open();
    });
}

function initBoard() {
    /*
    Create Cell objects for each cell on the board, and draw the board
    by creating 'div' elements for each cell.
    */
    boardElement.style.setProperty("--columns", difficulty.columnCount);

    let cell, cellElement;
    for (let i = 0; i < difficulty.cellCount; i++) {
        cell = new Cell(i);
        boardArray.push(cell);

        cellElement = document.createElement("div");
        cellElement.classList.add("cell", cell.state);
        cellElement.dataset.index = i;
        boardElement.appendChild(cellElement);

        cell.element = cellElement;
    }
}

function placeMines(clickedCellObject) {
    /*
    Place mines across the board.

    Parameters:
        clickedCellObject:
            An instance of the Cell class representing the clicked cell.
    */
    const excludedCellsIndices = [clickedCellObject.index];
    excludedCellsIndices.push(...clickedCellObject.neighbours)

    const validCellsIndices = [];
    for (let i = 0; i < difficulty.cellCount; i++) {
        if (excludedCellsIndices.includes(i)) continue;
        validCellsIndices.push(i);
    }

    /*
    Shuffle validCellsIndices using Fisher-Yates shuffle:
        + Start at the last element of the list.
        + Generate a random integer `j` such that `0 ≤ j ≤ i`, where `i` is the current index.
        + Swap the element at index `i` with the element at index `j`.
        + Repeat the process for index `i-1`, continuing until you reach the beginning of the list.
    */
    for (let i = validCellsIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [validCellsIndices[i], validCellsIndices[j]] = [validCellsIndices[j], validCellsIndices[i]];
    }

    // Place mines.
    for (let i = 0; i < difficulty.mineCount; i++) {
        const cellIndex = validCellsIndices[i];
        boardArray[cellIndex].hasMine = true;
    }
}

// Classes
class Cell {
    state = "closed"; // Can be "opened" or "closed".
    mineCount; // Number of mines around the cell.
    flagged; // Boolean indicating whether the cell is flagged.
    element; // The HTML element representing the cell.
    hasMine; // Boolean indicating whether the cell has a mine.

    constructor(index) {
        this.index = index;

        // Calculate cell's row and column.
        this.row = Math.floor(index / difficulty.columnCount);
        this.col = index % difficulty.columnCount;

        this.neighbours = this.getNeighbours();
    }

    countMines() {
        // Count the number of mines around the cell.
        this.mineCount = 0;
        for (const index of this.neighbours) {
            const neighbourCell = boardArray[index];
            if (neighbourCell.hasMine) this.mineCount++;
        }
    }
    
    getNeighbours() {
        /*
        Calculate the indices of the neighbouring cells.
        index = (row * columnCount) + col
        */
        const neighbours = [];

        for (const deltaRow of [-1, 0, 1]) {
            for (const deltaCol of [-1, 0, 1]) {
                if (deltaRow === 0 & deltaCol === 0) continue;
                
                const newRow = this.row + deltaRow;
                const newCol = this.col + deltaCol;

                if (
                    newRow >= 0 &&
                    newRow < difficulty.rowCount &&
                    newCol >= 0 &&
                    newCol < difficulty.columnCount
                ) {
                    const neighbourIndex = (newRow * difficulty.columnCount) + newCol;
                    neighbours.push(neighbourIndex);
                }
            }
        }

        return neighbours;
    }

    open() {
        /*
        Open the current cell and display the number of mines around it.
        If the cell doesn't have any mines around it, open all of its neighbours.
        */
        if (this.state === "opened") return;

        this.state = "opened";
        this.element.classList.remove("closed");
        this.element.classList.add("opened");
        this.element.innerHTML = this.mineCount;

        // Open neighbouring cells if they don't have mines.
        if (this.mineCount > 0) return;
        for (const neighbourIndex of this.neighbours) {
            const neighbourCellObject = boardArray[neighbourIndex];
            neighbourCellObject.open();
        }
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
        } else if (difficulty === "advanced") {
            this.rowCount = 16;
            this.columnCount = 30;
            this.mineCount = 99;
        } else {
            console.log("Invalid difficulty.");
        }

        this.cellCount = this.rowCount * this.columnCount;
    }
}

main();
