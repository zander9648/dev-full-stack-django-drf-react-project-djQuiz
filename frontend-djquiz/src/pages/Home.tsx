import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "@mui/material";

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isQuizGraded, setIsQuizGraded] = useState<boolean>(false);

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
        setHasErrors(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, []);

  useEffect(() => {
    const savedQuiz = localStorage.getItem("quiz");
    if (savedQuiz) {
      setQuiz(JSON.parse(savedQuiz));
    }
  }, []);

  useEffect(() => {
    if (quiz) {
      localStorage.setItem("quiz", JSON.stringify(quiz));
    }
  }, [quiz]);

  const handleQuizGrade = () => {
    setIsQuizGraded(true);
  };

  const handleOptionSelect = (optionValue: string) => {
    if (!quiz) return;
    setQuiz((prevState) => {
      if (!prevState) return null;
      const updatedQuestions = [...prevState.questions];
      updatedQuestions[currentQuestionIndex] = {
        ...updatedQuestions[currentQuestionIndex],
        selectedOption: optionValue,
      };
      return {
        ...prevState,
        questions: updatedQuestions,
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
      if (handleAnswerCheck(question)) {
        correctCount++;
      }
    });
    return correctCount;
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const handlePrevQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
  };

  const handleResetQuiz = () => {
    setQuiz(null);
    setCurrentQuestionIndex(0);
    localStorage.removeItem("quiz");
  };

  const calculatePercentage = () => {
    if (!quiz) return null;
    const answeredQuestions = quiz.questions.filter(
      (question) => question.selectedOption !== undefined
    );
    return Math.round((answeredQuestions.length / quiz.questions.length) * 100);
  };

  if (isLoading) {
    return <div>"Loading...</div>;
  }

  if (hasErrors) {
    return (
      <div>
        <h1>Error loading quiz</h1>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div>
        <h1>No quiz found</h1>
      </div>
    );
  }

  if (isQuizGraded) {
    const score = calculateScore();
    const maxScore = quiz.questions.length;
    return (
      <div>
        <h1>
          Your score is: {score} out of {maxScore}
        </h1>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div>
      <h1>{quiz.name}</h1>
      <p>{quiz.description}</p>
      <hr />
      <h2>{currentQuestion.text}</h2>
      <p>
        {`Question ${currentQuestionIndex + 1} of ${quiz.questions.length} (${
          calculatePercentage() || 0
        }% answered)`}
      </p>
      {currentQuestion.question_type === "mc" && (
        <div>
          {currentQuestion.answer?.options.map((option) => (
            <div key={option.id}>
              <Button
                sx={{
                  "&.selected": {
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                  },
                }}
                className={`option-button ${
                  option.id.toString() === currentQuestion.selectedOption
                    ? "selected"
                    : ""
                }`}
                color="primary"
                onClick={() => handleOptionSelect(option.id.toString())}
              >
                {option.text}
              </Button>
            </div>
          ))}
        </div>
      )}

      {currentQuestion.question_type === "tf" && (
        <div>
          <Button
            className={`option-button ${
              currentQuestion.selectedOption === "true" ? "selected" : ""
            }`}
            sx={{
              mr: 1,
              bgcolor:
                currentQuestion.selectedOption === "true"
                  ? "primary.main"
                  : "inherit",
              color:
                currentQuestion.selectedOption === "true" ? "#fff" : "inherit",
              "&:hover": {
                bgcolor:
                  currentQuestion.selectedOption === "true"
                    ? "primary.dark"
                    : "action.hover",
              },
            }}
            onClick={() => handleOptionSelect("true")}
          >
            True
          </Button>
          <Button
            className={`option-button ${
              currentQuestion.selectedOption === "false" ? "selected" : ""
            }`}
            sx={{
              bgcolor:
                currentQuestion.selectedOption === "false"
                  ? "primary.main"
                  : "inherit",
              color:
                currentQuestion.selectedOption === "false" ? "#fff" : "inherit",
              "&:hover": {
                bgcolor:
                  currentQuestion.selectedOption === "false"
                    ? "primary.dark"
                    : "action.hover",
              },
            }}
            onClick={() => handleOptionSelect("false")}
          >
            False
          </Button>
        </div>
      )}

      {currentQuestionIndex !== 0 && (
        <button onClick={handlePrevQuestion}>Previous</button>
      )}
      {currentQuestionIndex !== quiz.questions.length - 1 && (
        <button onClick={handleNextQuestion}>Next</button>
      )}
      {currentQuestionIndex === quiz.questions.length - 1 && (
        <div>
          <button onClick={handleResetQuiz}>Reset Quiz</button>
          <p>
            Your score: {calculateScore()} / {quiz.questions.length}
          </p>
        </div>
      )}
      {currentQuestionIndex === quiz.questions.length - 1 && (
        <Button variant="contained" color="primary" onClick={handleQuizGrade}>
          Grade
        </Button>
      )}
    </div>
  );
};

export default QuizInterface;
