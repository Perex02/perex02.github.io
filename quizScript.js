let words = JSON.parse(localStorage.getItem('words')) || [];
let currentWord;
let button;
let answered = false;
let answerInput;
let recentWords = [];
let currentGroup = [];
const groupSize = 10;
const pointsToPass = 2;

function startQuiz() {
    if (words.length === 0) {
        alert("Keine Vokabeln vorhanden.");
        return;
    }

    // Initialize button variables after the DOM is fully loaded
    button = document.getElementById("button");
    answerInput = document.getElementById("AnswerTextarea");

    // Add event listener for Enter key press
    answerInput.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            if (!answered) {
                checkAnswer();
            } else {
                nextWord();
            }
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
        currentWord.score += 1;
    } else {
        document.getElementById("feedback").textContent = "Leider Falsch...";
        document.getElementById("query").textContent = `${currentWord.word} - ${correctAnswer}`;
        currentWord.score -= 1;
    }

    button.textContent = "Weiter";
    answered = true;

//    console.log("Current word score:", currentWord.score);
    currentGroup.forEach(word => {
        console.log(`${word.word} - ${word.translation}: ${word.score}`);
    });
    console.log("Recent words:", recentWords.map(word => word.word));

    if (isGroupCompleted()) {
        selectNewGroup();
    }
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

//    console.log("Current word set to:", currentWord);
    document.getElementById("query").textContent = currentWord.word;
    answerInput.value = ""; // Eingabefeld leeren

    button.textContent = "Antworten";
    answered = false;
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
