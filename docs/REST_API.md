# REST API

## `/new?difficulty=<difficulty>`

Generate and return a new board.

```jsonc
{
    "rows": 0, // Integer number of rows on the board.
    "cols": 0, // Integer number of columns on the board.
    "mines": [] // Integer indices of cells with mines.
}
```

Difficulty can be one of: "beginner", "intermediate", "expert".

---
