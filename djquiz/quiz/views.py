from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Quiz, QuizQuestion
from .serializers import QuizQuestionSerializer, QuizSerializer


class QuizViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

    @action(detail=True, methods=["get"])
    def questions(self, request, pk=None):
        quiz = self.get_object()
        questions = QuizQuestion.objects.filter(quiz=quiz).prefetch_related("mc_question", "tf_question")
        serializer = QuizQuestionSerializer(
            questions,
            many=True,
        )  # Add fields and root_question
        return Response(serializer.data)
