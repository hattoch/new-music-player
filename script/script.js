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
	src: "songs/heynow.mp3"
}]

let currentSong = {
	index: null,
	id: null,
	title: null,
	artist: null,
	cover: null,
	src: null,
	playBtn: null,
	shouldRepeat: false,
	shouldShuffle: false,
	isLoved: null
}

// Creates poppers
var popupVol = $("#popupVol")
//popupVol.hide()
isPopupVis = false

// Animations


// Audio settings
var player = new Audio()
var isMuted = false
var isPlaying = false
var playlistFolderOpen = false

// Timers
let runningInterval = 0

// Add event handlers
$(document).on('dblclick', '.songContainer', loadTrack);
$(document).on('click', '.fa-play-circle', play);
$(document).on('click', '.fa-pause-circle', play);
$(document).on('click', '.fa-backward', playPrevTrack);
$(document).on('click', '.fa-forward', playNextTrack);
$(document).on('click', '.fa-volume-up', toggleVolumeBar);
$(document).on('dblclick', '#volIcon', mute);
$(document).on('click', '.volInput', changeVol);
$(document).on('click', '.progressBarEmpty', setProgress);
$(document).on('click', '.fa-redo', repeat);
$(document).on('click', '.fa-random', shuffle);
$(document).on('click', '#test', test);
$(document).on('click', '.fa-heart', loved);
$(document).on('click', '.fa-plus-circle', addToPlaylist);
$(document).on('click', '.playlist-tab', openPlaylistFolder)
$(document).on('click', '.playlist', loadSongList)

function test () {
	TweenMax.to("#test", 4, {x:300})
}

// Functions
function loadSongList() {
	let playListIndex = $(this).data("index")	
	let playlistJSON
	let playlistSongs
	let toLoad
	let plTimeline = new TimelineMax()

	$('#songList').empty()
	$('.playlist-menu').empty()
	plTimeline.to('.playlist-menu', 0.1, {ease: Power2.easeOut, height: "0%"}).to('.saved-playlists', 0.1, {opacity: 0})

	$.getJSON('./playlists/playlists.json',{}, function( data ) { 
	  playlistJSON = data
	  playlistSongs = playlistJSON.playlists[playListIndex].containsSongs

	  for (let i = 0; i < playlistSongs.length; i++) {
	  	
		$('#songList').append(`<div class='songContainer canHover d-flex justify-content-between align-items-center' data-index=${i} data-src=${songDB[playlistSongs[i]].src}>
								<img class='coverImg' src= ${ songDB[playlistSongs[i]].cover }>
								<div class="d-flex flex-column ">
									<p class="flex-fill d-flex justify-content-center">${ songDB[playlistSongs[i]].artist }</p>
									<p class="flex-fill d-flex justify-content-center">${ songDB[playlistSongs[i]].title }</p>
								</div>
								<i id="smallPlayButton" class="fas fa-play-circle"></i>
								</div>`
								)
		}
	})
	
	TweenMax.from($(".songContainer"), 0.5, {x:-100, opacity: 0})
}

// trackToChange is either a number if it comes from prev- or nextTrack, or an event object if it comes from a songContainer or progressBarEmpty click
function loadTrack(trackToChange) {
	console.log("loading track")

	let newSong = {index: null}

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

	//must remove the pause icon and track highlight before anything else
	$(currentSong.playBtn).removeClass("fa-pause-circle").addClass("fa-play-circle")//**
	
	//copies all db data to currentSong object
	currentSong.index = newSong.index
	currentSong.id = `[data-index=${currentSong.index}]`
	currentSong.title = songDB[currentSong.index].title
	currentSong.artist = songDB[currentSong.index].artist
	currentSong.cover = songDB[currentSong.index].cover
	currentSong.src = songDB[currentSong.index].src
	currentSong.playBtn = $(currentSong.id).find("#smallPlayButton")
	currentSong.isLoved = songDB[currentSong.index].loved

	//updates info to places that display it
	$(".currentTitle").text(currentSong.title)
	$(".currentArtist").text(currentSong.artist)
	$(".currentCover").attr('src', currentSong.cover)
	TweenMax.from($(".turntable.currentCover"), 0.5, {x:-70, opacity: 0})

	//Set song source
	player.src = currentSong.src

	let isSongLoved = songDB[currentSong.index].loved
	if (isSongLoved) {
		$(".fa-heart").css("color", "red")
	} else {
		$(".fa-heart").css("color", "white")
	}

	if (runningInterval === 0) {
		console.log("not running")
	} else {
		clearInterval(runningInterval)
	}
	
	isPlaying = false
	$(player).one('canplaythrough', play) //**
}

function play() {
	let songIsLoaded = currentSong.index || currentSong.index === 0

	TweenMax.to(this, 0.1, {ease: Power2.easeOut, y: -5, repeat: 1, yoyo: true })

	if (songIsLoaded) {
		if (isPlaying) {
			console.log("pausing")
			player.pause()
			//Change pause buttons to play
			$("#bigPlayButton").removeClass("fa-pause-circle").addClass("fa-play-circle")
			$(currentSong.playBtn).removeClass("fa-pause-circle").addClass("fa-play-circle")
			clearInterval(runningInterval)
		} else {
			console.log("playing")
			player.play()
			isPlaying = !isPlaying	
			//Change play buttons to pause
			$("#bigPlayButton").removeClass("fa-play-circle").addClass("fa-pause-circle")
			$(currentSong.playBtn).removeClass("fa-play-circle").addClass("fa-pause-circle")
			setProgress()
		}

	} else {
		console.log("Can't play: no song loaded")
	}
}

function setProgress(event) {
	console.log("setting progress")

	let elapsedTime
	let songLength = player.duration
	let secondsPlayed
	let percentPlayed
	let percentChangePerSecond = 100 / songLength
	let progBarWidthPx = $(".progressBarEmpty").css("width") 
	let progBarWidth = progBarWidthPx.replace("px", "")

	let fromProgBar = $(this).hasClass("progressBarEmpty")

	//came from scrubbing
	if (fromProgBar) {
		let locOnXaxis = event.offsetX
		secondsPlayed = ( locOnXaxis / progBarWidth ) * songLength
		player.currentTime = secondsPlayed
		clearInterval(runningInterval)
	//and if not, instead from play:
	} else {
		secondsPlayed = player.currentTime
	}

	let fillBarWidth
	let emptyBarWidth
	
	percentPlayed = (secondsPlayed / songLength) * 100
	$(".progressBarFill").css("width", `${ percentPlayed }%`)

	$(".progressBarFill").css("width", `${ percentPlayed }%`)

	let time = Math.ceil(player.duration)
	let min = Math.floor( time/60 )
	let sec = time - ( min * 60)
	sec < 10 ? sec = "0" + sec : sec
	$(".fullDuration").text(`${min}:${sec}`)
	
	let counter = 0

	var progInterval = setInterval(function () {
		console.log("interval running: " + counter++)
			
		fillBarWidth = $(".progressBarFill").css("width")
		fillBarWidth = fillBarWidth.replace("px", "")
		fillBarWidth = Number(fillBarWidth)
		emptyBarWidth = $(".progressBarEmpty").css("width")
		emptyBarWidth = emptyBarWidth.replace("px", "")
		emptyBarWidth = Number(emptyBarWidth)
		
		if (fillBarWidth < emptyBarWidth) {
			let time = Math.ceil(player.currentTime)
			let min = Math.floor( time/60 )
			let sec = time - ( min * 60)
			sec < 10 ? sec = "0" + sec : sec 

			$(".elapsedTime").text(`${min}:${sec}`)
			$(".progressBarFill").css("width", `+=${ percentChangePerSecond }%`)
		} else {
			$(".progressBarFill").css("width", "100%")
			console.log("stopping")
			playNextTrack()
			//clearInterval(runningInterval)
		}
	}, 1000)

	progInterval

	runningInterval = progInterval
}

function repeat(state) {
	if (state === "turnOff") {
		$(".fa-redo").css("color", "inherit")
		currentSong.shouldRepeat = false
	} else {
		shuffle("turnOff")
		if (currentSong.shouldRepeat) {
			$(".fa-redo").css("color", "inherit")
			console.log("repeating off")
		} else {
			$(".fa-redo").css("color", "green")
			console.log("repeating on")
		}
		currentSong.shouldRepeat = !currentSong.shouldRepeat
	}
}

function shuffle(state) {
	if (state === "turnOff") {
		$(".fa-random").css("color", "inherit")
		currentSong.shouldShuffle = false
	} else {
		repeat("turnOff")
		if (currentSong.shouldShuffle) {
			$(".fa-random").css("color", "inherit")
			console.log("shuffling off: " + currentSong.shouldShuffle)
		} else {
			$(".fa-random").css("color", "green")
			console.log("shuffling on")
		}
		currentSong.shouldShuffle = !currentSong.shouldShuffle
	}
}

function getRandomSong() {
	let newRandomSong = Math.floor(Math.random() * songDB.length)
	return newRandomSong
}

function playPrevTrack() {
	console.log("previous track")

	TweenMax.to(".fa-backward", 0.1, {ease: Power2.easeOut, y: -5, repeat: 1, yoyo: true })

	let prevTrack

	if (isPlaying) {
		if (currentSong.shouldRepeat) {
			prevTrack = currentSong.index
		} else if (currentSong.shouldShuffle) {
			prevTrack = getRandomSong()
			if (prevTrack === currentSong.index) {
				prevTrack++
			}
		} else {
			currentSong.index === 0 ? prevTrack = songDB.length - 1 : prevTrack = currentSong.index - 1
		}
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
	let newRandomSong = Math.floor(Math.random() * songDB.length)

	if (isPlaying) {
		// if shuffle and repeat are off
		if (!currentSong.shouldRepeat && !currentSong.shouldShuffle) {
			currentSong.index === (songDB.length - 1) ? nextTrack = 0 : nextTrack = currentSong.index + 1
		// if repeat is on
		} else if (currentSong.shouldRepeat) {
			nextTrack = currentSong.index
		// if shuffle is on
		} else if (currentSong.shouldShuffle) {
			nextTrack = getRandomSong()
			if (nextTrack === currentSong.index) {
				nextTrack++
			}
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
	if (isMuted) {
		$(this).removeClass("fa-volume-off").addClass("fa-volume-up")
		player.volume = 1
	} else {
		$(this).removeClass("fa-volume-up").addClass("fa-volume-off")
		player.volume = 0	
	}
	isMuted = !isMuted
}

function loved () {
	let isLoved = songDB[currentSong.index].loved
	let lovedTimeline = new TimelineMax()
	if (isLoved) {
		console.log("isLoved")
		lovedTimeline.to(this, 0.1, {ease: Power1.easeOut, y: -5, repeat: 1, yoyo: true})
		.to(this, 0.2, {ease: Power1.easeOut, color: "white"}, "-=0.2")	
	} else {
		console.log("is not loved")
		lovedTimeline.to(this, 0.1, {ease: Power1.easeOut, y: -5, repeat: 1, yoyo: true})
		.to(this, 0.2, {ease: Power1.easeOut, color: "red"}, "-=0.2")	
	}

	songDB[currentSong.index].loved = !songDB[currentSong.index].loved
}

function openPlaylistFolder () {
	let plTimeline = new TimelineMax()
	
	if (playlistFolderOpen) {
		plTimeline.to('.playlist', 1, {opacity: 0}).to('.playlist-menu', 1, {ease: Power2.easeOut, height: "0%", onComplete: function() {$('.playlist-menu').empty()} })

	} else {
		let playlistJSON;
		let toLoad = ""

		$.getJSON('./playlists/playlists.json',{}, function( data ){ 
		  	playlistJSON = data

		  	for (let i = 0; i < 3; i++) {
				let instance = playlistJSON.playlists[i]
				toLoad = toLoad + `<div class='playlist' data-index='${i}' data-containsSongs='${instance.containsSongs}'>
							<p>${instance.name}</p>
							<p>${ songDB[instance.containsSongs[0]].title }</p>
						</div>`
						console.log(toLoad)
			}
			$('.playlist-menu').html(toLoad)
			let heightToUse = $(".playlist-menu").get(0).scrollHeight
			//** it's getting the automatic heigh but it's off by like 10px. I've hardcoded that in.
			plTimeline.to('.playlist-menu', 1, {ease: Power2.easeOut, height: heightToUse + 10 + "px"}).to('.playlist', 1, {scale: 1, opacity: 0.5}, "-=0.5")
		})
	}
	playlistFolderOpen = !playlistFolderOpen
}

function addToPlaylist() {
	$('.playlist-test').show()
	$(document).one('click', function() {
		$('.playlist-test').hide()
	})
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
