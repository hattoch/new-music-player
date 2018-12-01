class CurrentPlaylist extends Playlist {
	constructor(settings) {
		super(settings)
		this.shouldShuffle = false
		this.shouldRepeat = false
	}
	nextTrack(currentSong) {
		let current = _.find(this.tracks, {title: currentSong.title})
		let currentIndex = _.indexOf(this.tracks, current)
		let next
		if (currentIndex == this.tracks.length - 1) {
			next = 0
		} else {
			next = currentIndex + 1
		}
		return this.tracks[next]
	}
	prevTrack(currentSong) {
		let current = _.find(this.tracks, {title: currentSong.title})
		let currentIndex = _.indexOf(this.tracks, current)
		let previous
		if (currentIndex == 0) {
			previous = this.tracks.length - 1
		} else {
			previous = currentIndex - 1
		}
		return this.tracks[previous]
	}
}