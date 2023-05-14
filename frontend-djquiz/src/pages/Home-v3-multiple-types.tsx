import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";

interface Option {
  id: number;
  text: string;
  is_correct: boolean;
}

interface Answer {
  options: Option[];
  true_answer?: boolean;
  false_answer?: boolean;
}

interface Question {
  id: number;
  question_type: string;
  text: string;
  explanation: string;
  answer?: Answer;
  selectedOption?: string;
  true_answer?: boolean;
}

interface Quiz {
  id?: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  questions: Question[];
}

const QuizInterface = () => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [unansweredQuestions, setUnansweredQuestions] = useState<Question[]>(
    []
  );

  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<Quiz>(
          "http://localhost:8000/quizzes/1"
        );
        setQuiz(response.data);
        setUnansweredQuestions(
          response.data.questions.filter((question) => !question.selectedOption)
        );
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, []);

  useEffect(() => {
    setUnansweredQuestions(
      quiz?.questions.filter((question) => !question.selectedOption) || []
    );
  }, [quiz]);

  const handleOptionSelect = (questionId: number, optionValue: string) => {
    if (!quiz) return;
    setQuiz((prevState) => {
      if (!prevState) return null;
      return {
        ...prevState,
        questions: prevState.questions.map((question) => {
          if (question.id === questionId) {
            return {
              ...question,
              selectedOption: optionValue,
              answered: true, // Add this line to indicate that the question has been answered
            };
          }
          return question;
        }),
      };
    });
  };

  const handleAnswerCheck = (question: Question) => {
    if (!question.selectedOption) return null;

    if (question.question_type === "mc") {
      const selectedOption = question.answer?.options.find(
        (option) => option.id === parseInt(question.selectedOption || "", 10)
      );
      return selectedOption?.is_correct === true;
    }

    if (question.question_type === "tf") {
      const isTrue = question.selectedOption === "true";
      return question.true_answer === isTrue;
    }

    return null;
  };

  const validateQuiz = () => {
    let hasErrors = false;
    quiz?.questions.forEach((question) => {
      if (!question.selectedOption) {
        hasErrors = true;
      }
    });
    setHasErrors(hasErrors);
    return !hasErrors;
  };

  const calculateScore = () => {
    if (!quiz) return null;
    if (!validateQuiz()) return;
    let correctCount = 0;
    quiz.questions.forEach((question) => {
      if (handleAnswerCheck(question)) correctCount++;
    });
    console.log(correctCount);
    return correctCount;
  };

  return (
    <Box p={2}>
      {isLoading && <CircularProgress />}
      {quiz && (
        <>
          <Typography variant="h4" gutterBottom>
            {quiz.name}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            {quiz.description}
          </Typography>
          {unansweredQuestions.length > 0 && (
            <Box mt={2} mb={1}>
              <Typography variant="subtitle1" color="error">
                Please answer the following questions:
              </Typography>
              <ul>
                {unansweredQuestions.map((question) => (
                  <li key={question.id}>{question.text}</li>
                ))}
              </ul>
            </Box>
          )}
          <Grid container spacing={2}>
            {quiz.questions.map((question) => (
              <Grid item xs={12} key={question.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {question.text}
                    </Typography>
                    {question.question_type === "mc" && (
                      <FormControl component="fieldset">
                        <RadioGroup
                          aria-label="quiz"
                          name={`question-${question.id}`}
                          value={question.selectedOption || ""}
                          onChange={(event) =>
                            handleOptionSelect(question.id, event.target.value)
                          }
                        >
                          {question.answer?.options.map((option) => (
                            <FormControlLabel
                              key={option.id}
                              value={`${option.id}`}
                              control={<Radio />}
                              label={option.text}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    )}
                    {question.question_type === "tf" && (
                      <FormControl component="fieldset">
                        <RadioGroup
                          aria-label="quiz"
                          name={`question-${question.id}`}
                          value={question.selectedOption || ""}
                          onChange={(event) =>
                            handleOptionSelect(question.id, event.target.value)
                          }
                        >
                          <FormControlLabel
                            value="true"
                            control={<Radio />}
                            label="True"
                          />
                          <FormControlLabel
                            value="false"
                            control={<Radio />}
                            label="False"
                          />
                        </RadioGroup>
                      </FormControl>
                    )}
                    {question.explanation && (
                      <Typography variant="subtitle1" gutterBottom>
                        Explanation: {question.explanation}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box mt={2} display="flex" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              onClick={calculateScore}
            >
              Submit Quiz
            </Button>
          </Box>
          {hasErrors && (
            <Typography variant="subtitle1" color="error">
              Please answer all questions before submitting.
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default QuizInterface;
