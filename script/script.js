var playlists = []
var curentPlaylist
var currentSong

// Creates poppers
var popupVol = $("#popupVol")
//popupVol.hide()
isVolPopupVisible = false

// Audio settings
var player = new Audio()
var isMuted = false
var isPlaying = false
var playlistFolderOpen = false

// Timers
let runningInterval = 0

// Add event handlers
$(document).on('dblclick', '.song', loadTrack);
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
$(document).on('click', '.playlist', loadSongs)
$(document).on('click', '.show-songs', showRestSongs)


// Fetch playlists from server
$.getJSON('./playlists/savedPlaylists.json',{}, function( data ){ 
	for (let playlist of data) {
		let songs = []
		for (track of playlist.tracksIndex) {
			let songSettings = {
				title: songDB[track].title,
				artist: songDB[track].artist,
				cover: songDB[track].cover,
				loved: songDB[track].loved,
				src: songDB[track].src
			}
			songs.push(new Song(songSettings))
		}
		let settings = {
			name: playlist.name,
			tracksIndex: playlist.tracksIndex,
			tracks: songs
		}
		playlists.push(new Playlist(settings))
	}
})

//setTimeout(function(){console.log(playlists),1000})

// Functions
function loadSongs() {
	currentPlaylist = new CurrentPlaylist(_.findWhere(playlists, {name: $(this).data('playlist-name')}))
	$('#songList').empty()

	let plTimeline = new TimelineMax()
	plTimeline
		.to('.playlist', 0.1, {opacity: 0})
		.to('.playlist-menu', 0.1, {
			ease: Power2.easeOut, 
			height: "0%", 
			onComplete: function() {$('.playlist-menu').empty()} })
	
	for (let track of currentPlaylist.tracks) {
		track.render('#songList')
	}
	
	TweenMax.from($(".song"), 0.5, {x:-100, opacity: 0})

	playlistFolderOpen = !playlistFolderOpen
}

// trackToChange is either a number if it comes from prev- or nextTrack, or an event object if it comes from a song
function loadTrack(trackToChange) {
	console.log("loading track")

	let songToLoad

	if ( $(this).hasClass("song") ) {
		songToLoad = _.findWhere(currentPlaylist.tracks, {
			title: $(this).data('title'),
			artist: $(this).data('artist')
		});
	} else {
		songToLoad = trackToChange
	}

	songToLoad.selector = `.song[data-title='${ songToLoad.title }']`
	songToLoad.playBtn = $(songToLoad.selector).find("#smallPlayButton")

	currentSong = new CurrentSong(songToLoad)
	$(".song.playing").removeClass("playing").addClass("canHover")
	$(currentSong.selector).removeClass("canHover").addClass("playing")

	//updates info to places that display it
	$(".currentTitle").text(currentSong.title)
	$(".currentArtist").text(currentSong.artist)
	$(".currentCover").attr('src', currentSong.cover)
	TweenMax.from($(".turntable.currentCover"), 0.5, {x:-70, opacity: 0})

	//Set song source
	player.src = currentSong.src

	if (currentSong.loved) {
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
	TweenMax.to(this, 0.1, {ease: Power2.easeOut, y: -5, repeat: 1, yoyo: true })

	if (currentSong) {
		if (isPlaying) {
			console.log("pausing")
			player.pause()
			isPlaying = !isPlaying
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
		if (currentPlaylist.shouldRepeat) {
			$(".fa-redo").css("color", "inherit")
			console.log("repeating off")
		} else {
			$(".fa-redo").css("color", "green")
			console.log("repeating on")
		}
		currentPlaylist.shouldRepeat = !currentPlaylist.shouldRepeat
	}
}

function shuffle(state) {
	if (state === "turnOff") {
		$(".fa-random").css("color", "inherit")
		currentPlaylist.shouldShuffle = false
	} else {
		repeat("turnOff")
		if (currentPlaylist.shouldShuffle) {
			$(".fa-random").css("color", "inherit")
			console.log("shuffling off: " + currentPlaylist.shouldShuffle)
		} else {
			$(".fa-random").css("color", "green")
			console.log("shuffling on")
		}
		console.log("currentPlaylist.shouldShuffle", currentPlaylist.shouldShuffle)
		currentPlaylist.shouldShuffle = !currentPlaylist.shouldShuffle
		console.log("currentPlaylist.shouldShuffle", currentPlaylist.shouldShuffle)
	}
}

function getRandomSong() {
	let randomIndex = _.random(0, currentPlaylist.tracks.length - 1)
	console.log("RANDOMINDEX", randomIndex)
	let randomSong = currentPlaylist.tracks[randomIndex]
	console.log("currentPlaylist.tracks.length", currentPlaylist.tracks.length)
	console.log("newRandomSong", randomSong)
	return randomSong
}

function playPrevTrack() {
	console.log("previous track")
	TweenMax.to(".fa-backward", 0.1, {ease: Power2.easeOut, y: -5, repeat: 1, yoyo: true })
	let prevTrack

	if (isPlaying) {
		if (currentPlaylist.shouldRepeat) {
			prevTrack = currentSong
		} else if (currentPlaylist.shouldShuffle) {
			prevTrack = getRandomSong()
			while (prevTrack.title == currentSong.title) {
				prevTrack = getRandomSong()
			}
		} else {
			prevTrack = currentPlaylist.prevTrack(currentSong)
		}
		loadTrack(prevTrack)		
	} else {
		console.log("Can't change track: nothing's playing")
		return
	}
}

function playNextTrack() {
	console.log("next track")
	TweenMax.to(".fa-forward", 0.1, {ease: Power2.easeOut, y: -5, repeat: 1, yoyo: true })
	let nextTrack
	
	if (isPlaying) {
		if (currentPlaylist.shouldRepeat) {
			nextTrack = currentSong
		} else if (currentPlaylist.shouldShuffle) {
			nextTrack = getRandomSong()
			while (nextTrack.title == currentSong.title) {
				nextTrack = getRandomSong()
			}
		} else {
			nextTrack = currentPlaylist.nextTrack(currentSong)
		}
		loadTrack(nextTrack)
	} else {
		console.log("Can't change track: nothing's playing")
		return
	}
}

function toggleVolumeBar() {
	console.log("toggle volume bar")
	if (isVolPopupVisible) {
		popupVol.hide()
		popupVol.removeClass("d-flex align-items-end")
	} else {
		popupVol.show()
		popupVol.addClass("d-flex align-items-end")
	}
	isVolPopupVisible = !isVolPopupVisible
	let popper = new Popper(this, popupVol, {
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
	
	if (!playlistFolderOpen) {
		let playlistsDOM = ""
		let template = _.template(
			"<div class='playlist' data-playlist-name='<%= name %>' data-tracks='<%= tracksIndex %>'>" +
				"<p><%= name %></p>" +
				"<p class='contains-songs'><%= trackTitles %></p>" +
			"</div>")
		for (let playlist of playlists) {
			let trackNames = playlist.trackNames()
			console.log("trackNames", trackNames)
			let compiled = template({
					tracksIndex: playlist.tracksIndex,
					name: playlist.name,
					trackTitles: trackNames.partial
					})
			playlistsDOM = playlistsDOM + compiled
		}
		$('.playlist-menu').html(playlistsDOM)
		let heightToUse = $(".playlist-menu").get(0).scrollHeight
		plTimeline.to('.playlist-menu', 0.1, {ease: Power2.easeOut, height: heightToUse + "px"}).to('.playlist', 0.1, {opacity: 0.5})
	} else {
		plTimeline.to('.playlist', 0.1, {opacity: 0}).to('.playlist-menu', 0.1, {ease: Power2.easeOut, height: "0%", onComplete: function() {$('.playlist-menu').empty()} })
	}
	playlistFolderOpen = !playlistFolderOpen
}

function showRestSongs(e) {
	e.stopPropagation()
	let allSongs = $(this).parents('.playlist').data('containssongs')
	let arrayOfAllSongs = JSON.parse("[" + allSongs + "]")
	let songsToShow = ", "

	if ( $(this).hasClass("showing") ) {
		$('.show-songs').removeClass("showing")
		$('.show-songs').html("...")
		let songToRemove = songDB[arrayOfAllSongs[3]].title
		let startIndex = $('.contains-songs').html().indexOf(songToRemove) - 2 //to include the space and comma before it
		console.log($(this).parents().html())
		console.log()
	} else {
		for (let i = 3; i < arrayOfAllSongs.length; i++) {
			songsToShow = songsToShow + songDB[arrayOfAllSongs[i]].title
			if (i === arrayOfAllSongs.length - 1) {
				break
			} else {
				songsToShow = songsToShow + ", "
			}
			console.log(songsToShow)
		}
		$('.show-songs').addClass("showing")
		$('.show-songs').html("hide")
		$(this).before(songsToShow)
	}
	
	
	/*
	if (isRestPopupVis) {
		$('#popupAllSongs').hide()
	} else {
		let allSongs = $(this).parents('.playlist').data('containssongs')
		let arrayOfAllSongs = JSON.parse("[" + allSongs + "]")
		$('#popupAllSongs').html(arrayOfAllSongs)
		$('#popupAllSongs').show()
	}
	*/
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
