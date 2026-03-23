# Future Plan

When a cell is double-clicked, if the number of flagged cells around it equals the number displayed on the cell (indicating the mines around it), open all non-flagged cells around it. If any of these auto-opened cells contains a mine (due to a wrongly flagged cell), end the game.

Implement a solver. Use the solver to solve the board after generation, before serving it to the player. The goal is to ensure the board has no 50/50 situations (no guessing required). If the solver gets stuck, it means a 50/50 situation exists. When that happens, regenerate the board or modify the current one to resolve it.

---
