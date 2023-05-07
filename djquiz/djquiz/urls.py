from django.contrib import admin
from django.urls import include, path
from quiz.views import QuizViewSet
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r"quizzes", QuizViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include(router.urls)),
]
