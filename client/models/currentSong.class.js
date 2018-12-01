class CurrentSong extends Song{
	constructor(settings) {
		super(settings)
		
		this.playBtn = settings.playBtn
		this.selector = settings.selector
	}
	toggleLoved() {
		let lovedPlaylist = playlists[0]
		let thisTrack = _.findWhere(songDB, {
							title: this.title,
							artist: this.artist
						})
		if (thisTrack.loved) {
			thisTrack.loved = false
			lovedPlaylist.tracks.splice( thisTrack, 1 )
			console.log("lovedPlaylist", lovedPlaylist)
			return 'unloved'
		} else {
			thisTrack.loved = true
			lovedPlaylist.tracks.push(new Song(thisTrack))
			console.log("lovedPlaylist", lovedPlaylist)
			return 'loved'
		}
	}
}