class Playlist {
	constructor(settings) {
		let defaults = {
			name: '',
			tracksIndex: []
		}
		Object.assign(this, defaults, settings)
	}
	trackNames() {
		let trackTitles = []
		for (let track of this.tracksIndex) {
			trackTitles.push(" " + songDB[track].title)
		}
		return trackTitles
	}
}