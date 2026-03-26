document.addEventListener("DOMContentLoaded", () => {
  const testId = window.TEST_ID;
  const resultsPath = window.RESULTS_PATH || '/';
  const dataPath = window.DATA_PATH || '/data/';

  if(!testId) return; // Only execute if test data is indicated

  let questions = [];
  let currentQIdx = 0;
  // Score mapping: { "typeA": 0, "typeB": 0 }
  let scores = {}; 

  const qText = document.getElementById("question-text");
  const optionsContainer = document.getElementById("options-container");
  const progressBar = document.getElementById("progress-bar");
  const currentQSpan = document.getElementById("current-q");
  const totalQSpan = document.getElementById("total-q");

  // Load questions data from JSON endpoint
  fetch(`${dataPath}${testId}.json`)
    .then(res => {
      if(!res.ok) throw new Error("Network error");
      return res.json();
    })
    .then(data => {
      questions = data.questions;
      if(totalQSpan) totalQSpan.textContent = questions.length;
      renderQuestion();
    })
    .catch(err => {
      console.error("데이터를 불러오는데 실패했습니다.", err);
      if(qText) qText.textContent = "문제를 불러오는데 실패했습니다.";
    });

  window.selectOption = function(targetType, scoreValue) {
    if(!scores[targetType]) scores[targetType] = 0;
    scores[targetType] += scoreValue;

    currentQIdx++;
    if(currentQIdx < questions.length) {
      renderQuestion();
    } else {
      calculateResult();
    }
  }

  function renderQuestion() {
    const q = questions[currentQIdx];
    
    // Animation reset
    qText.style.animation = 'none';
    qText.offsetHeight; // trigger reflow
    qText.style.animation = null; 

    qText.textContent = q.text;
    progressBar.style.width = `${((currentQIdx) / questions.length) * 100}%`;
    currentQSpan.textContent = currentQIdx + 1;

    optionsContainer.innerHTML = "";
    q.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = opt.text;
      
      // Delay animation slightly based on index
      btn.style.animationDelay = `${idx * 0.05}s`;
      btn.onclick = () => selectOption(opt.type, opt.value || 1);
      
      optionsContainer.appendChild(btn);
    });
  }

  function calculateResult() {
    progressBar.style.width = '100%';
    setTimeout(() => {
      let maxType = null;
      let maxScore = -1;
      
      for(let type in scores) {
        if(scores[type] > maxScore) {
          maxScore = scores[type];
          maxType = type;
        }
      }

      if(!maxType && questions.length > 0) {
        maxType = questions[0].options[0].type;
      }

      // Redirect to the assigned outcome page based on type
      window.location.href = `${resultsPath}${maxType}/`;
    }, 400); // Wait for progress bar animation to hit 100%
  }
});
