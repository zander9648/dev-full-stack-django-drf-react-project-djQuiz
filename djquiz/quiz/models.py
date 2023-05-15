from django.conf import settings
from django.db import models

# User Model
# https://docs.djangoproject.com/en/4.2/topics/auth/customizing/


class Quiz(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    # instant feedback
    # can change answer
    # timer

    def __str__(self):
        return self.name


class QuizQuestion(models.Model):
    QUESTION_TYPES = (
        ("mc", "Multiple Choice"),
        ("tf", "True or False"),
    )

    quiz = models.ManyToManyField(Quiz, through="QuizQuestionQuiz")
    question_type = models.CharField(max_length=2, choices=QUESTION_TYPES)
    text = models.CharField(max_length=255)
    explanation = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.text


class QuizQuestionQuiz(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE)


class MultipleChoiceQuestion(models.Model):
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name="mc_question")
    answer = models.JSONField()

    def __str__(self):
        return self.question.text


class TrueFalseQuestion(models.Model):
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name="tf_question")
    true_answer = models.BooleanField(default=False)
    false_answer = models.BooleanField(default=False)

    def __str__(self):
        return self.question.text
