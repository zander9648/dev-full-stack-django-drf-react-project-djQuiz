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
}

interface Question {
  id: number;
  question_type: string;
  text: string;
  explanation: string;
  answer?: boolean;
  answers?: Answer;
  selectedOption?: string;
}

interface Quiz {
  id: number;
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
        const response = await axios.get<Quiz>("http://localhost:8000/quizzes/1");
        setQuiz(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, []);

  const handleOptionSelect = (questionId: number, optionId: number) => {
    const updatedQuiz = { ...quiz };
    updatedQuiz.questions = updatedQuiz.questions.map((question) => {
      if (question.id === questionId) {
        question.selectedOption = optionId.toString();
      }
      return question;
    });
    setQuiz(updatedQuiz);
  };

  const handleAnswerCheck = (question: Question) => {
    if (!question.selectedOption) return null;

    const selectedOption = question.answers?.options.find(
      (option) => option.id === parseInt(question.selectedOption)
    );
    return selectedOption?.is_correct === true;
  };

  const calculateScore = () => {
    if (!quiz) return null;
    let correctCount = 0;
    quiz.questions.forEach((question) => {
      if (handleAnswerCheck(question)) correctCount++;
    });
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
                          value={question.selectedOption}
                          onChange={(event) =>
                            handleOptionSelect(question.id, parseInt(event.target.value))
                          }
                        >
                          {question.answers?.options.map((option) => (
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
                            </CardContent>
                            </Card>
                            </Grid>
                            ))}
                            </Grid>
                            <Button
                            variant="contained"
                            color="primary"
                            
                            onClick={() => console.log(calculateScore())}
                            >
                            Check Answers
                            </Button>
                            </>
                            )}
                            </Box>
                            );
                            };
                            
                            export default QuizInterface;