class Component {
	async render() {
		if (!this.template) {
			this.template = await $.get(this.templateFile)	
		}
		let html = eval('`' + this.template + '`')
		this.elem = $(html)
		$(this.selector).append(this.elem)
		this.addEventHandlers()
	}
	addEventHandlers() {
		$(this.elem).find('[data-click]').on('click', (e) => {
			//e.preventDefault()
			console.log("e.target", e.target)
			let method = $(e.target).data('click')
			console.log("method", method)
			return this[method](e);
		})
		
		// $(this.elem).find('.more-tracks').on('click', (e) => {
		// 	e.preventDefault()
		// 	let method = $(e.target).data('click')
		// 	console.log("this", method)
		// 	return this[method](e);
		// })
	}
}

// Varför vill denna kod inte funka? Enda skillnaden är hur funktionen anropas, men det sättet i addEv fn är väl bara en förkortad version av denna, eller?
// $(this.elem).on('click', function(e) {
// 			e.preventDefault()
// 			let method = $(e.target).parents('[data-click]').data('click')
// 			return this[method](e)