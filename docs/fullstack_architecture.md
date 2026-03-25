# Fullstack Architecture

The frontend and the backend will be separated.

```
minesweeper/
    backend/
        # Django project will all the backend code.

    frontend/
        # All frontend files.
```

The backend will be a REST API. It will only serve API responses, not HTML pages.

When testing, or in deployment, the 2 will run on 2 different servers. In development, for example, the frontend can run on `https://localhost:3000` while the backend runs on `https://localhost:8000`.

---
