class Playlist {
	constructor(settings) {
		let defaults = {
			name: '',
			tracksIndex: [],
			tracks: []
		}
		Object.assign(this, defaults, settings)
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
	hideRestTracks() {
		let rest = this.trackNames().rest
		let insert
		if (rest.length !=0) {
			insert = `<span class='more-tracks'>${rest.length} more</span>`
		} else {
			insert
		}
		return insert
	}
	showRestTracks() {
		let rest = this.trackNames().rest
		let insert = rest + "<span class='less-tracks'>hide</span>"
		return insert
	}
	saveTrack(track) {
		this.tracks.push[track]
	}
}