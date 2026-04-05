from django.urls import path
from .views import generate_new_board

urlpatterns = [
    path("new/", generate_new_board),
]
