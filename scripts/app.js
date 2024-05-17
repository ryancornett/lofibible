import { booksList, chaptersList, audio, lofi, apiRef, rate, sample } from "./data.js";
import BuildChapter from "./builder.js";
import Footer from "./footer.js";

//#region bookSelector
const bookSelector = document.getElementById('book-selector');
(function InitializeBookSelectorToJohn() {
    booksList.forEach((book, index) => {
        let option = new Option(book, index);
        if (book === "John") {
            option.selected = true;
        }
        bookSelector.options[bookSelector.options.length] = option;
    });
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
//#endregion bookSelector

//#region chapterSelector
const chapterSelector = document.getElementById('chapter-selector');
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

chapterSelector.addEventListener("change", playChapter);
//#endregion chapterSelector

//#region interactive controls
let restartClickable = document.querySelector('.restart');
restartClickable.addEventListener('click', playChapter);

let selectedRate = 0;
const playbackRateSelector = document.getElementById('playback-rate-selector');
playbackRateSelector.addEventListener("click", function () {
    selectedRate = selectedRate == 6 ? selectedRate = 0 : ++selectedRate;
    setPlaybackRate();
});
function setPlaybackRate() {
    playbackRateSelector.textContent = Object.keys(rate[selectedRate]);
    biblePlayer.playbackRate = Object.values(rate[selectedRate]);
}

let theme = "dark";
const switcher = document.querySelector('.switcher');
switcher.classList.add("theme-switcher");
switcher.src = theme == 'dark' ? "assets/icons/sun.webp" : "assets/icons/moon.webp";
switcher.addEventListener('click', function () {
    if (theme == "dark") {
        switcher.src = "assets/icons/moon.webp";
        theme = "light";
    }
    else {
        switcher.src = "assets/icons/sun.webp";
        theme = "dark";
    }
    chapterContainer.classList.toggle("light");
});

//#endregion interactive controls

//#region lofiPlayer
function GetRandomLofiIndex(current) {
    let randomIndex = Math.floor(Math.random() * lofi.length - 1);
    if (randomIndex == current) { GetRandomLofiIndex(current); }
    else { return randomIndex; }
}

let lofiIndex = Math.floor(Math.random() * lofi.length - 1);
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
    lofiIndex = GetRandomLofiIndex(lofiIndex);
    console.log(lofiIndex);
    console.log(lofi);
    console.log(lofi[0].file);
    lofiPlayer.src = lofi[lofiIndex].file;
    lofiPlayer.play();
    songTitle.textContent = lofi[lofiIndex].title;
    songArtist.textContent = lofi[lofiIndex].artist;
});
//#endregion lofiPlayer

//#region lofiVolumeIcon
const lofiVolumeIcon = document.getElementById('lofi-volume-icon');

lofiVolumeSelector.addEventListener('change', function () {
    lofiPlayer.volume = lofiVolumeSelector.value/100;
    if (lofiVolumeSelector.value <= 5) { lofiVolumeIcon.src = "assets/icons/muted.webp"; }
    else if (lofiVolumeSelector.value > 5 && lofiVolumeSelector.value <= 20) { lofiVolumeIcon.src = "assets/icons/quiet.webp"; }
    else if (lofiVolumeSelector.value > 20 && lofiVolumeSelector.value <= 40) { lofiVolumeIcon.src = "assets/icons/medium.webp"; }
    else { lofiVolumeIcon.src = "assets/icons/loud.webp"; }
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
//#endregion lofiVolumeIcon

//#region biblePlayer
const biblePlayer = document.getElementById('bible-player');
biblePlayer.volume = 1;
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

const nextButton = document.querySelector('.next');
nextButton.onclick = function handleNextChapter() {
    biblePlayer.dispatchEvent(new Event('ended'));
}

const previousButton = document.querySelector('.previous');
previousButton.onclick = function handlePreviousChapter() {
    if (biblePlayer.src == audio["Genesis"][0]) { 
        biblePlayer.src = audio["Revelation"][21];
        bookSelector.selectedIndex = 65;
        chapterSelector.selectedIndex = chaptersList[bookSelector.value];
    }
    else if (chapterSelector.value == 1) {
        bookSelector.selectedIndex = parseInt(bookSelector.value) - 1;
        bookSelector.dispatchEvent(new Event('change'));
        chapterSelector.selectedIndex = chaptersList[bookSelector.value];
    }
    else {

        chapterSelector.selectedIndex = chapterSelector.selectedIndex - 1;
    }
    chapterSelector.dispatchEvent(new Event('change'));
}

//#endregion biblePlayer

//#region Play/Pause Logic

let isPlaying = false;

function playPauseLogic() {
    isPlaying = !isPlaying;
    if (isPlaying) {
        lofiPlayer.play();
        biblePlayer.play();
        playPauseButton.src = "assets/icons/pause.webp";
    }
    else {
        lofiPlayer.pause();
        biblePlayer.pause();
        playPauseButton.src = "assets/icons/play.webp";
    }
};

async function playChapter() {
    await displayChapterText();
    isPlaying = false;
    biblePlayer.pause();
    biblePlayer.src = audio[booksList[bookSelector.value]][chapterSelector.value-1];
    playPauseLogic();
    setPlaybackRate();
};

const playPauseButton = document.querySelector('.play-pause');

playPauseButton.onclick = function handlePlayPause() {
    playPauseLogic();
};
//#endregion Play/Pause Logic

//#region Get Chapter Text
const translation = 'BSB';
const chapterContainer = document.querySelector('.chapter-container');

async function GetChapterData() {
    let bookIndex = parseInt(bookSelector.value);
    try {
        const response = await fetch(`https://bible.helloao.org/api/${translation}/${apiRef[bookIndex]}/${chapterSelector.value}.json`);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const chapter = await response.json();
        return chapter;
    } catch (error) {
        console.log(error);
        chapterContainer.textContent = "An error occurred. Please try again.";
        return null;
    }
};

const attributionNotice = document.createElement('p');
attributionNotice.classList.add('attribution');
attributionNotice.textContent = "The Holy Bible, Berean Standard Bible, BSB is produced in cooperation with Bible Hub, Discovery Bible, OpenBible.com, and the Berean Bible Translation Committee. This text of God's Word has been dedicated to the public domain.";

async function displayChapterText() {
    chapterContainer.innerHTML = "";
    try {
        let chapterComponents = await BuildChapter(await GetChapterData());
        chapterComponents.forEach(item => {
            chapterContainer.append(item);
        })
        chapterContainer.appendChild(attributionNotice);
    } catch (error) {
        console.log(error);
        chapterContainer.textContent = "An error occurred. Please try again.";
    }
};

displayChapterText();

//#endregion Get Chapter Text

Footer();
