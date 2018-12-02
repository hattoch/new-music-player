class Playlist extends Component {
	constructor(settings) {
		super()
		let defaults = {
			name: '',
			tracksIndex: [],
			tracks: [],
			selector: '.playlist-menu',
			templateFile: '././server/templates/playlistInPlaylists.html'
		}
		Object.assign(this, defaults, settings)
		this.render()
	}
	trackNames() {
		let trackTitles = {
			rest: [],
			partial: []			
		}
		for (let track of this.tracks) {
			trackTitles.partial.push(" " + track.title)
		}
		trackTitles.rest = trackTitles.partial.splice(3, trackTitles.partial.length)
		return trackTitles
	}
	restTracks() {
		let rest = this.trackNames().rest
		let insert = ''
		if (rest.length !=0) {
			insert = `${rest.length} more`
		}
		return insert
	}






	toggleRestTracks(e) {
		//let rest = this.trackNames().rest
		let displayedTracks = $(e.target).siblings('.contains-songs')
		let rest = this.trackNames().rest[0]
		console.log(this.trackNames().partial)


		if (displayedTracks.html().includes(rest)) {
			displayedTracks.html(this.trackNames().partial.toString())
			$(e.target).html(this.restTracks())
		} else {
			displayedTracks.append(',' + this.trackNames().rest)
			$(e.target).html('hide')
		}

		
		
		console.log("e.target", e.target)
		console.log("parents", $(e.target).parents('.contains-songs'))
		//$('.surplus-tracks').toggle()
		// let insert = rest + "<span class='less-tracks' data-click='hideRestTracks'>hide</span>"
		// $(e.target).parents('.rest-tracks').html(", " + insert)
	}


	saveTrack(track) {
		this.tracks.push[track]
	}
	loadSongs() {
		currentPlaylist = new CurrentPlaylist(this)
		$('#songList').empty()

		let plTimeline = new TimelineMax()
		plTimeline
			.to('.playlist', 0.1, {opacity: 0})
			.to('.playlist-menu', 0.1, {
				ease: Power2.easeOut, 
				height: "0%",
			})
		for (let playlist of playlists) {
			playlist.hide()
		}
		
		for (let track of currentPlaylist.tracks) {
			track.render('#songList')
		}

		playlistFolderOpen = !playlistFolderOpen
		
		TweenMax.from($(".song"), 0.5, {x:-100, opacity: 0})
	}
	show() {
		console.log("showing!")
		console.log(this.elem)
		this.elem.show()
		console.log(this.elem)
	}
	hide() {
		console.log("hiding!")
		this.elem.hide()
		console.log(this.elem)
	}

}