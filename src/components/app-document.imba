import {ls} from '../store'
import { @watch } from '../decorators'

tag app-document
	@watch prop data

	css &
		color: #4a5568
		line-height: 1.625

	css h1
		color: #297198;
		margin: 20px 0px 12px;
		font-size: 28px;
		line-height: 1.4em;
		color: #3a4652;
		font-weight: 600;

	css h2
		font-size: 22px;
		margin-top: 30px;
		padding: 10px 0px;
		border-bottom: 1px solid #F3F5F7;
		font-weight: 600;
		margin: 1.5em 0em 0.5em;
		line-height: 1.2em;
		color: #3A4652;

	css h3
		font-size: 18px;
		padding: 10px 0px;
		border-bottom: 1px solid #F3F5F7;
		font-weight: 500;
		line-height: 1.2em;
		margin: 1.5em 0em 0.5em;
		color: #3A4652;

	css h4
		font-size: 1rem;
		font-weight: 500;
		border-bottom: 1px solid #edeff1;
		margin: 1.33em 0 1em;
		color: #3A4652;
		line-height: 1.7em;
		padding: 6px 0px;

	css h5
		position: relative;
		background: teal400;
		color: teal900;
		font-size: 14px;
		font-weight: bold;
		border-radius: 3px;
		padding: 2px 8px;
		margin-top: 1rem;
		letter-spacing: 0.02em;
		display: inline-block;
		top: 8px;
		left: 8px;
		z-index: 30;

	css p
		font-weight: 400;
		font-size: 16px;
		margin: 1em 0;

	css li
		font-size: 15px;
		line-height: 1.3em;
		padding-top: 0.15em;
		padding-bottom: 0.15em;
		padding-left: 30px;
		position: relative;
		&:before
			content: "•";
			width: 20px;
			text-align: center;
			position: absolute;
			left: 6px;
			font-size: inherit;
			line-height: inherit;
			font-style: normal;
			color: #52AF78;
		& > p > code
			display: table;
			margin-bottom: 4px;
			font-weight: 600;

	css blockquote
		background: #F7F2E3;
		margin: 12px 0px;
		padding: 10px 12px;
		color: #6f6850;
		font-size: 15px;
		& p = font-size: 15px
		& > :first-child = margin-top: 0px
		& > :last-child = margin-bottom: 0px
	
	css app-code-block + app-code-block
		margin-top: 1rem


	# table stlff
	css table
		width: 100%;
		border-bottom: 1px solid gray200;
		color: #4a5568;
		font-size: 16px;
		line-height: inherit;

		&[data-title='table'] thead = display: none

		& th
			color: gray700
			font-weight: 500
			py: 0.5rem
			text-align: left
			white-space.first: nowrap
		& td
			padding: 0.5rem
			border-top: 1px solid gray200

		& .code-inline:only-child
			font-size: 0.85em
			padding: 0.125em 5px
			margin: 0px
			vertical-align: top
		
		& td.example
			width: 50px;
			white-space: nowrap;
			padding-left: 0px;
			padding-right: 0px;

		& embedded-app-example
			display: inline
			background: transparent
			color: blue500
			font-weight: bold
			padding: 0px 3px
			white-space: pre
			& * = display: none
			&:before = content: "☶"
			&:after = content: " TRY" fs:14px fw:bold

	def render
		<self.markdown.(l:block pb:24)>
			<div$content.(max-width:768px px:6) innerHTML=data.html>

	def dataDidSet data
		console.log 'data did set!!',data
		document.body.scrollTop = 0

	
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
		<self.(l:flex center cursor:pointer radius:2 min-height:12 bg:blue200) @click.run> <span> "Show example"

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