class Component {
	async render() {
		if (!this.template) {
			thistemplate = await $.get(this.templateFile)	
		}
		let html = eval('`' + this.template + '`')
		this.elem = $(html)
		$(this.selector).append(this.elem)
		this.addEventHandlers()
	}
	addEventHandlers() {
		$(this.elem).on('click', function(e) {
			e.preventDefault()
			let method = $(e.target).data('click')
			return this[method](e)
		})
	}
}