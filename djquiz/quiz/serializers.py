from rest_framework import serializers

from .models import MultipleChoiceQuestion, Quiz, QuizQuestion, QuizQuestionQuiz, TrueFalseQuestion

FIELD_MAPPING = {
    "mc": "mc_question",
    "tf": "tf_question",
}


class MultipleChoiceQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MultipleChoiceQuestion
        fields = ("id", "answers")


class TrueFalseQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrueFalseQuestion
        fields = ("id", "true_answer", "false_answer")


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ("id", "question_type", "text", "explanation")

    def get_question_fields(self, obj):
        question_type = obj.question_type
        if question_type == "mc":
            return MultipleChoiceQuestionSerializer(obj.mc_question, many=True).data
        elif question_type == "tf":
            return TrueFalseQuestionSerializer(obj.tf_question, many=True).data
        # add more question types as needed
        return None

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        question_fields = self.get_question_fields(instance)
        if question_fields is not None:
            for i, field in enumerate(question_fields):
                for key, value in field.items():
                    representation[f"{key}_{i+1}"] = value
        return representation


class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(source="quizquestion_set", many=True)

    class Meta:
        model = Quiz
        fields = ("id", "name", "description", "created_at", "updated_at", "created_by", "questions")


# from rest_framework import serializers

# from .models import MultipleChoiceQuestion, Quiz, QuizQuestion, TrueFalseQuestion


# class MultipleChoiceQuestionSerializer(serializers.ModelSerializer):
#     answers = serializers.SerializerMethodField()

#     class Meta:
#         model = MultipleChoiceQuestion
#         fields = ["answers"]

#     def get_answers(self, obj):
#         return [{"text": option["text"], "is_correct": option["is_correct"]} for option in obj.answers["options"]]


# class TrueFalseQuestionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TrueFalseQuestion
#         fields = ["true_answer", "false_answer"]


# class QuizQuestionSerializer(serializers.ModelSerializer):
#     mc_question = serializers.SerializerMethodField()
#     tf_question = serializers.SerializerMethodField()
#     root_question = serializers.IntegerField(source="question.id", read_only=True)  # Add this line

#     class Meta:
#         model = QuizQuestion
#         fields = ["root_question", "id", "question_type", "text", "explanation", "mc_question", "tf_question"]

#     def get_mc_question(self, obj):
#         mc_question = obj.mc_question.first()
#         if mc_question:
#             return MultipleChoiceQuestionSerializer(mc_question).data
#         return None

#     def get_tf_question(self, obj):
#         tf_question = obj.tf_question.first()
#         if tf_question:
#             return TrueFalseQuestionSerializer(tf_question).data
#         return None


# class QuizSerializer(serializers.ModelSerializer):
#     questions = QuizQuestionSerializer(many=True)

#     class Meta:
#         model = Quiz
#         fields = ["id", "name", "description", "created_at", "updated_at", "created_by", "questions"]

#     def get_questions(self, obj):
#         mc_questions = obj.quizquestion_set.filter(question_type="mc").prefetch_related("mc_question")
#         tf_questions = obj.quizquestion_set.filter(question_type="tf").prefetch_related("tf_question")
#         questions = []
#         for q in mc_questions:
#             question_data = MultipleChoiceQuestionSerializer(q.mc_question.first()).data
#             question_data["question_type"] = "mc"
#             question_data["question_text"] = q.text
#             question_data["question_explanation"] = q.explanation
#             questions.append(question_data)
#         for q in tf_questions:
#             question_data = TrueFalseQuestionSerializer(q.tf_question.first()).data
#             question_data["question_type"] = "tf"
#             question_data["question_text"] = q.text
#             question_data["question_explanation"] = q.explanation
#             questions.append(question_data)
#         return questions
