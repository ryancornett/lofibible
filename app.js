import { booksList, chaptersList, audio, lofi } from "./data.js";

// LOFI PLAYER
let lofiIndex = 0;
const lofiPlayer = document.getElementById('lofi-player');
lofiPlayer.volume = 0.15;
lofiPlayer.src = lofi[lofiIndex].file;
const lofiInfo = document.querySelector('.lofi-info');
lofiInfo.textContent = `${lofi[lofiIndex].title} - ${lofi[lofiIndex].artist}`;
lofiPlayer.addEventListener("ended", function () {
    if (lofiIndex == lofi.length -1) {
        lofiIndex = 0;
    }
    else {
        lofiIndex++;
    }
    lofiPlayer.src = lofi[lofiIndex].file;
    lofiPlayer.play();
    lofiInfo.textContent = `${lofi[lofiIndex].title} by ${lofi[lofiIndex].artist}`;
});
// END LOFI PLAYER

const biblePlayer = document.getElementById('bible-player');
biblePlayer.src = audio["Galatians"][4];

// SELECTORS
const bookSelector = document.getElementById('book-selector');
const chapterSelector = document.getElementById('chapter-selector');

for(let book in booksList) {
    bookSelector.options[bookSelector.options.length] = new Option(booksList[book], book);
}

bookSelector.addEventListener("change", function () {
    chapterSelector.innerHTML = '';
    let placeholderOption = document.createElement("option");
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        placeholderOption.text = "--select a chapter--";
        chapterSelector.add(placeholderOption);
    for (let i = 1; i <= chaptersList[bookSelector.value]; i++) {
        chapterSelector.options[chapterSelector.options.length] = new Option(i, i);
    }
    console.log("Book selected: " + booksList[bookSelector.value]);
});

function playPauseLogic() {
    isPlaying = !isPlaying;
    if (isPlaying) {
        lofiPlayer.play();
        biblePlayer.play();
        playPauseButton.src = "assets/pause.png";
    }
    else {
        lofiPlayer.pause();
        biblePlayer.pause();
        playPauseButton.src = "assets/play.png";
    }
}

chapterSelector.addEventListener("change", PlayChapter);
//END SELECTORS

// PLAY LOGIC
function PlayChapter() {
    isPlaying = false;
    biblePlayer.pause();
    biblePlayer.src = audio[booksList[bookSelector.value]][chapterSelector.value-1];
    playPauseLogic();
}

let isPlaying = false;

const playPauseButton = document.querySelector('.play-pause');

playPauseButton.onclick = function handlePlayPause() {
    playPauseLogic();
}
//END PLAY LOGIC