# Generated by Django 4.2.1 on 2023-05-08 21:12

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("quiz", "0003_rename_answers_multiplechoicequestion_answer"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="truefalsequestion",
            name="answer",
        ),
        migrations.AddField(
            model_name="truefalsequestion",
            name="false_answer",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="truefalsequestion",
            name="true_answer",
            field=models.BooleanField(default=False),
        ),
    ]
