class MathChallengeGame {
    constructor() {
        this.currentScreen = 'intro';
        this.currentDifficulty = null;
        this.score = 0;
        this.currentQuestionIndex = 0;
        this.totalQuestions = 10;
        this.questions = [];
        this.currentAnswer = null;
        this.soundEnabled = true;
        this.currentLanguage = 'en';
        
        this.translations = {
            en: {
                Easy: 'Easy',
                Medium: 'Medium',
                Hard: 'Hard',
                Success: 'Well Done!',
                Failure: 'Game Over',
                Tip: 'Practice makes perfect!',
                Continue: 'Continue',
                Score: 'Score',
                FinalScore: 'Final Score',
                Submit: 'Submit',
                'Math Challenge Discovery': 'Math Challenge Discovery',
                'Choose your difficulty level': 'Choose your difficulty level',
                'Your answer': 'Your answer'
            },
            ar: {
                Easy: 'سهل',
                Medium: 'متوسط',
                Hard: 'صعب',
                Success: 'أحسنت! نجحت',
                Failure: 'حاول مرة أخرى',
                Tip: 'العقل مثل العضلة، يقوى بالتدريب',
                Continue: 'استمر',
                Score: 'النقاط',
                FinalScore: 'النقاط النهائية',
                Submit: 'إرسال',
                'Math Challenge Discovery': 'تحدي الرياضيات الاستكشافي',
                'Choose your difficulty level': 'اختر مستوى الصعوبة',
                'Your answer': 'إجابتك'
            }
        };
        
        this.initializeElements();
        this.attachEventListeners();
        this.updateLanguage();
    }

    initializeElements() {
        // Screens
        this.introScreen = document.getElementById('intro-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.resultScreen = document.getElementById('result-screen');
        
        // UI Elements
        this.langToggle = document.getElementById('lang-toggle');
        this.soundToggle = document.getElementById('sound-toggle');
        this.scoreElement = document.getElementById('score');
        this.finalScoreElement = document.getElementById('final-score');
        this.questionElement = document.getElementById('question');
        this.answerInput = document.getElementById('answer-input');
        this.submitBtn = document.getElementById('submit-btn');
        this.continueBtn = document.getElementById('continue-btn');
        this.feedbackElement = document.getElementById('feedback');
        this.questionCounterElement = document.getElementById('question-counter-text');
        this.resultIcon = document.getElementById('result-icon');
        this.resultTitle = document.getElementById('result-title');
        this.resultMessage = document.getElementById('result-message');
        this.bubblesContainer = document.getElementById('bubbles-container');
        
        // Audio elements
        this.bgMusic = document.getElementById('bg-music');
        this.popSound = document.getElementById('pop-sound');
        this.correctSound = document.getElementById('correct-sound');
        this.wrongSound = document.getElementById('wrong-sound');
        
        // Difficulty blobs
        this.difficultyBlobs = document.querySelectorAll('.blob');
    }

    attachEventListeners() {
        // Language toggle
        this.langToggle.addEventListener('click', () => this.toggleLanguage());
        
        // Sound toggle
        this.soundToggle.addEventListener('click', () => this.toggleSound());
        
        // Difficulty selection
        this.difficultyBlobs.forEach(blob => {
            blob.addEventListener('click', (e) => {
                const difficulty = e.currentTarget.dataset.difficulty;
                this.selectDifficulty(difficulty);
            });
        });
        
        // Game controls
        this.submitBtn.addEventListener('click', () => this.checkAnswer());
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });
        
        this.continueBtn.addEventListener('click', () => this.resetToIntro());
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'ar' : 'en';
        this.langToggle.textContent = this.currentLanguage.toUpperCase();
        document.documentElement.lang = this.currentLanguage;
        document.documentElement.dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
        this.updateLanguage();
    }

    updateLanguage() {
        const texts = this.translations[this.currentLanguage];
        
        // Update all elements with data-text attribute
        document.querySelectorAll('[data-text]').forEach(element => {
            const key = element.getAttribute('data-text');
            if (texts[key]) {
                element.textContent = texts[key];
            }
        });
        
        // Update placeholders
        if (this.answerInput) {
            this.answerInput.placeholder = texts['Your answer'];
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
        
        if (this.soundEnabled) {
            this.bgMusic.play().catch(e => console.log('Audio play failed:', e));
        } else {
            this.bgMusic.pause();
        }
    }

    selectDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.playSound('pop');
        this.createBubbleBurst(event);
        
        setTimeout(() => {
            this.startGame();
        }, 800);
    }

    createBubbleBurst(event) {
        const burst = document.createElement('div');
        burst.className = 'bubble-burst';
        burst.style.left = event.clientX + 'px';
        burst.style.top = event.clientY + 'px';
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'bubble-particle';
            
            const angle = (Math.PI * 2 * i) / 20;
            const velocity = 50 + Math.random() * 100;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            
            burst.appendChild(particle);
        }
        
        document.body.appendChild(burst);
        
        setTimeout(() => {
            burst.remove();
        }, 800);
    }

    startGame() {
        this.score = 0;
        this.currentQuestionIndex = 0;
        this.questions = this.generateQuestions();
        this.scoreElement.textContent = this.score;
        
        this.showScreen('game');
        this.startFloatingBubbles();
        this.displayQuestion();
        this.updateQuestionCounter();
        
        if (this.soundEnabled) {
            this.bgMusic.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    generateQuestions() {
        const questions = [];
        const operations = this.getOperationsForDifficulty();
        
        for (let i = 0; i < this.totalQuestions; i++) {
            const operation = operations[Math.floor(Math.random() * operations.length)];
            const question = this.generateQuestion(operation);
            questions.push(question);
        }
        
        return questions;
    }

    getOperationsForDifficulty() {
        switch (this.currentDifficulty) {
            case 'easy':
                return ['addition', 'subtraction'];
            case 'medium':
                return ['multiplication', 'division'];
            case 'hard':
                return ['addition', 'subtraction', 'multiplication', 'division', 'square', 'power'];
            default:
                return ['addition', 'subtraction'];
        }
    }

    generateQuestion(operation) {
        let num1, num2, question, answer;
        
        switch (operation) {
            case 'addition':
                num1 = Math.floor(Math.random() * 20) + 1;
                num2 = Math.floor(Math.random() * 20) + 1;
                question = `${num1} + ${num2}`;
                answer = num1 + num2;
                break;
                
            case 'subtraction':
                num1 = Math.floor(Math.random() * 20) + 1;
                num2 = Math.floor(Math.random() * num1) + 1;
                question = `${num1} - ${num2}`;
                answer = num1 - num2;
                break;
                
            case 'multiplication':
                num1 = Math.floor(Math.random() * 12) + 1;
                num2 = Math.floor(Math.random() * 12) + 1;
                question = `${num1} × ${num2}`;
                answer = num1 * num2;
                break;
                
            case 'division':
                num2 = Math.floor(Math.random() * 12) + 1;
                answer = Math.floor(Math.random() * 12) + 1;
                num1 = num2 * answer;
                question = `${num1} ÷ ${num2}`;
                break;
                
            case 'square':
                num1 = Math.floor(Math.random() * 20) + 1;
                question = `√${num1 * num1}`;
                answer = num1;
                break;
                
            case 'power':
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = 2;
                question = `${num1}²`;
                answer = num1 * num1;
                break;
                
            default:
                return this.generateQuestion('addition');
        }
        
        return { question, answer };
    }

    displayQuestion() {
        if (this.currentQuestionIndex < this.questions.length) {
            const currentQ = this.questions[this.currentQuestionIndex];
            this.currentAnswer = currentQ.answer;
            this.questionElement.textContent = `${currentQ.question} = ?`;
            this.answerInput.value = '';
            this.answerInput.focus();
        } else {
            this.endGame();
        }
    }

    updateQuestionCounter() {
        this.questionCounterElement.textContent = `${this.currentQuestionIndex + 1}/${this.totalQuestions}`;
    }

    checkAnswer() {
        const userAnswer = parseInt(this.answerInput.value);
        
        if (isNaN(userAnswer)) {
            this.showFeedback('Please enter a valid number!', 'incorrect');
            return;
        }
        
        const isCorrect = userAnswer === this.currentAnswer;
        
        if (isCorrect) {
            this.score++;
            this.scoreElement.textContent = this.score;
            this.playSound('correct');
            this.showFeedback('Correct! 🎉', 'correct');
        } else {
            this.playSound('wrong');
            this.showFeedback(`Incorrect! The answer was ${this.currentAnswer}`, 'incorrect');
        }
        
        this.currentQuestionIndex++;
        this.updateQuestionCounter();
        
        setTimeout(() => {
            this.displayQuestion();
        }, 1500);
    }

    showFeedback(message, type) {
        this.feedbackElement.textContent = message;
        this.feedbackElement.className = `feedback ${type}`;
        
        setTimeout(() => {
            this.feedbackElement.textContent = '';
            this.feedbackElement.className = 'feedback';
        }, 3000);
    }

    endGame() {
        this.stopFloatingBubbles();
        this.bgMusic.pause();
        
        const passed = this.score >= 5;
        const texts = this.translations[this.currentLanguage];
        
        this.resultIcon.textContent = passed ? '🎉' : '😔';
        this.resultTitle.textContent = passed ? texts.Success : texts.Failure;
        this.resultTitle.className = `result-title ${passed ? 'success' : 'failure'}`;
        this.resultMessage.textContent = passed ? texts.Tip : texts.Tip;
        this.finalScoreElement.textContent = this.score;
        
        this.showScreen('result');
    }

    resetToIntro() {
        this.showScreen('intro');
        this.currentDifficulty = null;
        this.score = 0;
        this.currentQuestionIndex = 0;
        this.questions = [];
    }

    showScreen(screenName) {
        // Hide all screens
        this.introScreen.classList.remove('active');
        this.gameScreen.classList.remove('active');
        this.resultScreen.classList.remove('active');
        
        // Show selected screen
        switch (screenName) {
            case 'intro':
                this.introScreen.classList.add('active');
                break;
            case 'game':
                this.gameScreen.classList.add('active');
                break;
            case 'result':
                this.resultScreen.classList.add('active');
                break;
        }
        
        this.currentScreen = screenName;
    }

    startFloatingBubbles() {
        this.bubbleInterval = setInterval(() => {
            this.createFloatingBubble();
        }, 2000);
    }

    stopFloatingBubbles() {
        if (this.bubbleInterval) {
            clearInterval(this.bubbleInterval);
            this.bubbleInterval = null;
        }
        this.bubblesContainer.innerHTML = '';
    }

    createFloatingBubble() {
        const bubble = document.createElement('div');
        bubble.className = 'floating-bubble';
        
        const size = Math.random() * 60 + 20;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.left = Math.random() * window.innerWidth + 'px';
        bubble.style.animationDelay = Math.random() * 2 + 's';
        bubble.style.animationDuration = (8 + Math.random() * 4) + 's';
        
        this.bubblesContainer.appendChild(bubble);
        
        setTimeout(() => {
            bubble.remove();
        }, 12000);
    }

    playSound(type) {
        if (!this.soundEnabled) return;
        
        try {
            switch (type) {
                case 'pop':
                    this.popSound.currentTime = 0;
                    this.popSound.play().catch(e => console.log('Sound play failed:', e));
                    break;
                case 'correct':
                    this.correctSound.currentTime = 0;
                    this.correctSound.play().catch(e => console.log('Sound play failed:', e));
                    break;
                case 'wrong':
                    this.wrongSound.currentTime = 0;
                    this.wrongSound.play().catch(e => console.log('Sound play failed:', e));
                    break;
            }
        } catch (error) {
            console.log('Audio error:', error);
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MathChallengeGame();
});
