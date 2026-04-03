document.addEventListener("DOMContentLoaded", () => {
  const testId = window.TEST_ID;
  const resultsPath = window.RESULTS_PATH || '/';
  const dataPath = window.DATA_PATH || '/data/';

  if (!testId) return;

  let questions = [];
  let currentQIdx = 0;
  let scores = {};
  let resultMode = "score";
  let resultMap = {};
  let axisSelections = {};

  const qText = document.getElementById("question-text");
  const optionsContainer = document.getElementById("options-container");
  const progressBar = document.getElementById("progress-bar");
  const currentQSpan = document.getElementById("current-q");
  const totalQSpan = document.getElementById("total-q");

  fetch(`${dataPath}${testId}.json`)
    .then((res) => {
      if (!res.ok) throw new Error("Network error");
      return res.json();
    })
    .then((data) => {
      questions = data.questions || [];
      resultMode = data.resultMode || "score";
      resultMap = data.resultMap || {};
      if (totalQSpan) totalQSpan.textContent = questions.length;
      renderQuestion();
    })
    .catch((err) => {
      console.error("데이터를 불러오는데 실패했습니다.", err);
      if (qText) qText.textContent = "문제를 불러오는데 실패했습니다.";
    });

  window.selectOption = function (option) {
    if (resultMode === "mbti16") {
      if (option.dimension && option.axis) {
        axisSelections[option.dimension] = option.axis;
      }
    } else {
      const targetType = option.type;
      const scoreValue = option.value || 1;
      if (!scores[targetType]) scores[targetType] = 0;
      scores[targetType] += scoreValue;
    }

    currentQIdx++;
    if (currentQIdx < questions.length) {
      renderQuestion();
    } else {
      calculateResult();
    }
  };

  function renderQuestion() {
    const q = questions[currentQIdx];

    qText.style.animation = "none";
    qText.offsetHeight;
    qText.style.animation = null;

    qText.textContent = q.text;
    progressBar.style.width = `${(currentQIdx / questions.length) * 100}%`;
    currentQSpan.textContent = currentQIdx + 1;

    optionsContainer.innerHTML = "";
    q.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = opt.text;
      btn.style.animationDelay = `${idx * 0.05}s`;
      btn.onclick = () =>
        selectOption({
          type: opt.type,
          value: opt.value,
          axis: opt.axis,
          dimension: opt.dimension || q.dimension,
        });

      optionsContainer.appendChild(btn);
    });
  }

  function calculateResult() {
    progressBar.style.width = "100%";
    setTimeout(() => {
      let resultSlug = null;

      if (resultMode === "mbti16") {
        const code = ["EI", "SN", "TF", "PJ"]
          .map((dimension) => axisSelections[dimension] || dimension[0])
          .join("");
        resultSlug = resultMap[code] || code.toLowerCase();
      } else {
        let maxType = null;
        let maxScore = -1;

        for (let type in scores) {
          if (scores[type] > maxScore) {
            maxScore = scores[type];
            maxType = type;
          }
        }

        if (!maxType && questions.length > 0) {
          maxType = questions[0].options[0].type;
        }

        resultSlug = maxType;
      }

      window.location.href = `${resultsPath}${resultSlug}.html`;
    }, 400);
  }
});
