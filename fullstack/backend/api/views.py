from django.http import HttpResponse

# Create your views here.
def generate_new_board(request):
    return HttpResponse("It works.")
