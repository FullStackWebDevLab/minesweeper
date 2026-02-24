const board = document.querySelector(".board");
const searchParams = new URLSearchParams(window.location.search);
const difficulty = searchParams.get("difficulty");
const cellsCountByDifficulty = {
    "beginner": 64,
    "intermediate": 256,
    "advanced": 512
}
const columnsCountByDifficulty = {
    "beginner": 8,
    "intermediate": 16,
    "advanced": 32
}

function drawBoard() {
    const cellsCount = cellsCountByDifficulty[difficulty];
    for (let i = 0; i < cellsCount; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        board.appendChild(cell);
    }
    
    board.style.setProperty("--columns", columnsCountByDifficulty[difficulty]);
}

drawBoard();
