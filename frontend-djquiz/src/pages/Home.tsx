import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Button } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";

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
  const [previous, setPrevious] = useState<boolean>(false);
  const [useTime, setUseTime] = useState<boolean>(true);
  const [timePerQuestion, setTimePerQuestion] = useState<number | null>(10);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isAnswerSelected, setIsAnswerSelected] = useState<boolean[]>([]);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

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
      updatedQuestions[currentQuestionIndex].selectedOption = optionValue;
      return {
        ...prevState,
        questions: updatedQuestions,
      };
    });
    setIsAnswerSelected((prevSelected) => {
      const updatedSelected = [...prevSelected];
      updatedSelected[currentQuestionIndex] = true;
      return updatedSelected;
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
    if (!useTime) {
      // Check if the current question is answered or if it's the last question
      if (
        (currentQuestion.selectedOption !== undefined ||
          currentQuestionIndex === 0) &&
        currentQuestionIndex !== quiz!.questions.length - 1
      ) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        if (timePerQuestion !== null) {
          setRemainingTime(timePerQuestion);
        }
      } else if (currentQuestionIndex === quiz!.questions.length - 1) {
        handleQuizGrade();
      }
    } else {
      if (currentQuestionIndex === quiz!.questions.length - 1) {
        handleQuizGrade();
      } else {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        if (timePerQuestion !== null) {
          setRemainingTime(timePerQuestion);
        }
      }
    }
  };

  useInterval(
    () => {
      if (useTime && remainingTime !== null) {
        if (remainingTime > 0) {
          setRemainingTime((prevTime) =>
            prevTime !== null ? prevTime - 1 : null
          ); // Provide a default value of null if prevTime is null
        } else {
          handleNextQuestion();
        }
      }
    },
    useTime && timePerQuestion ? 1000 : null
  );

  useEffect(() => {
    if (useTime && remainingTime === null) {
      setRemainingTime(timePerQuestion);
    }
  }, [useTime, remainingTime, timePerQuestion]);

  const handlePrevQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    setIsAnswerSelected((prevSelected) => {
      const updatedSelected = [...prevSelected];
      updatedSelected[currentQuestionIndex - 1] = true;
      return updatedSelected;
    });
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
  function useInterval(callback: Function, delay: number | null) {
    const savedCallback = useRef<Function | null>(null);

    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
      function tick() {
        if (savedCallback.current) {
          savedCallback.current();
        }
      }
      if (delay !== null) {
        const id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  return (
    <div>
      <h1>{quiz.name}</h1>
      <p>{quiz.description}</p>
      <hr />

      <div>
        {useTime && remainingTime !== null && (
          <LinearProgress
            variant="determinate"
            value={Math.round(
              (((timePerQuestion || 0) - (remainingTime || 0)) /
                (timePerQuestion || 1)) *
                100
            )}
            sx={{
              transform: "rotate(180deg)", // Reverses the progress bar
              "& .MuiLinearProgress-bar": {
                backgroundColor: "green", // Customize the color of the progress bar
              },
            }}
          />
        )}
      </div>

      <p>
        {`Question ${currentQuestionIndex + 1} of ${quiz.questions.length} (${
          calculatePercentage() || 0
        }% answered)`}
      </p>
      <h2>{currentQuestion.text}</h2>

      {currentQuestion.question_type === "mc" && (
        <div>
          {currentQuestion.answer?.options.map((option) => (
            <div key={option.id}>
              <Button
                style={{
                  backgroundColor:
                    currentQuestion.selectedOption === option.id.toString()
                      ? "#21b6ae"
                      : "white",
                }}
                sx={{
                  color:
                    currentQuestion.selectedOption === option.id.toString()
                      ? "black"
                      : "blue",
                }}
                onClick={() => handleOptionSelect(option.id.toString())}
              >
                {option.text}
                {showAnswer &&
                  currentQuestion.selectedOption === option.id.toString() && (
                    <span>{option.is_correct ? "✔️" : "❌"}</span>
                  )}
              </Button>
            </div>
          ))}
        </div>
      )}

      {currentQuestion.question_type === "tf" && (
        <div>
          <Button
            style={{
              backgroundColor:
                currentQuestion.selectedOption === "true" ? "#21b6ae" : "white",
            }}
            sx={{
              color:
                currentQuestion.selectedOption === "true" ? "black" : "blue",
            }}
            onClick={() => handleOptionSelect("true")}
          >
            True
            {showAnswer && currentQuestion.selectedOption === "true" && (
              <span>{currentQuestion.true_answer ? "✔️" : "❌"}</span>
            )}
          </Button>
          <Button
            style={{
              backgroundColor:
                currentQuestion.selectedOption === "false"
                  ? "#21b6ae"
                  : "white",
            }}
            sx={{
              color:
                currentQuestion.selectedOption === "false" ? "black" : "blue",
            }}
            onClick={() => handleOptionSelect("false")}
          >
            False
            {showAnswer && currentQuestion.selectedOption === "false" && (
              <span>{!currentQuestion.true_answer ? "✔️" : "❌"}</span>
            )}
          </Button>
        </div>
      )}

      {previous && currentQuestionIndex > 0 && (
        <Button onClick={handlePrevQuestion}>Previous</Button>
      )}
      {currentQuestionIndex < quiz.questions.length - 1 &&
        isAnswerSelected[currentQuestionIndex] && (
          <Button onClick={handleNextQuestion}>Next</Button>
        )}
      {currentQuestionIndex === quiz.questions.length - 1 &&
        isAnswerSelected[currentQuestionIndex] && (
          <Button onClick={handleQuizGrade}>Finish</Button>
        )}
    </div>
  );
};

export default QuizInterface;
