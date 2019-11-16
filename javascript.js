// ========== select elements
let clockPieces = {
    workSign: '', playSign: '', mainDisplay: '', one: '', two: '', three: '', four: '', five: '', six: '', seven: ''
    , eight: '', pauseBtn: '', playBtn: '', stopBtn: '', resetBtn: '', workUpArrow: '', workDisplay: ''
    , workDownArrow: '', soundOn: '', soundOff: '', playUpArrow: '', playDisplay: '', playDownArrow: ''
    , switchSound: '', doneSound: ''
};

for (let key in clockPieces) {
    clockPieces[key] = document.getElementById(key);
}

const sessionSquares = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

// ========== set initial clock values
let clockValues = {
    working: true, countDownDisplay: '', workDuration: new Date(1500000) /* 25 minutes is 1500000 */
    , playDuration: new Date(300000) /* 5 minutes is 300000 */, sessionNumber: 0, maxSessions: 8
    , soundOn: true,
};

clockValues['countDownTime'] = new Date(clockValues.workDuration);

function updateAllDisplays() {
    const displays = {mainDisplay: 'countDownTime', workDisplay: 'workDuration', playDisplay: 'playDuration'};
    for (let [key, value] of Object.entries(displays)) {
        clockPieces[key].innerText = (('0' + clockValues[value].getMinutes()).slice(-2) + ":"
            + ('0' + clockValues[value].getSeconds()).slice(-2));
    }
}

updateAllDisplays();

// ========== add event listeners
window.addEventListener('mousemove', removeHighlights);
clockPieces.playBtn.addEventListener('click', startTimer);
clockPieces.resetBtn.addEventListener('click', resetClock);

// ========== setup buttons
function setZero() {
    clockValues.countDownTime.setTime(0)
}

const setSign = {
    work: () => {
        clockPieces.workSign.removeEventListener('click', setZero);
        clockPieces.workSign.classList.remove('cursorPointer');
        clockPieces.playSign.addEventListener('click', setZero);
        clockPieces.playSign.classList.add('cursorPointer');
    },
    play: () => {
        clockPieces.workSign.addEventListener('click', setZero);
        clockPieces.workSign.classList.add('cursorPointer');
        clockPieces.playSign.removeEventListener('click', setZero);
        clockPieces.playSign.classList.remove('cursorPointer');
    },
    none: () => {
        clockPieces.workSign.removeEventListener('click', setZero);
        clockPieces.workSign.classList.remove('cursorPointer');
        clockPieces.playSign.removeEventListener('click', setZero);
        clockPieces.playSign.classList.remove('cursorPointer');
    }
};

const setBtn = {
    up: (btn, func) => {
        btn.addEventListener('click', func);
        btn.classList.add('button');
        btn.classList.remove('buttonInactive');
        btn.classList.remove('buttonPressed');
    },
    down: (btn, func) => {
        btn.removeEventListener('click', func);
        btn.classList.remove('button');
        btn.classList.remove('buttonInactive');
        btn.classList.add('buttonPressed');
    },
    inactive: (btn, func) => {
        btn.removeEventListener('click', func);
        btn.classList.remove('button');
        btn.classList.add('buttonInactive');
        btn.classList.remove('buttonPressed');
    }
};

const switchStatus = {
    working: () => {
        clockValues.working = true;
        setSign.work();
        clockValues.countDownTime = new Date(clockValues.workDuration);
        updateMainDisplay(clockValues.countDownTime);
        clockValues.countDownTime.setSeconds(clockValues.countDownTime.getSeconds() - 1);
        clockPieces.workSign.classList.add('highlight');
        clockPieces.playSign.classList.remove('highlight');
        updateSquares();
        clockValues.soundOn ? clockPieces.switchSound.play() : null;
    },
    playing: () => {
        clockValues.working = false;
        setSign.play();
        clockValues.countDownTime = new Date(clockValues.playDuration);
        updateMainDisplay(clockValues.countDownTime);
        clockValues.countDownTime.setSeconds(clockValues.countDownTime.getSeconds() - 1);
        clockPieces.workSign.classList.remove('highlight');
        clockPieces.playSign.classList.add('highlight');
        ++clockValues.sessionNumber;
        clockValues.soundOn ? clockPieces.switchSound.play() : null;
    }
};

function updateSigns() {
    if (clockValues.working) {
        clockPieces.workSign.classList.add('highlight');
        clockPieces.playSign.classList.remove('highlight');
    } else {
        clockPieces.workSign.classList.remove('highlight');
        clockPieces.playSign.classList.add('highlight');
    }
}

function updateSquares() {
    for (let i = 1; i <= clockValues.maxSessions; i++) {
        if (i <= clockValues.sessionNumber) {
            clockPieces[sessionSquares[i - 1]].classList.add('highlight');
        } else {
            clockPieces[sessionSquares[i - 1]].classList.remove('highlight');
        }
    }
}

const setSound = {
    on: () => {
        clockValues.soundOn = true;
        clockPieces.soundOn.classList.add('selected');
        clockPieces.soundOff.classList.remove('selected');
    },
    off: () => {
        clockValues.soundOn = false;
        clockPieces.soundOn.classList.remove('selected');
        clockPieces.soundOff.classList.add('selected');
    },
};

// ========== main button actions
function pauseTimer() {
    clearInterval(clockValues.countDownDisplay);
    setBtn.down(clockPieces.pauseBtn, pauseTimer);
    setBtn.up(clockPieces.playBtn, startTimer);
}

function startTimer() {
    updateSigns();
    clockValues.working ? setSign.work() : setSign.play();
    clockValues.sessionNumber === 0 ? ++clockValues.sessionNumber : null;
    updateSquares();
    setBtn.up(clockPieces.pauseBtn, pauseTimer);
    setBtn.down(clockPieces.playBtn, startTimer);
    setBtn.up(clockPieces.stopBtn, stopTimer);
    clockValues.soundOn ? setSound.on() : setSound.off();
    clockValues.countDownTime.setSeconds(clockValues.countDownTime.getSeconds() - 1);
    clockValues.countDownDisplay = setInterval(function () {
        if (clockValues.countDownTime.getTime() >= 0 && clockValues.sessionNumber <= clockValues.maxSessions) {
            updateMainDisplay(clockValues.countDownTime);
            clockValues.countDownTime.setSeconds(clockValues.countDownTime.getSeconds() - 1);
        } else if (clockValues.countDownTime.getTime() < 0 && clockValues.sessionNumber <= clockValues.maxSessions) {
            clockValues.working ? switchStatus.playing() : switchStatus.working();
            clockPieces.mainDisplay.classList.remove('red');
        } else if (clockValues.sessionNumber > clockValues.maxSessions) {
            finished();
        }
        if (clockValues.countDownTime.getTime() < 60000) { /* 60,000 = 1 minute */
            clockPieces.mainDisplay.classList.add('red');
        }
    }, 1000);
}

function stopTimer() {
    setSign.none();
    clearInterval(clockValues.countDownDisplay);
    resetTimer();
    setBtn.inactive(clockPieces.pauseBtn, pauseTimer);
    setBtn.up(clockPieces.playBtn, startTimer);
    setBtn.down(clockPieces.stopBtn, stopTimer);
}

function resetClock() {
    clockValues.working = true;
    clockPieces.workSign.classList.remove('highlight');
    clockPieces.playSign.classList.remove('highlight');
    clearInterval(clockValues.countDownDisplay);
    resetTimer();
    clockValues.sessionNumber = 0;
    updateSquares();
    setBtn.inactive(clockPieces.pauseBtn, pauseTimer);
    setBtn.up(clockPieces.playBtn, startTimer);
    setBtn.inactive(clockPieces.stopBtn, stopTimer);
}

function resetTimer() {
    if (clockValues.working) {
        clockValues.countDownTime.setMinutes(clockValues.workDuration.getMinutes());
    } else {
        clockValues.countDownTime.setMinutes(clockValues.playDuration.getMinutes());
    }
    clockValues.countDownTime.setSeconds(0);
    clockPieces.mainDisplay.innerText = ('0' + clockValues.countDownTime.getMinutes()).slice(-2)
        + ":" + ('0' + clockValues.countDownTime.getSeconds()).slice(-2);
}

function updateMainDisplay(countDownTime) {
    clockPieces.mainDisplay.innerText = ('0' + countDownTime.getMinutes()).slice(-2) + ":"
        + ('0' + countDownTime.getSeconds()).slice(-2);
}

function removeHighlights() {
    window.removeEventListener('mousemove', removeHighlights);
    clockPieces.workSign.classList.remove('highlight');
    clockPieces.one.classList.remove('highlight');
    clockPieces.playBtn.classList.remove('highlight');
    clockPieces.workUpArrow.classList.remove('selected');
    clockPieces.soundOn.classList.remove('selected');
}

function finished() {
    clockValues.soundOn ? clockPieces.doneSound.play() : null;
    clockPieces.mainDisplay.innerText = 'FINISHED!';
    clearInterval(clockValues.countDownDisplay);
    setBtn.inactive(clockPieces.pauseBtn, pauseTimer);
    setBtn.inactive(clockPieces.stopBtn, stopTimer);
}

// ========== set work duration
const arrowUpdate = {
        upWork: (durationType) => {
            durationType.setMinutes(durationType.getMinutes() + 1);
            clockPieces.workDisplay.innerText = (('0' + clockValues.workDuration.getMinutes()).slice(-2) + ":"
                + ('0' + clockValues.playDuration.getSeconds()).slice(-2));
            if (clockValues.sessionNumber === 0) {
                clockValues.countDownTime = new Date(durationType);
                updateMainDisplay(clockValues.countDownTime);
            }
        },
        downWork: (durationType) => {
            durationType.setMinutes(durationType.getMinutes() - 1);
            clockPieces.workDisplay.innerText = (('0' + clockValues.workDuration.getMinutes()).slice(-2) + ":"
                + ('0' + clockValues.playDuration.getSeconds()).slice(-2));
            if (clockValues.sessionNumber === 0) {
                clockValues.countDownTime = new Date(durationType);
                updateMainDisplay(clockValues.countDownTime);
            }
        },
        upPlay:
            (durationType) => {
                durationType.setMinutes(durationType.getMinutes() + 1);
                clockPieces.playDisplay.innerText = (('0' + clockValues.playDuration.getMinutes()).slice(-2) + ":"
                    + ('0' + clockValues.playDuration.getSeconds()).slice(-2));
            },
        downPlay:
            (durationType) => {
                durationType.setMinutes(durationType.getMinutes() - 1);
                updateAllDisplays();
                clockPieces.playDisplay.innerText = (('0' + clockValues.playDuration.getMinutes()).slice(-2) + ":"
                    + ('0' + clockValues.playDuration.getSeconds()).slice(-2));
            }
    }
;

clockPieces.workUpArrow.addEventListener('click', function () {
    arrowUpdate.upWork(clockValues.workDuration);
});
clockPieces.workDownArrow.addEventListener('click', function () {
    arrowUpdate.downWork(clockValues.workDuration);
});
clockPieces.playUpArrow.addEventListener('click', function () {
    arrowUpdate.upPlay(clockValues.playDuration);
});
clockPieces.playDownArrow.addEventListener('click', function () {
    arrowUpdate.downPlay(clockValues.playDuration);
});

// ========== set sound on/off
clockPieces.soundOn.addEventListener('click', setSound.on);
clockPieces.soundOff.addEventListener('click', setSound.off);