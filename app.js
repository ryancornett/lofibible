import { booksList, chaptersList, audio, lofi, apiRef, rate, sample } from "./data.js";
import BuildChapter from "./builder.js";

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

//#region playBackRate
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
//#endregion playBackRate

//#region lofiPlayer
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
//#endregion lofiPlayer

//#region lofiVolumeIcon
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
//#endregion lofiVolumeIcon

//#region biblePlayer
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
//#endregion biblePlayer

//#region Play/Pause Logic

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

async function playChapter() {
    await displayChapterText();
    isPlaying = false;
    biblePlayer.pause();
    biblePlayer.src = audio[booksList[bookSelector.value]][chapterSelector.value-1];
    playPauseLogic();
    // biblePlayer.onloadedmetadata = function() {
    //     let interval = 20;
    //     setInterval(ScrollVerses, interval);
    //         let chapterTimeMs = biblePlayer.duration / 1000;
    //         let distancePixels = chapterContainer.clientHeight;
    //         let step = (chapterTimeMs/distancePixels)*20;
    //         function ScrollVerses() {
    //             chapterContainer.scroll(0, step);
    //             step = step + chapterTimeMs;
    //         }
    // };
    setPlaybackRate();
};

const playPauseButton = document.querySelector('.play-pause');

playPauseButton.onclick = function handlePlayPause() {
    playPauseLogic();
};
//#endregion Play/Pause Logic

//#region Get Chapter Text
const translation = 'BSB';

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
        console.error('Error fetching data:', error);
        // You might want to handle the error in some way, e.g., returning a default value
        return null;
    }
};

const chapterContainer = document.querySelector('.chapter-container');
let theme = "dark";

async function displayChapterText() {
    chapterContainer.innerHTML = "";
    const switcherContainer = document.createElement('div');
    switcherContainer.classList.add('switcher-container');
    const switcher = document.createElement('img');
    switcher.classList.add("theme-switcher");
    switcher.src = theme == 'dark' ? "assets/sun.png" : "assets/moon.png";
    switcher.addEventListener('click', function () {
        if (theme == "dark") {
            switcher.src = "assets/moon.png";
            theme = "light";
        }
        else {
            switcher.src = "assets/sun.png";
            theme = "dark";
        }
        chapterContainer.classList.toggle("light");
        switcher.classList.toggle("light");
    });
    switcherContainer.appendChild(switcher);
    chapterContainer.appendChild(switcherContainer);

    let chapterComponents = await BuildChapter(await GetChapterData());
    chapterComponents.forEach(item => {
        chapterContainer.append(item);
    })
};

// displayChapterText();

//#endregion Get Chapter Text

//#region Footer

const app = document.querySelector('.app');
const infoModal = document.getElementById('info-modal');
const infoClickable = document.getElementById('info-clickable');
const closeInfo = document.getElementById('close-info');
infoClickable.addEventListener('click', function () {
    infoModal.showModal();
    app.classList.add('dialog-opened');
})
closeInfo.addEventListener('click', function () {
    infoModal.close();
    app.classList.remove('dialog-opened');
})

//#endregion Footer