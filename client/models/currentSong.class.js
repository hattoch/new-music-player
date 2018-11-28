class CurrentSong {
	constructor(settings) {
		let defaults = {
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
		Object.assign(this, defaults, settings)
	}
}
