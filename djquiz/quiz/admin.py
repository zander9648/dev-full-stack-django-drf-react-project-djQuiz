from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html

from .models import MultipleChoiceQuestion, Quiz, QuizQuestion, TrueFalseQuestion


class QuizQuestionInline(admin.TabularInline):
    model = QuizQuestion.quiz.through
    extra = 0


class BaseQuestionInline(admin.TabularInline):
    extra = 0
    fk_name = "question"


class MultipleChoiceQuestionInline(BaseQuestionInline):
    model = MultipleChoiceQuestion


class TrueFalseQuestionInline(BaseQuestionInline):
    model = TrueFalseQuestion


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    inlines = [QuizQuestionInline]

    def questions_link(self, obj):
        url = reverse("admin:quiz_quizquestion_changelist")
        url += f"?quiz__id__exact={obj.id}"
        return format_html('<a href="{}">View Questions</a>', url)

    questions_link.short_description = "Questions"

    list_display = ["name", "description", "questions_link"]


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    inlines = [MultipleChoiceQuestionInline, TrueFalseQuestionInline]


admin.site.register(MultipleChoiceQuestion)
admin.site.register(TrueFalseQuestion)


# from django import forms
# from django.contrib import admin

# from .models import MultipleChoiceQuestion, Quiz, QuizQuestion, TrueFalseQuestion


# class QuizQuestionInline(admin.TabularInline):
#     model = QuizQuestion.quiz.through
#     extra = 0
#     classes = ["collapse"]
#     show_change_link = True


# class BaseQuestionInline(admin.TabularInline):
#     extra = 0
#     fk_name = "question"


# class MultipleChoiceQuestionInline(BaseQuestionInline):
#     model = MultipleChoiceQuestion


# class TrueFalseQuestionInline(BaseQuestionInline):
#     model = TrueFalseQuestion


# class QuizQuestionAdminForm(forms.ModelForm):
#     new_quiz_name = forms.CharField(max_length=200, required=False)
#     quiz = forms.ModelChoiceField(
#         queryset=Quiz.objects.all(),
#         required=False,
#         widget=forms.Select(attrs={"onchange": "show_new_quiz()"}),
#     )

#     def get_quiz_name(self):
#         quiz_name = self.cleaned_data.get("new_quiz_name")
#         quiz = self.cleaned_data.get("quiz")
#         if quiz_name:
#             return [quiz_name]
#         elif quiz:
#             return [quiz.name]
#         else:
#             return []

#     class Meta:
#         model = QuizQuestion
#         fields = "__all__"

#     def clean(self):
#         cleaned_data = super().clean()
#         quiz = cleaned_data.get("quiz")
#         new_quiz_name = cleaned_data.get("new_quiz_name")

#         if not quiz and not new_quiz_name:
#             raise forms.ValidationError("Please select an existing quiz or enter a new quiz name")

#         if quiz and new_quiz_name:
#             raise forms.ValidationError("Please select either an existing quiz or enter a new quiz name, not both")

#         return cleaned_data


# @admin.register(QuizQuestion)
# class QuizQuestionAdmin(admin.ModelAdmin):
#     form = QuizQuestionAdminForm
#     inlines = [MultipleChoiceQuestionInline, TrueFalseQuestionInline, QuizQuestionInline]

#     def get_formsets_with_inlines(self, request, obj=None):
#         for inline in self.get_inline_instances(request, obj):
#             yield inline.get_formset(request, obj), inline


# @admin.register(MultipleChoiceQuestion)
# class MultipleChoiceQuestionAdmin(admin.ModelAdmin):
#     pass


# @admin.register(TrueFalseQuestion)
# class TrueFalseQuestionAdmin(admin.ModelAdmin):
#     pass


# admin.site.register(Quiz)
