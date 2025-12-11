import React from 'react';

export function gradeQuiz(quiz, submission) {
  let totalScore = 0;
  let totalPoints = 0;

  const gradedAnswers = submission.answers.map((answer, index) => {
    const question = quiz.questions[index];
    totalPoints += question.points;

    let isCorrect = false;
    let pointsEarned = 0;
    let keywordsMatched = [];

    switch (question.question_type) {
      case "multiple_choice":
      case "true_false":
        isCorrect = answer.answer === question.correct_answer;
        pointsEarned = isCorrect ? question.points : 0;
        break;

      case "short_answer":
        // Keyword matching for auto-grading
        const studentAnswer = (answer.answer || "").toLowerCase();
        const keywords = question.keywords || [];
        
        keywordsMatched = keywords.filter(keyword => 
          studentAnswer.includes(keyword.toLowerCase())
        );
        
        // Pass if at least 50% of keywords are present
        const matchPercentage = keywords.length > 0 
          ? (keywordsMatched.length / keywords.length) 
          : 0;
        
        isCorrect = matchPercentage >= 0.5;
        pointsEarned = Math.round(question.points * matchPercentage);
        break;

      case "matching":
        // Check each match
        const correctMatches = question.matching_pairs?.correct_matches || [];
        const studentMatches = answer.matched_pairs || [];
        
        let correctCount = 0;
        correctMatches.forEach(correctMatch => {
          const studentMatch = studentMatches.find(sm => sm.left === correctMatch.left);
          if (studentMatch && studentMatch.right === correctMatch.right) {
            correctCount++;
          }
        });
        
        const matchScore = correctMatches.length > 0 
          ? correctCount / correctMatches.length 
          : 0;
        
        isCorrect = matchScore === 1;
        pointsEarned = Math.round(question.points * matchScore);
        break;

      case "essay":
        // Essays require manual grading
        isCorrect = null;
        pointsEarned = 0;
        break;

      default:
        break;
    }

    totalScore += pointsEarned;

    return {
      ...answer,
      is_correct: isCorrect,
      points_earned: pointsEarned,
      keywords_matched: keywordsMatched
    };
  });

  const percentage = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;
  const hasEssays = quiz.questions.some(q => q.question_type === "essay");

  return {
    answers: gradedAnswers,
    score: totalScore,
    total_points: totalPoints,
    percentage: percentage,
    graded: !hasEssays // Auto-graded unless there are essays
  };
}