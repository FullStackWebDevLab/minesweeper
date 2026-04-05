# Board Representation

**Note**: This board representation applies to both the frontend and the backend.

The board is represented as a one dimensional array containing Cell objects. The index of a cell in the array maps to the position of the cell on the grid.
    
```
index = (cell_row * number_of_columns) + cell_column
row = floor(index / number_of_columns)
column = index % number_of_columns
```

---
