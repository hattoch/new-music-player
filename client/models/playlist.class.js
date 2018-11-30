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
}