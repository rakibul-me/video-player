const video = document.getElementById('video');
const controls = document.querySelectorAll('.controls');
const controlsBottom = document.querySelector('.controls-bottom');
const slider = document.getElementById('slider');
const uiSlider = document.getElementsByClassName('noUi-connects');
const playButton = document.getElementById('playpause');
const playButtonReplay = playButton.querySelector('.replay');
const playButtonIcons = document.querySelectorAll('#playpause svg');
const previousButton = document.getElementById('previous');
const nextButton = document.getElementById('next');
const volume = document.getElementById('volume');
const volumeButton = document.getElementById('volume-button');
const volumeIcons = document.querySelectorAll('#volume-button svg');
const volumeMute = volumeButton.querySelector('.mute');
const volumeLow = volumeButton.querySelector('.low');
const volumeHigh = volumeButton.querySelector('.high');
const timeElapsed = document.getElementById('time-elapsed');
const duration = document.getElementById('video-duration');
const playbackAnimation = document.getElementById('playback-animation');
const playbackIcons = playbackAnimation.querySelectorAll('svg');
const fullScreenButton = document.getElementById('fullscreen');
const videoContainer = document.getElementById('video-container');
const goFullscreenIcon = fullScreenButton.querySelector('.go');
const exitFullscreenIcon = fullScreenButton.querySelector('.exit');
const pipButton = document.getElementById('picture-in-picture');
const sliderTooltip = document.getElementsByClassName('slider-tooltip');
const videoSource = document.getElementById('video-source');

const url = window.location.href;
const source = new URL(url).searchParams.get('source');
const poster = new URL(url).searchParams.get('poster');

let hidingTimeout;

if (source) {
    videoSource.setAttribute('src', source);
    video.load();
}
if (poster) {
    video.setAttribute('poster', poster);
    video.load();
}

const videoWorks = !!document.createElement('video').canPlayType;

if (videoWorks) {
    video.controls = false;
    controls.forEach(con => {
        con.classList.remove('hidden');
    });
}

//slider
noUiSlider.create(slider, {
    start: [0],
    behaviour: 'drag-tap',
    step: 1,
    margin: 0,
    padding: 0,
    connect: 'lower',
    format: wNumb({
        decimals: 2,
    }),
    range: {
        'min': 0,
        'max': 1
    },
});


function formatTime(timeInSeconds) {
    const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);

    return {
        minutes: result.substr(3, 2),
        seconds: result.substr(6, 2),
    };
}

function initializeVideo() {
    const videoDuration = Math.round(video.duration);
    const time = formatTime(videoDuration);
    slider.noUiSlider.updateOptions({
        range: {
            'min': 0,
            'max': videoDuration
        },

    });
    duration.innerText = `${time.minutes}:${time.seconds}`;
    duration.setAttribute('datetime', `${time.minutes}m ${time.minutes}s`);
}

video.addEventListener('loadedmetadata', initializeVideo);

function togglePlay() {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
}

function updatePlayButtonIcons() {
    let i;
    let length = playButtonIcons.length;
    for (i = 0; i < length; i++) {
        playButtonIcons[i].classList.add('hidden');
    }
    if (video.paused) {
        playButtonIcons[0].classList.remove('hidden');
    } else {
        playButtonIcons[1].classList.remove('hidden');
    }
    togglePlaybackIcons();
}

function togglePlaybackIcons() {
    playbackIcons.forEach(icon => {
        icon.classList.toggle('hidden');
    })
}

playButton.addEventListener('click', togglePlay);
playbackAnimation.addEventListener('click', togglePlay);
playButton.addEventListener('click', updatePlayButtonIcons);
playbackAnimation.addEventListener('click', updatePlayButtonIcons);
video.addEventListener('click', togglePlay);
video.addEventListener('click', updatePlayButtonIcons);

function animatePlayBack() {
    playbackAnimation.animate([
        {
            opacity: 1,
            transform: "translate(-50%, -50%) scale(1)",
        },
        {
            opacity: 0,
            transform: "translate(-50%, -50%) scale(1.3)",
        }
    ], {
        duration: 500,
    })
}

video.addEventListener('click', animatePlayBack);


function updateVolume() {
    if (video.muted) {
        video.muted = false;
    }
    video.volume = volume.value;
}

volume.addEventListener('input', updateVolume);

function updateVolumeIcon() {
    volumeIcons.forEach(icon => {
        icon.classList.add('hidden');
    });

    volumeButton.setAttribute('data-title', 'Mute (m)')

    if (video.muted || video.volume === 0) {
        volumeMute.classList.remove('hidden');
        volumeButton.setAttribute('data-title', 'Unmute (m)')
    } else if (video.volume > 0 && video.volume <= 0.5) {
        volumeLow.classList.remove('hidden');
    } else {
        volumeHigh.classList.remove('hidden');
    }
}

video.addEventListener('volumechange', updateVolumeIcon);

function toggleMute() {
    video.muted = !video.muted;

    if (video.muted) {
        volume.setAttribute('data-volume', video.volume);
        volume.value = 0;
    } else {
        volume.value = volume.dataset.volume;
    }
}

volumeButton.addEventListener('click', toggleMute);

function showControls() {
    clearTimeout(hidingTimeout);
    controlsBottom.classList.remove('hidden');
}
function hideControls() {
    if (video.paused || video.ended) {
        return;
    }
    hidingTimeout = setTimeout(()=>{
        controlsBottom.classList.add('hidden');
    }, 4000);

}

video.addEventListener('mouseenter', showControls);
// video.addEventListener('mousemove', showControls);
video.addEventListener('mouseover', hideControls);
video.addEventListener('mouseleave', hideControls);
controlsBottom.addEventListener('mouseenter', showControls);
// controlsBottom.addEventListener('mousemove', showControls);
controlsBottom.addEventListener('mouseover', hideControls);
controlsBottom.addEventListener('mouseleave', hideControls);

function updateTimeElapsed() {
    const time = formatTime(Math.round(video.currentTime));
    timeElapsed.innerText = `${time.minutes}:${time.seconds}`;
    timeElapsed.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`);
    checkReplay();
}

function checkReplay() {
    if (video.ended) {
        playButtonIcons.forEach(icon => {
            icon.classList.add('hidden');
        });
        playButtonReplay.classList.remove('hidden');
    }
}

video.addEventListener('timeupdate', updateTimeElapsed);


function toggleFullScreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
        updateFullscreenButton(2);
    } else if (document.webkitFullscreenElement) {
        document.webkitExitFullscreen();
        updateFullscreenButton(2);
    } else if (videoContainer.webkitRequestFullscreen) {
        videoContainer.webkitRequestFullscreen();
        updateFullscreenButton(1);
    } else {
        videoContainer.requestFullscreen();
        updateFullscreenButton(1);
    }
}

fullScreenButton.onclick = toggleFullScreen;


function updateFullscreenButton(num) {
    if (num === 1) {
        exitFullscreenIcon.classList.remove('hidden');
        goFullscreenIcon.classList.add('hidden');
        fullScreenButton.setAttribute('data-title', 'Exit full screen (f)');
    }
    if (num === 2) {
        goFullscreenIcon.classList.remove('hidden');
        exitFullscreenIcon.classList.add('hidden');
        fullScreenButton.setAttribute('data-title', 'Fullscreen (f)');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!('pictureInPictureEnabled' in document)) {
        pipButton.classList.add('hidden');
    }
});

// togglePip toggles Picture-in-Picture mode on the video
async function togglePip() {
    try {
        if (video !== document.pictureInPictureElement) {
            pipButton.disabled = true;
            await video.requestPictureInPicture();
        } else {
            await document.exitPictureInPicture();
        }
    } catch (error) {
        console.error(error)
    } finally {
        pipButton.disabled = false;
    }
}

pipButton.addEventListener('click', togglePip);

function showSliderTooltip(event) {
    sliderTooltip[0].style.display = 'inline-block';
    let offset = event.clientX - video.getBoundingClientRect().left - Number(window.getComputedStyle(controlsBottom, null).getPropertyValue('padding-left').toString().split('p')[0]);
    sliderTooltip[0].style.left = offset + "px";
    const posTime = Math.round((offset / event.target.clientWidth) * parseInt(video.duration, 10));
    const time = formatTime(posTime);
    sliderTooltip[0].innerText = `${time.minutes}:${time.seconds}`;
}

function hideSliderTooltip() {
    sliderTooltip[0].style.display = 'none';
}

uiSlider[0].addEventListener('mousemove', showSliderTooltip);
uiSlider[0].addEventListener('mouseleave', hideSliderTooltip);
const tooltip = document.createElement('div');
tooltip.classList.add('slider-tooltip');
uiSlider[0].appendChild(tooltip);


function keyboardShortcuts(e) {
    switch (e.key) {
        case 'b': case 'B': previousVideo(); break;
        case 'k': case 'K': case ' ': togglePlay(); updatePlayButtonIcons(); break;
        case 'n': case 'N': nextVideo(); break;
        case 'm': case 'M': toggleMute(); break;
        case 'p': case 'P': togglePip(); break;
        case 'f': case 'F': toggleFullScreen(); break;
        case 'ArrowLeft': video.currentTime -= 10; break;
        case 'ArrowRight': video.currentTime += 10; break;
        default: return;
    }
}

document.addEventListener('keyup', keyboardShortcuts);


slider.noUiSlider.on('change', (values, handle) => {
    video.currentTime = values[handle];
});
slider.noUiSlider.on('change', function () {
    slider.noUiSlider.set(this.value);
});

function updateProgress() {
    slider.noUiSlider.set(video.currentTime);
}

// timeElapsed.addEventListener('change', updateProgress);
let currentTime = video.currentTime;
setInterval(() => {
    if (currentTime !== video.currentTime) {
        updateProgress();
    }
    currentTime = video.currentTime
}, 100);
