"""
Generate a minesweeper board, use a solver to detect 50/50 situations,
modify the board to eliminate all 50/50 situations, then return
a list of integer indices of cells containing mines. Example:
    [0, 8, 12, ...]

The index, row, and column of a cell are calculated as follows:
    index = (cell_row * number_of_columns) + cell_column
    row = floor(index / number_of_columns)
    column = index % number_of_columns
"""

from random import randint

def main(difficulty: str, clicked_cell_index: int) -> dict:
    """
    The main function. Import and call only this function.

    Parameters:
        difficulty: The difficulty of the generated board.
            Can be one of: beginner, intermediate, and expert.
            The difficulty determines the size of the board,
            and the number of mines on the board.
        clicked_cell_index: An integer index of the cell that
            was clicked first. This is used to determine which
            cells can have mines and which must be safe. The
            clicked cell and all its neighbours are guaranteed
            to be safe.

    Returns a list of integer indices of cells containing mines.
    """
    # Define row, col, and mine_count based on difficulty.
    difficulty_dict = {
        "beginner": { "row": 8, "col": 8, "mine_count": 10 },
        "intermediate": { "row": 16, "col": 16, "mine_count": 40 },
        "expert": { "row": 16, "col": 30, "mine_count": 99 },
    }
    row = difficulty_dict[difficulty]["row"]
    col = difficulty_dict[difficulty]["col"]
    mine_count = difficulty_dict[difficulty]["mine_count"]

def place_mines(cell_count: int, mine_count: int, excluded_cells: list[int]) -> list:
    """
    Shuffle the cells using Fisher-Yates shuffling algorithm, and then
    place the mines in the first n number of cells, where n is the number
    of mines based on the difficulty.

    Parameters:
        cell_count: An integer representing the number of cells on the board.
        mine_count: An integer of the number of mines to be placed.
        excluded_cells: An array of integer indices of cells that should not
            contain mines.

    Return a list of indices of cells that contain mines.
    """
    valid_cells = [
        index
        for index in range(cell_count)
        if index not in excluded_cells
    ]

    # Shuffle using fisher-yates shuffling algorithm.
    # 1. Start at the last element of the list.
    # 2. Generate a random integer `j` such that `0 ≤ j ≤ i`, where `i` is the current index.
    # 3. Swap the element at index `i` with the element at index `j`.
    # 4. Repeat the process for index `i-1`, continuing until you reach the beginning of the list.
    index = len(valid_cells) - 1
    while index > 0:
        random_index = randint(0, index)
        valid_cells[random_index], valid_cells[index] = valid_cells[index], valid_cells[random_index]
        index--

    # Get and return indices of cells with mines.
    mines = valid_cells[0:mine_count]
    return mines

