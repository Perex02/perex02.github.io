let words = JSON.parse(localStorage.getItem('words')) || [];
let currentWord;
let button;
let answered = false;
let answerInput;
let recentWords = [];
let currentGroup = [];
const groupSize = 10;
const pointsToPass = 2;
const colorRed = getComputedStyle(document.documentElement).getPropertyValue('--red');
const colorYellow = getComputedStyle(document.documentElement).getPropertyValue('--yellow');
const colorGreen = getComputedStyle(document.documentElement).getPropertyValue('--green');
const buttonColorCorrect = getComputedStyle(document.documentElement).getPropertyValue('--buttonColorCorrect');
const buttonColorIncorrect = getComputedStyle(document.documentElement).getPropertyValue('--buttonColorIncorrect');

function startQuiz() {
    if (words.length === 0) {
        alert("Keine Vokabeln vorhanden.");
        return;
    }

    // Initialize button variables after the DOM is fully loaded
    button = document.getElementById("button");
    answerInput = document.getElementById("AnswerTextarea");

    // Add event listener for Enter key press
    document.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            buttonClick();
        }
    });

    answerInput.addEventListener("input", function() {
        if (!answered) {
            this.style.color = getComputedStyle(document.documentElement).getPropertyValue('--textColor');
        }
        this.style.height = "2em";
        this.style.height = (this.scrollHeight) + "px";
    });

    answerInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
        }
    });

    selectNewGroup();
    nextWord();
    answered = false;
}

function buttonClick() {
    if (answered) {
        nextWord();
    } else {
        checkAnswer();
    }
    console.log(answered);
}

function checkAnswer() {
    if (!currentWord) {
        console.log("No current word to check.");
        return; // Keine Vokabel zum Überprüfen
    }

    const userAnswer = answerInput.value.trim();
    const correctAnswer = currentWord.translation;

    if (userAnswer === correctAnswer) {
        document.getElementById("feedback").textContent = "Richtig!";
        replaceTextareaWithDiv(highlightMistakes(userAnswer, correctAnswer));
        currentWord.score += 1;
        button.style.backgroundColor = buttonColorCorrect;
    } else if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        document.getElementById("feedback").textContent = "Fast richtig!";
        replaceTextareaWithDiv(highlightMistakes(userAnswer, correctAnswer));
        currentWord.score += 1;
        button.style.backgroundColor = buttonColorCorrect;
    } else {
        document.getElementById("feedback").textContent = "Leider Falsch...";
        document.getElementById("query").textContent = `${currentWord.word} - ${correctAnswer}`;
        replaceTextareaWithDiv(highlightMistakes(userAnswer, correctAnswer));
        currentWord.score -= 1;
        button.style.backgroundColor = buttonColorIncorrect;
    }

    button.textContent = "Weiter";
    answered = true;

    currentGroup.forEach(word => {
        console.log(`${word.word} - ${word.translation}: ${word.score}`);
    });
    console.log("Recent words:", recentWords.map(word => word.word));

    if (isGroupCompleted()) {
        selectNewGroup();
    }
}

function replaceTextareaWithDiv(content) {
    const textarea = document.getElementById("AnswerTextarea");
    const div = document.createElement("div");
    div.id = "AnswerTextarea";
    div.className = "AnswerTextArea";
    div.innerHTML = content;
    div.style.height = textarea.style.height;
    div.style.width = textarea.style.width;
    textarea.parentNode.replaceChild(div, textarea);
}

function replaceDivWithTextarea() {
    const div = document.getElementById("AnswerTextarea");
    const textarea = document.createElement("textarea");
    textarea.id = "AnswerTextarea";
    textarea.className = "AnswerTextArea";
    textarea.placeholder = "Antwort...";
    textarea.style.padding = getComputedStyle(div).padding;
    textarea.style.borderRadius = getComputedStyle(div).borderRadius;
    textarea.style.backgroundColor = getComputedStyle(div).backgroundColor;
    textarea.style.color = getComputedStyle(div).color;
    textarea.addEventListener("input", function() {
        if (!answered) {
            this.style.color = getComputedStyle(document.documentElement).getPropertyValue('--textColor');
        }
        this.style.height = "2em";
        this.style.height = (this.scrollHeight) + "px";
    });
    textarea.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
        }
    });
    div.parentNode.replaceChild(textarea, div);
    textarea.focus();
}

function highlightMistakes(userAnswer, correctAnswer) {
    let result = '';
    for (let i = 0; i < userAnswer.length; i++) {
        if (correctAnswer[i] === undefined) {
            result += `<span style="text-decoration: underline; color: ${colorRed};">${userAnswer[i]}</span>`;
        } else if (userAnswer[i] !== correctAnswer[i]) {
            if (userAnswer[i].toLowerCase() === correctAnswer[i].toLowerCase()) {
                result += `<span style="text-decoration: underline; color: ${colorYellow};">${userAnswer[i]}</span>`;
            } else if (userAnswer[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "") === correctAnswer[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "")) {
                result += `<span style="text-decoration: underline; color: ${colorYellow};">${userAnswer[i]}</span>`;
            } else {
                result += `<span style="text-decoration: underline; color: ${colorRed};">${userAnswer[i]}</span>`;
            }
        } else {
            result += `<span style="color: ${colorGreen};">${userAnswer[i]}</span>`;
        }
    }
    return result;
}

function nextWord() {
    document.getElementById("feedback").textContent = "Abgefragte Vokabel:";

    if (words.length === 0) {
        alert("Keine Vokabeln vorhanden.");
        return;
    }

    currentWord = selectWordBasedOnScore();
    if (!currentWord) {
        console.log("No valid word found, selecting new group.");
        selectNewGroup();
        currentWord = selectWordBasedOnScore();
    }

    if (!currentWord) {
        console.log("No valid word found after selecting new group.");
        alert("Keine gültigen Wörter gefunden.");
        return;
    }

    document.getElementById("query").textContent = currentWord.word;
    replaceDivWithTextarea(); // Replace div with textarea
    answerInput = document.getElementById("AnswerTextarea");
    answerInput.value = ""; // Eingabefeld leeren
    answerInput.style.color = getComputedStyle(document.documentElement).getPropertyValue('--textColor'); // Reset text color
    button.style.backgroundColor = buttonColorCorrect; // Reset button color

    button.textContent = "Antworten";
    answered = false;
    answerInput.focus(); // Place caret in the input field
}

function selectWordBasedOnScore() {
    const weightedWords = [];

    console.log(currentGroup.filter(word => word.score <= pointsToPass).length);

    currentGroup.forEach(word => {
        if (!recentWords.includes(word) || currentGroup.filter(word => word.score <= pointsToPass).length <= recentWords.length) {
            const weight = 3 - word.score; // Higher score means lower weight
            for (let i = 0; i < weight; i++) {
                weightedWords.push(word);
            }
        }
    });

    if (weightedWords.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * weightedWords.length);
    const selectedWord = weightedWords[randomIndex];

    // Update recent words list
    recentWords.push(selectedWord);
    const maxRecentWords = Math.min(currentGroup.filter(word => word.score < pointsToPass).length - 1, 3);
    if (recentWords.length > maxRecentWords) {
        recentWords.shift();
    }

    return selectedWord;
}

function selectNewGroup() {
    const lowScoreWords = words.filter(word => word.score < pointsToPass);
    currentGroup = lowScoreWords.slice(0, groupSize);
    console.log("New group selected:", currentGroup);
}

function isGroupCompleted() {
    return currentGroup.every(word => word.score >= pointsToPass);
}

window.onload = startQuiz;
