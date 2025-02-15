let words = [];
const textarea = document.getElementById('vocabTextarea');

textarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Initialize the height of the textarea
textarea.style.height = 'auto';
textarea.style.height = (textarea.scrollHeight) + 'px';

function addWords() {
    const vocabText = document.getElementById("vocabTextarea").value;
    const lines = vocabText.split("\n");

    for (const line of lines) {
        const parts = line.split("-");
        if (parts.length === 2) {
            const word = parts[0].trim();
            const translation = parts[1].trim();
            words.push({ word, translation, score: 0 });
        }
    }
}

function startQuiz() {

    addWords();

    if (words.length === 0) {
        alert("Bitte füge zuerst Vokabeln hinzu.");
        return;
    }

    // Store words in localStorage to pass to the quiz page
    localStorage.setItem('words', JSON.stringify(words));
    window.location.href = 'quiz.html';
}
