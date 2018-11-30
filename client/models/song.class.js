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
	render (selector) {
		$(selector).append(`<div class='song canHover d-flex justify-content-between align-items-center' data-title='${ this.title }' data-artist='${ this.artist }'>
								<img class='coverImg' src='${ this.cover }'>
								<div class="d-flex flex-column ">
									<p class="flex-fill d-flex justify-content-center">${ this.artist }</p>
									<p class="flex-fill d-flex justify-content-center">${ this.title }</p>
								</div>
								<i id="smallPlayButton" class="fas fa-play-circle"></i>
								</div>`
								)
	}
}