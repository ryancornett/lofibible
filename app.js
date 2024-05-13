import { booksList, chaptersList, audio, lofi } from "./data.js";

// selectors
const bookSelector = document.getElementById('book-selector');
const chapterSelector = document.getElementById('chapter-selector');

(function InitializeBookSelectorToJohn() {
    booksList.forEach((book, index) => {
        let option = new Option(book, index);
        if (book === "John") {
            option.selected = true;
        }
        bookSelector.options[bookSelector.options.length] = option;
    });
})();
    

(function InitializeChapterSelectorForJohn1() {
    let placeholderOption = document.createElement("option");
    placeholderOption.disabled = true;
    placeholderOption.text = "--select a chapter--";
    chapterSelector.add(placeholderOption);
    
    for (let i = 1; i <= chaptersList[42]; i++) {
        let option = new Option(i, i);
        if (i === 1) {
            option.selected = true;
        }
        chapterSelector.options[chapterSelector.options.length] = option;
    }
})();


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
});

chapterSelector.addEventListener("change", playChapter);

const playbackRateSelector = document.getElementById('playback-rate-selector');
playbackRateSelector.addEventListener("click", function () {
    if (playbackRateSelector.textContent == "1.00x") {
        playbackRateSelector.textContent = "1.25x";
        biblePlayer.playbackRate = 1.25;
    }
    else if (playbackRateSelector.textContent == "1.25x") {
        playbackRateSelector.textContent = "1.50x";
        biblePlayer.playbackRate = 1.5;
    }
    else if (playbackRateSelector.textContent == "1.50x") {
        playbackRateSelector.textContent = "1.75x";
        biblePlayer.playbackRate = 1.75;
    }
    else if (playbackRateSelector.textContent == "1.75x") {
        playbackRateSelector.textContent = "2.00x";
        biblePlayer.playbackRate = 2;
    }
    else if (playbackRateSelector.textContent == "2.00x") {
        playbackRateSelector.textContent = "0.50x";
        biblePlayer.playbackRate = 0.5;
    }
    else if (playbackRateSelector.textContent == "0.50x") {
        playbackRateSelector.textContent = "0.75x";
        biblePlayer.playbackRate = 0.75;
    }
    else if (playbackRateSelector.textContent == "0.75x") {
        playbackRateSelector.textContent = "1.00x";
        biblePlayer.playbackRate = 1;
    }
});
//end selectors

// lofi player
let lofiIndex = 0;
const lofiPlayer = document.getElementById('lofi-player');
lofiPlayer.volume = 0.3;
const lofiVolumeSelector = document.querySelector('#lofi-volume');
lofiPlayer.src = lofi[lofiIndex].file;

const artistLink = document.querySelector('.artist-link');
const songTitle = document.querySelector('#song-title');
const songArtist = document.querySelector('#song-artist');
artistLink.href = lofi[lofiIndex].source;
songTitle.textContent = lofi[lofiIndex].title;
songArtist.textContent = lofi[lofiIndex].artist;


lofiPlayer.addEventListener("ended", function () {
    if (lofiIndex == lofi.length -1) { lofiIndex = 0; }
    else { lofiIndex++; }
    lofiPlayer.src = lofi[lofiIndex].file;
    lofiPlayer.play();
    songTitle.textContent = lofi[lofiIndex].title;
    songArtist.textContent = lofi[lofiIndex].artist;
});

const lofiVolumeIcon = document.getElementById('lofi-volume-icon');

lofiVolumeSelector.addEventListener('change', function () {
    lofiPlayer.volume = lofiVolumeSelector.value/100;
    if (lofiVolumeSelector.value < 6) { lofiVolumeIcon.src = "assets/muted.png"; }
    else { lofiVolumeIcon.src = "assets/audible.png"; }
})

lofiVolumeIcon.onclick = function handleQuickMute() {
    if (lofiVolumeSelector.value < 6) {
        lofiVolumeSelector.value = 30
    }
    else {
        lofiVolumeSelector.value = 0
    }
    lofiVolumeSelector.dispatchEvent(new Event('change'));
}
// end lofi player

// Bible player
const biblePlayer = document.getElementById('bible-player');
biblePlayer.src = audio["John"][0];

biblePlayer.addEventListener("ended", function () {
    if (biblePlayer.src == audio["Revelation"][21]) { handleEndOfRevelation(); }
    else if (chapterSelector.value == chaptersList[bookSelector.value]) { handleEndOfAllBooksExceptRevelation(); }
    else { handleEndOfAllChaptersExceptLastChapter(); }
    chapterSelector.dispatchEvent(new Event('change'));
})

function handleEndOfRevelation() {
    bookSelector.selectedIndex = 0;
    bookSelector.dispatchEvent(new Event('change'));
    chapterSelector.selectedIndex = 1;
}

function handleEndOfAllBooksExceptRevelation() {
    bookSelector.selectedIndex = parseInt(bookSelector.value) + 1;
    bookSelector.dispatchEvent(new Event('change'));
    chapterSelector.selectedIndex = 1;
}

function handleEndOfAllChaptersExceptLastChapter() {
    chapterSelector.selectedIndex = parseInt(chapterSelector.value) + 1;
    biblePlayer.src = audio[booksList[bookSelector.value]][chapterSelector.value];
}

//end Bible player

// play logic

let isPlaying = false;

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
};

function playChapter() {
    isPlaying = false;
    biblePlayer.pause();
    biblePlayer.src = audio[booksList[bookSelector.value]][chapterSelector.value-1];
    playPauseLogic();
    biblePlayer.onloadedmetadata = function() {
        console.log(biblePlayer.duration);
    };
    if (playbackRateSelector.textContent == "1.00x") { biblePlayer.playbackRate = 1; }
    else if (playbackRateSelector.textContent == "1.25x") { biblePlayer.playbackRate = 1.25; }
    else if (playbackRateSelector.textContent == "1.50x") { biblePlayer.playbackRate = 1.50; }
    else if (playbackRateSelector.textContent == "1.75x") { biblePlayer.playbackRate = 1.75; }
    else if (playbackRateSelector.textContent == "2.00x") { biblePlayer.playbackRate = 2; }
    else if (playbackRateSelector.textContent == "0.50x") { biblePlayer.playbackRate = 0.5; }
    else if (playbackRateSelector.textContent == "0.75x") { biblePlayer.playbackRate = 0.75; }
};

const playPauseButton = document.querySelector('.play-pause');

playPauseButton.onclick = function handlePlayPause() {
    playPauseLogic();
};
//end play logic


const translation = 'BSB';
const book = 'GEN';
const chapter = 1;

// Get Genesis 1 from the BSB translation
fetch(`https://bible.helloao.org/api/${translation}/${book}/${chapter}.json`)
    .then(request => request.json())
    .then(chapter => {
        console.log('Genesis 1 (BSB):', chapter);
});