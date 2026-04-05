# Cross-Origin Resource Sharing (CORS)

The frontend and the backend will be separated. They will use 2 different servers. This means there will be 2 different origins. Due to the browser enforced Same-Origin Policy (SOP), communication between different origins (frontend calling the REST API in the backend) is restricted by default.

To work around this, CORS is enabled in the backend using `django-cors-headers`. It currently allows all origins to access it (as of 2026-03-27). In development, use django's server to host the backend (`python manage.py runserver`), and use python's http server to host the frontend (`python -m http.server`).

Django's server will serve on `127.0.0.1:8000`. This is the default for python's http server too. To prevent them from clashing, run the frontend server on port 8080 (`python -m http.server 8080`).

---
