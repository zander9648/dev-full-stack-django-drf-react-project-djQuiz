# Generated by Django 4.2.1 on 2023-05-08 09:54

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("quiz", "0001_initial"),
    ]

    operations = [
        migrations.RenameField(
            model_name="truefalsequestion",
            old_name="false_answer",
            new_name="answer",
        ),
        migrations.RemoveField(
            model_name="truefalsequestion",
            name="true_answer",
        ),
    ]
