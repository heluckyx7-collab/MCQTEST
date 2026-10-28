(() => {
  const $ = id => document.getElementById(id);

  const setup = $("setup");
  const quiz = $("quiz");
  const result = $("result");

  let questions = [];
  let index = 0;
  let score = 0;
  let answered = false;
  const seen = new Set();

  function shuffle(list) {
    const arr = [...list];

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
  }

  function getQuestions() {
    const subject = $("subject").value;
    const level = $("level").value;
    const count = Number($("count").value);

    const bank = window.QUIZ_QUESTIONS || [];

    // Select the chosen subject and level.
    let pool = bank.filter(q =>
      (subject === "All Subjects" || q.subject === subject) &&
      (
        q.level === level ||
        q.level === "General Practice" ||
        level === "General Practice"
      )
    );

    // Never show fewer than 10 if enough questions exist
    // in the overall bank. Add more questions for full coverage.
    if (pool.length < count) {
      pool = bank;
    }

    let fresh = pool.filter(q => !seen.has(q.question));

    // Reset only when the available question pool is exhausted.
    if (fresh.length < count) {
      if (fresh.length === 0) {
        seen.clear();
      } else {
        fresh = [...fresh, ...pool.filter(
          q => seen.has(q.question)
        )];
      }
    }

    return shuffle(fresh).slice(0, count);
  }

  function startQuiz() {
    questions = getQuestions();

    if (questions.length === 0) {
      alert("No questions available. Please add questions to questions.js.");
      return;
    }

    index = 0;
    score = 0;
    answered = false;

    setup.classList.add("hidden");
    result.classList.add("hidden");
    quiz.classList.remove("hidden");

    renderQuestion();
    quiz.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderQuestion() {
    const q = questions[index];

    if (!q) {
      finishQuiz();
      return;
    }

    answered = false;

    $("counter").textContent =
      `Question ${index + 1} of ${questions.length}`;

    $("score").textContent = `Score: ${score}`;
    $("question").textContent = q.question;
    $("bar").style.width =
      `${(index / questions.length) * 100}%`;

    $("explanation").classList.add("hidden");
    $("explanation").textContent = "";

    $("next").disabled = true;
    $("next").textContent =
      index === questions.length - 1
        ? "See Result"
        : "Next Question";

    const options = $("options");
    options.replaceChildren();

    q.options.forEach((text, i) => {
      const button = document.createElement("button");

      button.className = "option";
      button.textContent =
        `${String.fromCharCode(65 + i)}. ${text}`;

      button.addEventListener("click", () => checkAnswer(i));
      options.appendChild(button);
    });
  }

  function checkAnswer(selected) {
    if (answered) return;

    answered = true;

    const q = questions[index];
    const buttons = [
      ...$("options").querySelectorAll("button")
    ];

    const correct = selected === q.answer;

    buttons.forEach((button, i) => {
      button.disabled = true;

      if (i === q.answer) {
        button.classList.add("correct");
      }
    });

    if (correct) {
      score++;
    } else {
      buttons[selected].classList.add("wrong");
    }

    seen.add(q.question);
    $("score").textContent = `Score: ${score}`;

    const explanation = $("explanation");
    explanation.classList.remove("hidden");

    explanation.textContent = correct
      ? `Correct! 🎉 ${q.explanation}`
      : `Not quite! Correct answer: ${q.options[q.answer]}. ${q.explanation}`;

    $("bar").style.width =
      `${((index + 1) / questions.length) * 100}%`;

    $("next").disabled = false;
  }

  function nextQuestion() {
    if (!answered) return;

    index++;

    if (index >= questions.length) {
      finishQuiz();
    } else {
      renderQuestion();
    }
  }

  function finishQuiz() {
    quiz.classList.add("hidden");
    result.classList.remove("hidden");

    $("resultText").textContent =
      `Your score: ${score} out of ${questions.length}`;

    const percentage = Math.round(
      (score / questions.length) * 100
    );

    $("resultTip").textContent =
      percentage >= 80
        ? "Excellent! Keep practising."
        : percentage >= 50
        ? "Good effort! Read the explanations and try again."
        : "Keep learning. Practise regularly and improve step by step.";

    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  $("start").addEventListener("click", startQuiz);
  $("next").addEventListener("click", nextQuestion);

  $("exit").addEventListener("click", () => {
    quiz.classList.add("hidden");
    setup.classList.remove("hidden");
  });

  $("again").addEventListener("click", startQuiz);

  document.querySelectorAll("[data-subject]").forEach(button => {
    button.addEventListener("click", () => {
      $("subject").value = button.dataset.subject;
      startQuiz();
    });
  });
})();
