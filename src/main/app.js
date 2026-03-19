/*
# Board Representation

Represent the board as an array. Have a cell object. This object will contain all the information about that cell.
When creating the cells, have a `data-id` html attribute that contains the id of the cell starting from 0. This
id will be the cell's index in the array.

# New Board Representation

Represent the board as an array of Cell objects. A Cell object will contain all the information about a cell, and
will also have functions for interacting with the cell (e.g. getting the neighbours, opening and flagging the cell, etc).
The position/index of the Cell objects in the array should match the position of the cell on the grid. The topleft cell
should be at index 0 and the bottomright cell should be the last element in the Array.

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
const board = []; // Array representation of the board.
const boardElement = document.querySelector(".board");
let minesPlaced = false;
let openedCellsCount = 0;
let timerId;
let seconds = 0;
const timePassedElement = document.getElementById("timePassed");
const remainingFlagsElement = document.querySelector(".remaining-flags");
const winModal = document.getElementById("winModal");
const lostModal = document.getElementById("lostModal");
const timeTakenToWinElement = document.getElementById("timeTaken");
const playAgainButtons = document.querySelectorAll(".play-again-button");
const changeDifficultyButtons = document.querySelectorAll(".change-difficulty");
let remainingFlagsCount;

// Make the game play itself when space is pressed for quick testing.
window.addEventListener("keydown", (event) => {
    if (event.key === " ") {
        for (const cell of board) {
            if (!cell.hasMine) cell.openCellAndNeighbours();
        }

        // Check if the game is won.
        if (openedCellsCount === difficulty.safeCellsCount) {
            clearInterval(timerId);
            showWinModal();
        }
    }
});

function main() {
    const searchParams = new URLSearchParams(window.location.search);
    globalThis.difficulty = new Difficulty(searchParams.get("difficulty"));

    // Display remaining flags count.
    remainingFlagsElement.innerHTML = difficulty.mineCount.toString().padStart(2, "0");

    // Initiate the board.
    boardElement.style.setProperty("--columns", difficulty.columnCount);
    for (let i = 0; i < difficulty.cellCount; i++) {
        let cell = new Cell(i);
        board.push(cell);
    }

    // Detect when a cell is left-clicked.
    boardElement.addEventListener("click", (event) => {
        if (!event.target.classList.contains("cell")) return;
        const clickedCellObject = board[event.target.dataset.index];

        /*
        Start timer, place mines, and count number of mines around each cell
        on first click.
        */
        if (!minesPlaced) {
            startTimer();
            placeMines(clickedCellObject);
            minesPlaced = true;

            for (const cell of board) cell.countMines();

        }

        // End the game when a cell with a mine is clicked.
        if (clickedCellObject.hasMine) {
            endGame();
        }
        
        clickedCellObject.openCellAndNeighbours();
        solve();

        // Check if the game is won.
        if (openedCellsCount === difficulty.safeCellsCount) {
            clearInterval(timerId);
            showWinModal();
        }
    });

    // Detect when a cell is right-clicked.
    boardElement.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        const clickedCell = event.target.closest(".cell");
        if (!clickedCell) return;
        const clickedCellObject = board[clickedCell.dataset.index];

        clickedCellObject.toggleFlag();
        clickedCellObject.flagged ? decrementDisplayedRemainingFlagsCount() : incrementDisplayedRemainingFlagsCount();
    });

    
    for (const playAgainButton of playAgainButtons) playAgainButton.addEventListener("click", () => { window.location.reload() ; });
    for (const changeDifficultyButton of changeDifficultyButtons) changeDifficultyButton.addEventListener("click", () => { window.location.href = "../select_difficulty/index.html"; });
}

function decrementDisplayedRemainingFlagsCount() {
    remainingFlagsCount--;
    remainingFlagsElement.innerHTML = remainingFlagsCount.toString().padStart(2, "0");
}

function endGame() {
    // Display the location of all the mines.
    for (cell of board) cell.hasMine ? cell.showMine() : {} ;
    clearInterval(timerId);
    lostModal.classList.remove("hidden");
}

function incrementDisplayedRemainingFlagsCount() {
    remainingFlagsCount++;
    remainingFlagsElement.innerHTML = remainingFlagsCount.toString().padStart(2, "0");
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
        board[cellIndex].hasMine = true;
    }
}

function showWinModal() {
    winModal.classList.remove("hidden");
    timeTakenToWinElement.innerHTML = seconds;
}

function startTimer() {
    timerId = setInterval(() => {
        if (seconds === 999) return;
        seconds++;
        timePassedElement.innerHTML = seconds.toString().padStart(3, "0");
    }, 1000);
}

// Solver
function solve() {
    let constraints;
    /*
    let loopCondition = true;
    while (loopCondition) {
        constraints = buildConstraints();
        loopCondition = simplifyConstraints(constraints);
    }
    */

    constraints = buildConstraints();

    const components = findConnectedComponents(constraints);
    const solutions = enumerateAllComponents(components, constraints);
    applySolutions(solutions);
    //findFiftyFiftyPairs(solutions, components);
}

/**
    * Builds and returns a list of constraints from the current board state.
    *
    * A constraint object has this shape:
    *   {
    *     variables: Set of cell indices,  // the unknown covered cells
    *     mineCount: number,               // how many must be mines
    *   }
    *
    * Flagged cells are treated as confirmed mines and subtracted from the count
    * before the constraint is stored.
    */
function buildConstraints() {
    const constraints = [];

    // Build constraints for valid cells (opened with at least one mine around it).
    for (const cell of board) {
        if (cell.state === "closed" || cell.mineCount === 0) continue;

        const closedNeighbours = new Set();
        let remainingMines = cell.mineCount;

        for (const neighbourIndex of cell.neighbours) {
            const neighbour = board[neighbourIndex];

            // Don't include flagged and opened neighbours in 'closedNeighbours'.
            if (neighbour.state === "opened") continue;
            if (neighbour.flagged) { remainingMines--; continue; }

            closedNeighbours.add(neighbourIndex);
        }

        // Only add the constraint if there are still unknown variables.
        if (closedNeighbours.size > 0 && remainingMines >= 0) {
            const constraint =  {
                variables: closedNeighbours,
                mineCount: remainingMines
            };
            constraints.push(constraint);
        }
    }

    // Build a constraint for the entire board.
    let totalRemainingMines = difficulty.mineCount;
    const allVariables = new Set();
    for (cell of board) {
        if (cell.state === "opened") continue;
        if (cell.flagged) { totalRemainingMines--; continue; }

        allVariables.add(cell.index);
    }

    if (allVariables.size > 0 && totalRemainingMines >= 0) {
        const constraint = { variables: allVariables, mineCount: totalRemainingMines };
        // Skip this for now. This is to make sure that components only include frontier variables.
        // constraints.push(constraint);
    }

    return constraints;
}

/**
    * Applies two deterministic rules repeatedly until no progress is made.
    *
    * ALL-MINE RULE:
    *   If a constraint has N variables and mineCount === N,
    *   then every variable in that constraint must be a mine.
    *
    * ALL-SAFE RULE:
    *   If a constraint has mineCount === 0,
    *   then every variable in that constraint must be safe.
    *   
    *   For every safe cell that is opened, a new constraint for that cell is calculated
    *   and added to the list of constraints.
    *
    * The passed in array of constraints (`constraints`) will be modified in-place.
    * When this function returns, `constraints` will contain only constraints with
    * unresolved variables. Those constraints whose variables were resolved by the
    * function will be removed.
    *
    * Returns a boolean indicating whether any cells were opened. True if atleast one
    * new cell was opened, false otherwise.
    */
function simplifyConstraints(constraints) {
    let cellOpened = false;
    let changed = true;
    while (changed) {
        changed = false;
        // const newConstraints = [];

        for (const constraint of constraints) {
            // Edit constraints modified by working on other constraints.
            for (const index of structuredClone(constraint.variables)) {
                const cell = board[index];

                if (cell.state === "opened") {
                    // Remove cells confirmed as safe from 'variables'.
                    constraint.variables.delete(index);
                    changed = true;
                } else if (cell.flagged) {
                    // Remove flagged cells and decrement mineCount.
                    constraint.variables.delete(index);
                    constraint.mineCount--;
                    changed = true;
                }
            }

            // ALL-MINE RULE: remaining unknowns == remaining mines needed.
            if (constraint.variables.size === constraint.mineCount) {
                for (const index of structuredClone(constraint.variables)) {
                    const cell = board[index];
                    cell.toggleFlag();
                    changed = true;
                }
            }

            // ALL-SAFE RULE: no mines left to place among remaining unknowns.
            if (constraint.mineCount === 0) {
                for (const index of structuredClone(constraint.variables)) {
                    const cell = board[index];
                    cell.openCellAndNeighbours();
                    changed = true;
                    cellOpened = true;
                }
            }
        }
    }

    // Eliminate constraints with resolved variables.
    for (let i = 0; i < constraints.length; i++) {
        const constraint = constraints[i];

        if (!(constraint.variables.size > 0 && constraint.mineCount > 0 )) {
            constraints.splice(i, 1);
        }
    }

    return cellOpened;
}

/**
    * Groups frontier variables into connected components.
    *
    * Two variables are connected if they share at least one constraint.
    *
    * Returns an array of components. Each component is a set of indices.
    * The indices map to cells in `board`.
    */
function findConnectedComponents(constraints) {
    const adjacencyMap = {}; // index: Set(indices)

    for (const constraint of constraints) {
        for (const variable of constraint.variables) {
            if (!Object.hasOwn(adjacencyMap, variable)) adjacencyMap[variable] = new Set();

            for (const variable2 of constraint.variables) {
                if (variable === variable2) continue;
                adjacencyMap[variable].add(variable2);
            }
        }
    }

    // Use BFS to find connected components.
    const visited = new Set();
    const components = [];

    Object.keys(adjacencyMap).forEach((key) => {
        // BFS with cellIndex as the starting node.
        cellIndex = Number(key);
        if (visited.has(cellIndex)) return;

        const component = new Set();
        const queue = [cellIndex];

        while (queue.length > 0) {
            const current = queue.shift();

            if (visited.has(current)) continue;
            visited.add(current);
            component.add(current);

            for (const neighbourIndex of adjacencyMap[current]) {
                if (visited.has(neighbourIndex)) continue;
                queue.push(neighbourIndex);
            }
        }

        components.push(component);
    });

    return components;
}

/*
    * The variable 'components' is an array of sets. Each set contains indices of
    * variables that are connected. Each set is a component.
    *
    * Loop through `components` and enumerate each component.
    * For each component, loop through it's variables.
    * Starting from the first variable, assign it a value, 0 (safe) or 1 (mine).
    * Check if any constraint involving the assigned variable is violated.
    * A constraint is violated if:
    *   The number of mines assigned exceed the number of mines that should exist
    *   (this means the cell is flagged incorrectly, and should be opened instead).
    *   The number of closed, unflagged variables is less than the number of mines
    *   that should exist (this means the cell is opened and should be flagged).
    * If a constraint is violated, for example when 0 was assigned, remove the 0 and
    * assign 1 instead. Then check if any constraint is violated.
    * If no constraint is violated, move on to the next variable in the component.
    * If a constraint is violated in both assignments (0 and 1), go back to the previous
    * variable (backtrack), and change it's assignment.
    *
    * Every time a variable is assigned, check all constraints involving the assigned
    * variable. If both assignments violate constraints, backtrack.
    *
    * # Store Valid Assignments -------------------------------------------------------
    *
    * When an assignment doesn't violate a constraint, store that assignment.
    * Store the assignment in an array. The array will contain objects. Each object will
    * have the index of the cell as the key, and the assignemnt (0 or 1) as the value.
    *
    * # Detecting Multiple Solutions ---------------------------------------------------
    *
    * What if both assignments (0 or 1) don't violate any constraints (50/50 situation)?
    * To handle this situation, after looping through every element of the component,
    * backtrack and change the assignment of the variable, is the assignment violates a
    * constraint, backtrack. Keep backtracking until you find a variable which doesn't
    * violate any constraint even after changing it's assignment. Store both assignments.
    * It is important to store both assignments to be able to detect 50/50 situations later.
    *
    * After storing the assignment, continue to the next variable in the component until
    * you reach the end again. Then start backtracking. You'll get to this first variable
    * where changing the assignment doesn't violate any constraints, skip it and keep
    * backtracking. You may find another variable that can have both assignments. If this
    * happens, store the assignment and keep going forward until you reach the end, then
    * start backtracking again.
    *
    * Do this until you reach to the beginning of the array/set, then stop and return
    * the array of solutions.
    *
    * # Tracking Assignments -------------------------------------------------------------
    *
    * How will I keep track of what I've already assigned to which variable? If I don't
    * keep track, I can assign say 0 to a certain variable, check if it violates any constraints,
    * find out it does violate constraints, then switch the assignment to 1, then find out it
    * still violates assignments. How will I know to not assign 0 and instead backtrack to the
    * previous variable?
    *
    * I can start by always assigning 0 first, then 1 after. Only assign 1 if 0 violates
    * constraints. If you assign 1 and it violates constraints, it will mean that both 0 and 1
    * have violated constraints, and therefore, we should backtrack instead of assigning 0.
    *
    * # Component Set Order -----------------------------------------------------------------
    *
    * I think the order of the components in the set matters. The order in which the variables
    * are looped through matters. The variable in the next iteration should be directly linked
    * to the variable in the current iteration by at least one constraint. The assignment of
    * the current variable should immediately affect the variable in the next iteration.
    *
    * I am not sure but I think the component set is already in the correct order. We'll see.
    */

/*
    * Find valid solutions for variables in the given components.
    *
    * Parameters:
    *   `components`: An array of components. A component contains connected cells.
    *   `constraints`: An array of all constraints.
    *
    * Returns an array of variable assignments that didn't violate any constraints.
    *   [ {variable: assignment}, ... ]
    */
function enumerateAllComponents(components, constraints) {
    const solutions = [];

    for (let component of components) {
        component = [...component];
        enumerateComponent(component, constraints, solutions);
    }

    return solutions;
}

/*
    * Recursively enumerate the given component.
    *
    * Parameters:
    *   `component`: An array of connected variables.
    *   `constraints`: An array of all constraints.
    *   `solutions`: An array that will contain variable assignments that
    *       don't violate constraints. Data already existing in the array
    *       will be preserved.
    *
    * Returns a list of all solutions that don't violate constraints:
    *   [ { variable: assignment }, ... ]
    */
function enumerateComponent(component, constraints, solutions) {
    const assignments = {};

    /*
        * Recursive backtracking function.
        *
        * Parameters:
        *   `index`: The current index in the component array.
        */
    function backtrack(index) {
        // End of array. Solution found.
        if (index === component.length) return true;

        const variable = component[index];
        const variableConstraints = getVariableConstraints(variable, constraints);

        for (const assignment of [0, 1]) {
            if (!isConsistent(assignment, assignments, variableConstraints)) continue;

            assignments[variable] = assignment;
            // solutions.push({ [variable]: assignment });

            if (backtrack(index + 1)) return true; // Solution found.
        }

        return false; // Both 0 and 1 violate constraints.
    }

    if (backtrack(0)) {
        solutions.push(assignments);
    } else {
        console.log("Component solution not found.");
    }
}

/*
    * Return an array of constraints involving the cell with the
    * given index.
    */
function getVariableConstraints(cellIndex, constraints) {
    const variableConstraints = [];
    for (const constraint of constraints) {
        if (!constraint.variables.has(cellIndex)) continue;
        variableConstraints.push(constraint);
    }

    return variableConstraints;
}

/*
    * Check if an assignment to a variable violates any constraints.
    *
    * Parameters:
    *   `assignment`: Assignment to the variable in question (0 or 1).
    *   `assignments`: Assignments that have already been made to other
    *   variables in the same component.
    *       { variable1: assignment, variable2: assignment, ... }
    *   `variableConstraints`: An array of constraints involving the
    *   assigned variable.
    *
    * Return true if the assignment doesn't violate any constraint.
    * Return false if the assignment violates any constraint.
    */
function isConsistent(assignment, assignments, variableConstraints) {
    const updatedVariableConstraints = structuredClone(variableConstraints);

    let constraintIndex = 0;
    while (constraintIndex < variableConstraints.length){
        const constraint = variableConstraints[constraintIndex];
        
        for (const variable of constraint.variables) {
            // Skip unassigned variables.
            if (!Object.keys(assignments).includes(variable.toString())) continue;

            const variableAssignment = assignments[variable];
            if (variableAssignment === 0) {
                // Remove variable from `variables` set.
                updatedVariableConstraints[constraintIndex].variables.delete(variable);
            } else if (variableAssignment === 1) {
                // Remove variable from `variables` set and decrement `mineCount`.
                updatedVariableConstraints[constraintIndex].variables.delete(variable);
                updatedVariableConstraints[constraintIndex].mineCount--;
            }
        }

        constraintIndex++;
    }

    // Loop through the updated constraints and check if the new assignment violates any of them.
    for (const constraint of updatedVariableConstraints) {
        if (assignment === 0) {
            // Constraint is violated if the number of remaining variables
            // is less than the required mine count.
            const remainingVariablesCount = constraint.variables.size - 1;
            if (remainingVariablesCount < constraint.mineCount) return false;
        } else if (assignment === 1) {
            // Constraint is violated if `variableConstraint.mineCount` === 0.
            if (constraint.mineCount === 0) return false;
        }
    }

    return true;
}

/*
    * Detect fifty-fifty pairs.
    *
    * Fifty-fifty pairs are detected by calculating their mine probability:
    *   mineProbability = (number of solutions with 1 assigned to the variable) / (total number of solutions for the variable)
    *
    * If mineProbability is 1, the variable is definitely a mine, if 0, the
    * variable is safe, if between 0 and 1, the variable is unknown. It may be a fifty-fifty variable.
    */
function findFiftyFiftyPairs(solutions, components) {
    const mineProbabilities = {}; // Will contain mine probabilities for each variable.

    /*
        * Arrange solutions. Place all solutions for a given variable in an array.
        * Store the array as the value, and the variable as the key. This will
        * make it easier to get solutions and count the number of solutions for
        * each variable.
        */
    newSolutions = {};
    for (const solution of solutions) {
        for (let key of Object.keys(solution)) {
            key = Number(key);
            if (!Object.hasOwn(newSolutions, key)) newSolutions[key] = [];
            
            newSolutions[key].push(solution[key]);
        }
    }

    for (const component of components) {
        for (const variable of component) {
            const solutionsCount = newSolutions[variable].length;
            const oneCount = newSolutions[variable].filter(item => item === 1).length;
            const mineProbability = oneCount / solutionsCount;
            mineProbabilities[variable] = mineProbability;
        }
    }
    console.log(mineProbabilities);
}

/*
    * Apply known solutions.
    */
function applySolutions(solutions) {
    console.log("Applying solutions.");
    console.log(solutions);
    for (const solution of solutions) {
        for (let cellIndex in solution) {
            cellIndex = Number(cellIndex);
            const value = solution[cellIndex];
            console.log(value);
            const cell = board[cellIndex];

            if (value === 0) {
                cell.openCellAndNeighbours();
            } else if (value === 1) {
                cell.toggleFlag();
            }
        }
    }
}

// Classes
class Cell {
    state = "closed"; // Can be "opened" or "closed".
    mineCount; // Number of mines around the cell.
    flagged = false; // Boolean indicating whether the cell is flagged.
    element; // The HTML element representing the cell.
    hasMine; // Boolean indicating whether the cell has a mine.

    constructor(index) {
        this.index = index;

        // Create cell HTML element.
        this.element = document.createElement("div");
        this.element.classList.add("cell", this.state);
        this.element.dataset.index = this.index;
        boardElement.appendChild(this.element);

        // Calculate cell's row and column.
        this.row = Math.floor(index / difficulty.columnCount);
        this.col = index % difficulty.columnCount;

        this.neighbours = this.getNeighbours();
    }

    countMines() {
        // Count the number of mines around the cell.
        this.mineCount = 0;
        for (const index of this.neighbours) {
            const neighbourCell = board[index];
            if (neighbourCell.hasMine) this.mineCount++;
        }
    }

    toggleFlag() {
        if (this.state === "opened") return;

        if (this.flagged) {
            this.flagged = false;
            this.element.classList.remove("flagged");
            this.element.innerHTML = "";
        } else {
            this.flagged = true;
            this.element.classList.add("flagged");
            this.element.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flag-triangle-left-icon lucide-flag-triangle-left"><path d="M18 22V2.8a.8.8 0 0 0-1.17-.71L5.45 7.78a.8.8 0 0 0 0 1.44L18 15.5"/></svg>'
        }
        
        return this.flagged;
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

    openCellAndNeighbours() {
        /*
        Open the current cell and display the number of mines around it.
        If the cell doesn't have any mines around it, open all of its neighbours.
        */
        if (this.state === "opened") return;

        this.state = "opened"; openedCellsCount++;
        this.element.classList.remove("closed");
        this.element.classList.add("opened");
        this.element.innerHTML = this.mineCount;

        // Open neighbouring cells if they don't have mines.
        if (this.mineCount > 0) return;
        this.element.innerHTML = "";
        for (const neighbourIndex of this.neighbours) {
            const neighbourCellObject = board[neighbourIndex];
            neighbourCellObject.openCellAndNeighbours();
        }
    }

    showMine() {
        // Open the cell and display a mine on it.
        this.state = "opened";
        this.element.classList.remove("closed");
        this.element.classList.add("opened", "mine");
        this.element.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bomb-icon lucide-bomb"><circle cx="11" cy="13" r="9"/><path d="M14.35 4.65 16.3 2.7a2.41 2.41 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4l-1.95 1.95"/><path d="m22 2-1.5 1.5"/></svg>'
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
        this.safeCellsCount = this.cellCount - this.mineCount;
    }
}

main();
