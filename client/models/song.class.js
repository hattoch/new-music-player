class Song {
	constructor(settings) {
		let defaults = {
			title: '',
			artist: '',
			cover: '',
			loved: null,
			src: ''
		}
		Object.assign(this, defaults, settings)
	}
}