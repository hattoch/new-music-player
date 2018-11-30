class CurrentSong extends Song{
	constructor(settings) {
		super(settings)
		
		this.playBtn = settings.playBtn
		this.selector = settings.selector
	}
}