const fs = require('fs');
const path = require('path');

const jsonPath = 'C:\\Users\\Vishal V D\\Downloads\\tryial\\test.json';
const outputPath = 'C:\\Users\\Vishal V D\\Downloads\\tryial\\mcq_test.html';

try {
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const questions = JSON.parse(rawData).filter(q => q.Questions && q.optionA); // Filter empty rows

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCQ Test</title>
    <style>
        :root {
            --primary: #2563eb;
            --success: #22c55e;
            --error: #ef4444;
            --surface: #ffffff;
            --bg: #f3f4f6;
            --text-main: #1f2937;
            --text-sec: #6b7280;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, sans-serif; }
        
        body {
            background-color: var(--bg);
            color: var(--text-main);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 1rem;
        }

        .container {
            background: var(--surface);
            width: 100%;
            max-width: 700px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            height: 90vh; /* Fixed height for consistency */
        }

        /* Header */
        .header {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #fff;
        }
        
        .progress-badge {
            background: #eff6ff;
            color: var(--primary);
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
        }

        .score-badge {
            font-weight: 600;
            color: var(--text-sec);
        }

        /* Question Area */
        .question-area {
            flex: 1;
            padding: 2rem 1.5rem;
            overflow-y: auto;
        }

        .question-text {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 2rem;
            line-height: 1.5;
        }

        .options-grid {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .option-card {
            padding: 1rem 1.25rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            background: #fff;
            display: flex;
            align-items: center;
        }

        .option-card:not(.disabled):hover {
            border-color: var(--primary);
            background: #eff6ff;
        }

        .option-card.selected {
            border-color: var(--primary);
            background: #eff6ff;
        }

        .option-card.correct {
            border-color: var(--success);
            background: #dcfce7;
            color: #166534;
        }

        .option-card.wrong {
            border-color: var(--error);
            background: #fee2e2;
            color: #991b1b;
        }

        .option-card.disabled {
            cursor: default;
        }

        .option-marker {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid #9ca3af;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            flex-shrink: 0;
            transition: all 0.2s;
        }

        .option-card:not(.disabled):hover .option-marker {
            border-color: var(--primary);
            color: var(--primary);
        }

        .option-card.correct .option-marker {
            border-color: var(--success);
            background: var(--success);
            color: white;
            border: none;
        }

        .option-card.wrong .option-marker {
            border-color: var(--error);
            background: var(--error);
            color: white;
            border: none;
        }

        /* Footer */
        .footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid #e5e7eb;
            background: #f9fafb;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            height: 80px;
        }

        .btn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }

        .btn:hover {
            background: #1d4ed8;
        }
        
        .btn:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }

        .hidden { display: none; }
        
        /* Result Screen */
        .result-screen {
            text-align: center;
            padding: 3rem;
        }
        
        .result-score {
            font-size: 4rem;
            font-weight: 700;
            color: var(--primary);
            margin: 1rem 0;
        }
    </style>
</head>
<body>

<div class="container" id="quiz-container">
    <div class="header">
        <div class="progress-badge">Question <span id="current-q">1</span> of <span id="total-q">10</span></div>
        <div class="score-badge">Score: <span id="score">0</span></div>
        <button class="btn" style="padding: 0.5rem 1rem; font-size: 0.8rem; margin-left: 1rem;" onclick="toggleAllAnswers()">Show All Answers</button>
    </div>

    <div class="question-area">
        <div class="question-text" id="question-text">
            Loading...
        </div>
        <div class="options-grid" id="options-grid">
            <!-- Options injected here -->
        </div>
    </div>

    <div class="footer">
        <div id="feedback-msg" style="flex:1; font-weight:600; color: var(--text-sec);"></div>
        <button class="btn" id="next-btn" onclick="nextQuestion()" disabled>Next Question</button>
    </div>
</div>

<div class="container" id="all-answers-view" style="display: none; overflow-y: auto;">
    <div class="header">
        <h2 style="font-size: 1.25rem;">All Questions & Answers</h2>
        <button class="btn" style="padding: 0.5rem 1rem; font-size: 0.8rem;" onclick="toggleAllAnswers()">Back to Quiz</button>
    </div>
    <div id="all-answers-list" style="padding: 1.5rem;">
        <!-- All questions injected here -->
    </div>
</div>

<div class="container hidden" id="result-container">
    <div class="question-area result-screen">
        <h2>Quiz Completed!</h2>
        <div class="result-score"><span id="final-score">0</span>%</div>
        <p>You answered <span id="final-correct">0</span> out of <span id="final-total">0</span> correctly.</p>
    </div>
    <div class="footer" style="justify-content: center;">
        <button class="btn" onclick="location.reload()">Restart Quiz</button>
        <button class="btn" style="margin-left: 1rem; background: #4b5563;" onclick="toggleAllAnswers(); document.getElementById('result-container').classList.add('hidden');">View All Answers</button>
    </div>
</div>

<script>
    // Embedded Data
    const questions = ${JSON.stringify(questions)};

    let currentIdx = 0;
    let score = 0;
    let isAnswered = false;

    // DOM Elements
    const qTextEl = document.getElementById('question-text');
    const optionsGridEl = document.getElementById('options-grid');
    const currentQEl = document.getElementById('current-q');
    const totalQEl = document.getElementById('total-q');
    const scoreEl = document.getElementById('score');
    const nextBtn = document.getElementById('next-btn');
    const feedbackEl = document.getElementById('feedback-msg');
    const quizContainer = document.getElementById('quiz-container');
    const resultContainer = document.getElementById('result-container');
    const allAnswersView = document.getElementById('all-answers-view');
    const allAnswersList = document.getElementById('all-answers-list');

    // Init
    document.getElementById('total-q').textContent = questions.length;
    renderQuestion(0);
    renderAllAnswers();

    function renderQuestion(index) {
        if (index >= questions.length) {
            showResults();
            return;
        }

        const q = questions[index];
        currentIdx = index;
        isAnswered = false;
        
        // Update Header
        currentQEl.textContent = index + 1;
        
        // Update Text
        qTextEl.textContent = q.Questions;
        
        // Clear Options
        optionsGridEl.innerHTML = '';
        nextBtn.disabled = true;
        feedbackEl.textContent = '';

        const options = getOptions(q);

        options.forEach(opt => {
            const card = document.createElement('div');
            card.className = 'option-card';
            card.onclick = () => selectOption(card, opt.key, q.selectedoptions);
            
            const marker = document.createElement('div');
            marker.className = 'option-marker';
            marker.textContent = opt.key.replace('option', '');
            
            const text = document.createElement('div');
            text.textContent = opt.text;
            
            card.appendChild(marker);
            card.appendChild(text);
            card.dataset.key = opt.key; // Store key for checking
            
            optionsGridEl.appendChild(card);
        });
    }

    function getOptions(q) {
        const options = [];
        ['optionA', 'optionB', 'optionC', 'optionD', 'optionE'].forEach(key => {
            if (q[key]) {
                options.push({ key: key, text: q[key] });
            }
        });
        return options;
    }

    function selectOption(card, selectedKey, correctKey) {
        if (isAnswered) return;
        isAnswered = true;
        nextBtn.disabled = false;

        // Normalize matching
        const isCorrect = selectedKey === correctKey;

        if (isCorrect) {
            card.classList.add('correct');
            score++;
            scoreEl.textContent = score;
            feedbackEl.textContent = "Correct! 🎉";
            feedbackEl.style.color = "var(--success)";
        } else {
            card.classList.add('wrong');
            feedbackEl.textContent = "Incorrect";
            feedbackEl.style.color = "var(--error)";
            
            // Highlight correct one
            const correctCard = Array.from(optionsGridEl.children).find(c => c.dataset.key === correctKey);
            if (correctCard) correctCard.classList.add('correct');
        }

        // Disable all
        Array.from(optionsGridEl.children).forEach(c => c.classList.add('disabled'));
        
        // Auto focus next button for speed
        nextBtn.focus();
    }

    function nextQuestion() {
        renderQuestion(currentIdx + 1);
    }

    function showResults() {
        quizContainer.classList.add('hidden');
        resultContainer.classList.remove('hidden');
        
        const percentage = Math.round((score / questions.length) * 100);
        document.getElementById('final-score').textContent = percentage;
        document.getElementById('final-correct').textContent = score;
        document.getElementById('final-total').textContent = questions.length;
    }

    function toggleAllAnswers() {
        if (allAnswersView.style.display === 'none') {
            quizContainer.classList.add('hidden'); // Hide quiz
            resultContainer.classList.add('hidden'); // Hide result if open
            allAnswersView.style.display = 'flex'; // Show list (flex col)
            allAnswersView.style.flexDirection = 'column';
        } else {
            allAnswersView.style.display = 'none';
            // If quiz finished, show result, else show quiz (simple handling)
            if (currentIdx >= questions.length || resultContainer.classList.contains('active-state')) { 
                // We'd need state tracking for result screen, but simple fallback:
                if (currentIdx >= questions.length) resultContainer.classList.remove('hidden');
                else quizContainer.classList.remove('hidden');
            } else {
                 quizContainer.classList.remove('hidden');
            }
        }
    }

    function renderAllAnswers() {
        let html = '';
        questions.forEach((q, idx) => {
            const options = getOptions(q);
            html += \`
                <div style="margin-bottom: 2rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem;">
                    <div style="font-weight: 700; margin-bottom: 1rem;">Q\${idx + 1}. \${q.Questions}</div>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            \`;
            
            options.forEach(opt => {
                const isCorrect = opt.key === q.selectedoptions;
                const style = isCorrect 
                    ? 'background: #dcfce7; border: 1px solid #22c55e; color: #166534;' 
                    : 'background: #fff; border: 1px solid #e5e7eb;';
                
                html += \`
                    <div style="padding: 0.75rem; border-radius: 6px; \${style}">
                        <strong>\${opt.key.replace('option', '')}.</strong> \${opt.text}
                        \${isCorrect ? ' ✅' : ''}
                    </div>
                \`;
            });
            
            html += \`</div></div>\`;
        });
        allAnswersList.innerHTML = html;
    }

    // Keyboard support for speed
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !nextBtn.disabled && allAnswersView.style.display === 'none') {
            nextQuestion();
        }
    });

</script>
</body>
</html>`;

    fs.writeFileSync(outputPath, htmlContent);
    console.log('Successfully created mcq_test.html with ' + questions.length + ' questions.');

} catch (err) {
    console.error('Error:', err);
}
