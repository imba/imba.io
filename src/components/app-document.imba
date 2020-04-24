import {ls} from '../store'

tag app-document

	def render
		<self.markdown.block.pb-24>
			<div.content.px-6 innerHTML=data.html>

tag embedded-app-document
	def hydrate
		let data = ls(dataset.path)
		innerHTML = data.html if data

tag embedded-app-example
	def hydrate
		data = ls(dataset.path)
		name = textContent
		innerHTML = ''
		self

	def run
		emit('run',{example: data})

	def render
		<self.cursor-pointer :click.run> <span> "Show example"

### css scoped
	embedded-app-example {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 3px;
		min-height: 3rem;	
		background: var(--blue-100);
	}
	embedded-app-example:hover {
		background: var(--blue-200);	
	}
###