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

  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<Quiz>(
          "http://localhost:8000/quizzes/1"
        );
        setQuiz(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, []);

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

  const calculateScore = () => {
    if (!quiz) return null;
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
          <Typography variant="body1">{quiz.description}</Typography>
          <Grid container spacing={2}>
            {quiz.questions.map((question) => (
              <Grid key={question.id} item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{question.text}</Typography>
                    {question.explanation && (
                      <Typography variant="body2" color="text.secondary">
                        {question.explanation}
                      </Typography>
                    )}
                    {question.question_type === "mc" && (
                      <FormControl component="fieldset">
                        <RadioGroup
                          value={question.selectedOption ?? ""}
                          onChange={(e) =>
                            handleOptionSelect(question.id, e.target.value)
                          }
                        >
                          {question.answer?.options.map((option) => (
                            <FormControlLabel
                              key={option.id}
                              value={option.id.toString()}
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
                          value={question.selectedOption ?? ""}
                          onChange={(e) =>
                            handleOptionSelect(question.id, e.target.value)
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
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box mt={2}>
            <Button variant="contained" onClick={() => calculateScore()}>
              Submit Quiz
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default QuizInterface;
