// STORAGE
const songDB = [
{
	title: "42 karat", 
	artist: "Bruno Mars",
	cover: "img/album-cover1.jpg",
	loved: false,
	src: "https://archive.org/download/78_the-happy-monster_chubby-jackson-and-his-orchestra-jackson-bauer_gbia0005336b/The%20Happy%20Monster%20-%20Chubby%20Jackson%20and%20his%20Orchestra.mp3"
},
{
	title: "Roar",
	artist: "Katy Perry",
	cover: "img/album-cover2.jpg",
	loved: false,
	src: "https://archive.org/download/78_la-vie-en-rose_the-bernard-peiffer-trio-bernard-peiffer-bill--clark-joe-benjamin_gbia0005289b/La%20Vie%20En%20Rose%20-%20The%20Bernard%20Peiffer%20Trio.mp3"
},
{
	title: "November Rain", 
	artist: "Guns N Roses",
	cover: "img/album-cover3.jpg",
	loved: false,
	src: "https://archive.org/download/78_gloomy-sunday-the-famous-hungarian-suicide-song_billie-holiday-lewis-seress_gbia0008324b/Gloomy%20Sunday%20%28The%20Famous%20Hungarian%20Suici%20-%20Billie%20Holiday.mp3"
},
{
	title: "Kiss",
	artist: "Prince",
	cover: "img/album-cover4.jpg",
	loved: false,
	src: "https://archive.org/download/78_deep-purple_jimmy-dorsey-and-his-orchestra-bob-eberly-peter-de-rose-mitchell-parris_gbia0013895a/Deep%20Purple%20-%20Jimmy%20Dorsey%20And%20His%20Orchestra.mp3"
},
{
	title: "Sweet Home Alabama", 
	artist: "Lynard Skynard",
	cover: "img/album-cover5.jpg",
	loved: false,
	src: "https://archive.org/download/78_hey-now-hey-now_hill-calloway-cab-calloway-and-his-orchestra_gbia0000344a/Hey%20Now%2C%20Hey%20Now%20-%20Hill%20-%20Calloway%20-%20Cab%20Calloway%20and%20his%20Orchestra.mp3"
}];

let currentSong = {
	index: null,
	id: null,
	title: null,
	artist: null,
	cover: null,
	src: null,
	playBtn: null,
	isPlaying: false,
	toRepeat: false,
	toShuffle: false
}

// Loads song list
$("document").ready(function () {
	loadSongList()
})

// Creates poppers
var popupVol = $("#popupVol")
//popupVol.hide()
isPopupVis = false

// Audio settings
var player = new Audio()
var isMuted = false

// Timers
let runningInterval

// Add event handlers
$('body').on('dblclick', '.songContainer', loadTrack);
$('body').on('click', '.fa-play-circle', play);
$('body').on('click', '.fa-pause-circle', pause);
$('body').on('click', '.fa-backward', playPrevTrack);
$('body').on('click', '.fa-forward', playNextTrack);
$('body').on('click', '.fa-volume-up', toggleVolumeBar);
$('body').on('dblclick', '#volIcon', mute);
$('body').on('click', '.volInput', changeVol);
$('body').on('click', '.progressBarEmpty', loadTrack);
$('body').on('click', '.fa-redo', repeat);
$('body').on('click', '.fa-random', shuffle);
$('body').on('click', '#test', test);
$('body').on('click', '.fa-heart', loved);

function test () {
	TweenMax.to("#test", 4, {x:300})
}

// Functions
function loadSongList() {
	let src = "img/album-cover"
	
	for (let i = 0; i < songDB.length; i++) {
		let songSrc = src.concat(i+1 + ".jpg")
		$(`<div class='songContainer canHover' data-index=${i}>`)
		.appendTo("#songList")
		.addClass("song d-flex justify-content-between align-items-center")
		.append(`<img class='coverImg' src= ${ songDB[i].cover }>`)
		.append(`
				<div class="d-flex flex-column">
					<p class="flex-fill d-flex justify-content-center">${ songDB[i].artist }</p>
					<p class="flex-fill d-flex justify-content-center">${ songDB[i].title }</p>
				</div>
				<i id="smallPlayButton" class="fas fa-play-circle"></i>
				`)
		.attr("data-src", songDB[i].src)
	}
	TweenMax.from($(".songContainer"), 0.5, {x:-100, opacity: 0})
}

// trackToChange is either a number if it comes from prev- or nextTrack, or an event object if it comes from a songContainer or progressBarEmpty click
function loadTrack(trackToChange) {
	console.log("loading track")

	let newSong = {index: null}

	let songLength
	let secondsPlayed
	let percentPlayed
	let progBarWidthPx = $(".progressBarEmpty").css("width") 
	let progBarWidth = progBarWidthPx.replace("px", "")
	let percentChangePerSecond
	
	//if fn call doesn't come from prog bar (hence from either songContainer or next track)
	if ( !$(this).hasClass("progressBarEmpty") ) {
		console.log("came from songContainer")

		//removes highlight from previous track(s), before hightlighting clicked track, 
		$(".songContainer.playing").removeClass("playing").addClass("canHover")


		// if coming from songContainer, make that the song, otherwise use the trackToChange provided by next- and prevTrack
		if ( $(this).hasClass("songContainer") ) {
			$(this).removeClass("canHover")
			$(this).addClass("playing")
			newSong.index = $(this).data("index")
		} else if (trackToChange || trackToChange === 0) {
			$( `.songContainer[data-index= ${trackToChange} ]` ).removeClass("canHover").addClass("playing")
			newSong.index = trackToChange
		}

		//If new song is different from playing song
		if (newSong.index != currentSong.index) {
			//must remove the pause icon and track highlight before anything else
			$(currentSong.playBtn).removeClass("fa-pause-circle").addClass("fa-play-circle")
			
			//copies all db data to currentSong object
			currentSong.index = newSong.index
			currentSong.id = `[data-index=${currentSong.index}]`
			currentSong.title = songDB[currentSong.index].title
			currentSong.artist = songDB[currentSong.index].artist
			currentSong.cover = songDB[currentSong.index].cover
			currentSong.src = songDB[currentSong.index].src
			currentSong.playBtn = $(currentSong.id).find("#smallPlayButton")

			//updates info to places that display it
			$(".currentTitle").html(currentSong.title)
			$(".currentArtist").html(currentSong.artist)
			$(".currentCover").attr('src', currentSong.cover)
			TweenMax.from($(".turntable.currentCover"), 0.5, {x:-70, opacity: 0})

			//Set song source
			player.src = currentSong.src

			secondsPlayed = 0
			percentPlayed = 0

		//if you're clicking on the already playing song...	
		} else {
			if (!currentSong.toRepeat) {
				//call att to turntable - song is already playing
				$("#turntable").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
			} else {
				player.currentTime = 0
				$(".progressBarFill").css("width", "0")
				play()
			}
		}	

	//else if call came from wanting to scrub
	} else if ( $(this).hasClass("progressBarEmpty") ) {
		console.log("scrubbing")

		if (currentSong.index) {
			let locOnXaxis = trackToChange.offsetX
			songLength = player.duration
			secondsPlayed = ( locOnXaxis / progBarWidth ) * songLength
			percentPlayed = secondsPlayed / songLength
			percentPlayed = percentPlayed * 100
			percentChangePerSecond = 100 / songLength
		
			player.currentTime = secondsPlayed
		} else {
			console.log("can't scrub: no song loaded")
		}
	}

	var fillBarWidth
	var emptyBarWidth

	$(".progressBarFill").css("width", `${ percentPlayed }%`)	

	$(player).on('canplay', setTimer)

	function setTimer() {
		clearInterval(runningInterval)
		play()
				
		songLength = player.duration //could be problematic, maybe not
		percentChangePerSecond = 100 / songLength
		percentChangePerSecond = percentChangePerSecond / 100

		let counter = 0

		var progInterval = setInterval(function () {
			fillBarWidth = $(".progressBarFill").css("width")
			fillBarWidth = fillBarWidth.replace("px", "")
			fillBarWidth = Number(fillBarWidth)
			emptyBarWidth = $(".progressBarEmpty").css("width")
			emptyBarWidth = emptyBarWidth.replace("px", "")
			emptyBarWidth = Number(emptyBarWidth)

			let pixelsIn = percentChangePerSecond * emptyBarWidth
			
			counter++
			console.log(counter)

			if (currentSong.isPlaying) {
				if (fillBarWidth < emptyBarWidth) {
					$(".progressBarFill").css("width", `+=${ pixelsIn }px`)
				} else {
					$(".progressBarFill").css("width", `${ emptyBarWidth }`)
					console.log("stopping")
					playNextTrack()
					clearInterval(runningInterval)
				}
			}
		}, 1000)

		progInterval

		runningInterval = progInterval
	}
}

function play() {
	console.log("playing")
	//Only play if a track is loaded (if there is a number in the index, including 0)
	TweenMax.to(this, 0.1, {ease: Power2.easeOut, y: -5, repeat: 1, yoyo: true })

	if (currentSong.index || currentSong.index === 0)	{
		//Play track
		player.play()
		currentSong.isPlaying = true
		loadProgress()
		//Change big play button to pause
		$("#bigPlayButton").removeClass("fa-play-circle").addClass("fa-pause-circle")
		//Change the songList's selected songContainer's play button to pause
		$(currentSong.playBtn).removeClass("fa-play-circle").addClass("fa-pause-circle")

	} else {
		console.log("Can't play: no song loaded")
	}
}

function pause() {
	console.log("pausing")

	TweenMax.to(this, 0.1, {ease: Power2.easeOut, y: -5, repeat: 1, yoyo: true })

	//Pause track
	player.pause()
	currentSong.isPlaying = false
	//Change big pause button to play
	$("#bigPlayButton").removeClass("fa-pause-circle").addClass("fa-play-circle")
	//Change the songList's selected songContainer's pause button to play
	$(currentSong.playBtn).removeClass("fa-pause-circle").addClass("fa-play-circle")
}

function loadProgress() {
	console.log("Loading progress boss!")
	$(player).on("canplay", load())

	function load () {
		$(".elapsedTime").text(player.currentTime)
	}
}

function repeat() {
	currentSong.toRepeat = !currentSong.toRepeat
	if (currentSong.toRepeat) {
		$(".fa-redo").css("color", "green")
		console.log("repeating on")
	} else {
		$(".fa-redo").css("color", "inherit")
		console.log("repeating off")
	}
}

function shuffle() {
	if (currentSong.toShuffle || currentSong.toShuffle === 0) {
		currentSong.toShuffle = false
		$(".fa-random").css("color", "inherit")
		console.log("shuffling off")
	} else {
		let randomSongIndex = Math.floor(Math.random() * songDB.length);
		currentSong.toShuffle = randomSongIndex
		$(".fa-random").css("color", "green")
		console.log("shuffling on")
		console.log("song to shuffle to: " + currentSong.toShuffle)
	}
}

function playPrevTrack() {
	console.log("previous track")

	TweenMax.to(".fa-backward", 0.1, {ease: Power2.easeOut, y: -5, repeat: 1, yoyo: true })

	let prevTrack
	//does currentSong.index have a value? Is something playing?
	if (currentSong.index || currentSong.index === 0) {
		currentSong.index === 0 ? prevTrack = songDB.length - 1 : prevTrack = currentSong.index - 1
		loadTrack(prevTrack)
	} else {
		console.log("Can't change track: nothing's playing")
		return
	}
}

function playNextTrack() {
	console.log("next track")
	// Can come from:
	// shuffle
	// repeat
	// or loadTrack

	TweenMax.to(".fa-forward", 0.1, {ease: Power2.easeOut, y: -5, repeat: 1, yoyo: true })

	let nextTrack
	let shuffleOn
	let repeatOn
	let newRandomSong = Math.floor(Math.random() * songDB.length)

	// if repeat and shuffle are off, play next track
	// if shuffle is on, next song = shuffle song
	// if repeat is on, next song = current song

	//does currentSong.index have a value? Is something playing?
	if (currentSong.isPlaying) {

		currentSong.toShuffle || currentSong.toShuffle === 0 ? shuffleOn = true : shuffleOn = false
		currentSong.toRepeat ? repeatOn = true : repeatOn = false

		// if shuffle and repeat are off
		if (!repeatOn && !shuffleOn) {
			currentSong.index === (songDB.length - 1) ? nextTrack = 0 : nextTrack = currentSong.index + 1
		// if repeat is on
		} else if (repeatOn) {
			nextTrack = currentSong.index
		// if shuffle is on
		} else if (shuffleOn) {
			if (newRandomSong === currentSong.index) {
				newRandomSong++
			}
			nextTrack = newRandomSong
		}
		loadTrack(nextTrack)
	} else {
		console.log("Can't change track: nothing's playing")
		return
	}
}

function toggleVolumeBar() {
	console.log("toggle volume bar")
	if (isPopupVis) {
		popupVol.hide()
		popupVol.removeClass("d-flex align-items-end")
	} else {
		popupVol.show()
		popupVol.addClass("d-flex align-items-end")
	}
	isPopupVis = !isPopupVis
	var popper = new Popper($(".fa-volume-up"), popupVol, {
		placement: 'top'
	})
}

function changeVol (event) {
	let locOnYaxis = event.offsetY
	let volInnerBarHeight = $(".innerBar").css("height")
	volInnerBarHeight = volInnerBarHeight.replace("px", "")
	let decreaseInVol = locOnYaxis / volInnerBarHeight

	let setVolTo = 1 - decreaseInVol
	player.volume = setVolTo
	let volBarHeight = setVolTo * volInnerBarHeight
	$(".volDisplay").css("height", `${ volBarHeight }px`)
}

function mute() {
	console.log("muting")
	console.log(isMuted)
	if (isMuted) {
		$(this).removeClass("fa-volume-off").addClass("fa-volume-up")
		player.volume = 1
	} else {
		$(this).removeClass("fa-volume-up").addClass("fa-volume-off")
		player.volume = 0	
	}
	isMuted = !isMuted
	console.log(isMuted)
}

function loved () {
	let isSongLoved = songDB[currentSong.index].loved
	let lovedTimeline = new TimelineMax()
	if (isSongLoved) {
		lovedTimeline.to(".fa-heart", 0.1, {ease: Power1.easeOut, y: -5, repeat: 1, yoyo: true})
		.to(".fa-heart", 0.2, {ease: Power1.easeOut, color: "white"}, "-=0.2")	
	} else {
		lovedTimeline.to(".fa-heart", 0.1, {ease: Power1.easeOut, y: -5, repeat: 1, yoyo: true})
		.to(".fa-heart", 0.2, {ease: Power1.easeOut, color: "red"}, "-=0.2")	
	}
	songDB[currentSong.index].loved = !songDB[currentSong.index].loved
}

function test () {
	let tl = new TimelineMax( {repeat:2} )

	//tl.to("#test", 1, {left:100}).to("#test", 1, {top:50}).to("#test", 1, {opacity:0})
	
	tl.to("#test", 1, {x: "100px"})
	.to("#test", 1, {color: "red"})
	.to("#test", 1, {borderColor: "red"})
	.to("#test", 1, {width: "100px", height: "100px"})
	console.log(tl.to)
}
