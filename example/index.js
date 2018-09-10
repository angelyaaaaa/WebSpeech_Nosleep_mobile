/*
 * Check for browser support
 */
var supportMsg = document.getElementById('msg');

if ('speechSynthesis' in window) {
    supportMsg.innerHTML = 'Your browser <strong>supports</strong> speech synthesis.';
} else {
    supportMsg.innerHTML = 'Sorry your browser <strong>does not support</strong> speech synthesis.<br>Try this in <a href="https://www.google.co.uk/intl/en/chrome/browser/canary.html">Chrome Canary</a>.';
    supportMsg.classList.add('not-supported');
}

// Get the global speech synthesis item
var sphSyn = window.speechSynthesis;

// Get the text input element.
var speechMsgInput = document.getElementById('speech-msg');

// Get the voice select element.
var voiceSelect = document.getElementById('voice');

// Get the attribute controls.
var volumeInput = document.getElementById('volume');
var rateInput = document.getElementById('rate');
var pitchInput = document.getElementById('pitch');

// Get button, playlist id
var playList = document.getElementById('playList');
var audioList = playList.querySelector('.list');
var addToListButton = document.getElementById('addToList');
var playButton = document.getElementById('play');
var prevButton = document.getElementById('prev');
var prev15secButton = document.getElementById('prev-15sec');
var next15secButton = document.getElementById('next-15sec');
var nextButton = document.getElementById('next');
var repeatButton = document.getElementById('repeat');


// Manager state
var audioManager = {
    playFirstTime: true,
    playList: [],
    nowPosition: 2,
    onRepeat: true
}
loadMockData();
createPlayList(audioManager.playList);

// Fetch the list of voices and populate the voice options.
function loadVoices() {
    // Fetch the available voices.
    var voices = speechSynthesis.getVoices();

    // Loop through each of the voices.
    voices.forEach(function (voice, i) {
        // Create a new option element.
        var option = document.createElement('option');

        // Set the options value and text.
        option.value = voice.name;
        option.innerHTML = voice.name;

        // Add the option to the voice selector.
        voiceSelect.appendChild(option);
    });
}

// Execute loadVoices.
loadVoices();

// Chrome loads voices asynchronously.
sphSyn.onvoiceschanged = function (e) {
    loadVoices();
};


// Create a new utterance for the specified text and add it to
// the queue.
function speak(audioItem) {
    // Create a new instance of SpeechSynthesisUtterance.

    var msg = new SpeechSynthesisUtterance();
    for (const key in audioItem) {
        if (audioItem.hasOwnProperty(key)) {
            msg[key] = audioItem[key];
        }
    }

    // Display in each events
    var speechEvents = ['onstart','onend', 'onerror', 'onpause', 'onresume', 'onmark', 'onboundary'];
    speechEvents.forEach(function(item) {
        msg[item] = function(e) {
            // console.log('---- ' + item);
        }
    });

    msg['onboundary'] = function(e) {
        // console.log('=== charIndex ', e.charIndex);
        // console.log('=== elapsedTime ', e.elapsedTime);
        // console.log('=== name ', e.name);
        // console.log('=== === ===');
    }

    // Queue this utterance.
    sphSyn.speak(msg);
}

function createAudioItem() {
    var tempSpnSyn = {};
    // Set the text.
    tempSpnSyn.text = speechMsgInput.value;

    // Set the attributes.
    tempSpnSyn.volume = parseFloat(volumeInput.value);
    tempSpnSyn.rate = parseFloat(rateInput.value);
    tempSpnSyn.pitch = parseFloat(pitchInput.value);

    // If a voice has been selected, find the voice and set the
    // utterance instance's voice attribute.
    if (voiceSelect.value) {
        tempSpnSyn.voice = speechSynthesis.getVoices().filter(function (voice) { return voice.name == voiceSelect.value; })[0];
    }

    return tempSpnSyn;
}


addToListButton.addEventListener('click', function(e) {
    console.log('*** add to list');

    if (speechMsgInput.value.length > 0) {
        var audioItem = createAudioItem();
        audioManager.playList.push(audioItem);
        creatPlayListItem(audioManager.playList.length, audioItem.text);
    }
});

// Set up an event listener for when the 'speak' button is clicked.

playButton.addEventListener('click', function (e) {
    console.log('*** play');
    
    if (sphSyn.speaking) {
        if (sphSyn.paused) {
            sphSyn.resume();
        } else {
            sphSyn.pause();
        }
    } else {
        if (speechMsgInput.value.length > 0) {
            // WARNING! this is NOT NECCESSARY! be CAREFUL
            sphSyn.cancel();
            var audioItem = createAudioItem();
            audioManager.playList.push(audioItem);
            creatPlayListItem(audioManager.playList.length, audioItem.text);
            speak(audioItem);
        }
    }
});


prevButton.addEventListener('click', function(e) {
    console.log('*** prev');

    sphSyn.cancel();

    // Update nowPosition
    if (audioManager.nowPosition === 0) {
        if (audioManager.onRepeat) {
            audioManager.nowPosition = audioManager.playList.length - 1;        
        } else {
            return;
        }
    } else {
        audioManager.nowPosition--;
    }
    
    speak(audioManager.playList[audioManager.nowPosition]);
});


prev15secButton.addEventListener('click', function(e) {
    console.log('*** prev 15 sec');
});


next15secButton.addEventListener('click', function(e) {
    console.log('*** next 15 sec');
});

nextButton.addEventListener('click', function(e) {
    console.log('*** next');

    sphSyn.cancel();

    // Update nowPosition
    if (audioManager.nowPosition === audioManager.playList.length - 1) {
        if (audioManager.onRepeat) {
            audioManager.nowPosition = 0;        
        } else {
            return;
        }
    } else {
        audioManager.nowPosition++;
    }

    speak(audioManager.playList[audioManager.nowPosition]);
});

repeatButton.addEventListener('click', function(e) {
    console.log('*** repeat');
    
    audioManager.onRepeat = !audioManager.onRepeat;
    repeatButton.textContent = audioManager.onRepeat ? 'Repeat' : 'Un Repeat';
});

function creatPlayListItem (index, title) {
    audioList.insertAdjacentHTML('beforeend',
        `<li class="item">
            <div class="index">${index}</div>
            <div class="title">${title.slice(0, 50) + '...'}</div>
        </li>`);
}

function createPlayList(playList) {
    audioList.innerHTML = '';
    playList.forEach(function(item, idx) {
        creatPlayListItem(idx + 1, item.text);
    })
}

function loadMockData() {
    var voices = sphSyn.getVoices();
    audioManager.playList = [{
        text: 'Steven Paul Jobs was an American entrepreneur and business magnate. He was the chairman, chief executive officer (CEO), and a co-founder of Apple Inc., chairman and majority shareholder of Pixar, a member of The Walt Disney Company\'s board of directors following its acquisition of Pixar, and the founder, chairman, and CEO of NeXT.',
        volume: 0.8,
        rate: 1,
        pitch: 0.7,
        voice: voices[0]
    }, {
        text: 'William Henry Gates III is an American business magnate, investor, author, philanthropist, humanitarian, and principal founder of Microsoft Corporation.',
        volume: 0.9,
        rate: 0.7,
        pitch: 0.5,
        voice: voices[1]
    }, {
        text: 'Jeffrey Preston Bezos is an American technology entrepreneur, investor, and philanthropist. He is best known as the founder, chairman, and CEO of Amazon.',
        volume: 0.7,
        rate: 0.3,
        pitch: 0.7,
        voice: voices[2]
    }, {
        text: 'Mark Elliot Zuckerberg is an American technology entrepreneur and philanthropist. He is known for co-founding and leading Facebook as its chairman and chief executive officer.',
        volume: 0.9,
        rate: 0.5,
        pitch: 0.2,
        voice: voices[3]
    }];
} 