import {highlight} from '../util/highlight'
import * as sw from '../sw/controller'
import {ls} from '../store'

css :root
	--code-color: #e3e3e3;
	--code-identifier: #9dcbeb;
	--code-constant: #8ab9ff # #d7bbeb;
	--code-background: #282c34;
	--code-bg-lighter: #29313f;
	--code-comment: #718096;
	--code-keyword: #ff9a8d; # #e88376;
	--code-operator: #ff9a8d;
	--code-delimiter-operator:#6d829b;
	--code-numeric: #63b3ed;
	--code-boolean: #4299e1;
	--code-null: #4299e1;
	--code-entity: #8ab9ff;
	--code-string: #77b3d1;
	--code-entity: #8ab9ff;
	--code-regexp: #e9e19b;
	--code-mixin:#ffc87c;
	--code-mixin:#e9e19b;
	--code-this: #63b3ed;
	--code-tag: #e9e19b;
	--code-tag-event: #fff9c3;
	--code-tag-reference: #ffae86;
	--code-tag-angle: #9d9755;
	--code-type: #839fc7;
	--code-type-delimiter:#303F52;
	--code-property: #F7FAFC;
	--code-decorator: #63b3ed;
	--code-variable: #e8e6cb;
	--code-global-variable: #ecd5f1; # #dcb9e4 # #ffc3c3;
	--code-root-variable: #d7bbeb;

	--code-font: "Source Code Pro", Consolas, Menlo, Monaco, Courier, monospace;
	--code-rule-mixin: #ff9292;
	--code-rule: #ffb8b8;
	--code-style: #c8c9b6;
	--code-style-scope: #fad8bf;
	--code-style: #e0ade3;
	--code-style-bracket:#e9e19b;
	--code-style-unit: #ff9191;
	--code-style-scope: #eb9fe5;
	--code-style-delimiter: #8c7590;
	--code-style-value: #a49feb;
	--code-style-value-scope: #eec49d;
	--code-style-value-size: #ff8c8c;
	--code-style-property: #e0ade3;
	--code-style-property-scope: #df8de4; # #e9e19b;
	--code-css-property-modifier: #df8de4;

	--code-style-var: #ff93d0;
	--code-keyword-css: #fff7b6;
	--code-selector: #e9e19b;
	--code-selector-pseudostate: var(--code-selector);
	--code-selector-context: #eec49d;
	--code-selector-placeholder:hsl(321, 100%, 79%) # hsl(36, 100%, 72%);
	--code-key: #9dcbeb;
	--code-delimiter: #e3e3e3
	--code-delimiter-operator:#889cd6

css .code
	tab-size: 4
	cursor:default
	.invalid color: red
	.entity.other.inherited-tag color: var(--code-entity); 
	.entity.other.inherited-class color: var(--code-entity); 
	.invalid color: red; 
	.comment color: var(--code-comment); 
	.regexp color: var(--code-regexp); 
	.tag color: var(--code-tag); 
	.type color: var(--code-type); 
	.type.start color: var(--code-type-delimiter); 
	.entity.name.type color: var(--code-entity); 
	.keyword color: var(--code-keyword);
	.argparam color: var(--code-keyword);
	.delimiter color: var(--code-delimiter);
	.operator color: var(--code-operator); 
	.property color: var(--code-property); 
	.numeric color: var(--code-numeric); 
	.number color: var(--code-numeric); 
	.boolean color: var(--code-boolean); 
	.null color: var(--code-null); 
	.identifier color: var(--code-identifier); 
	.key color: var(--code-key); 
	.key + .operator color: var(--code-key); 
	.variable color: var(--code-variable); 
	.string color: var(--code-string); 
	.propname color: var(--code-entity); 
	.this color: var(--code-this); 
	.self color: var(--code-this); 
	.constant color: var(--code-constant); 
	
	.tag.reference color: var(--code-tag-reference);
	.tag.open color: var(--code-tag-angle); 
	.tag.close color: var(--code-tag-angle); 
	.tag.event color: var(--code-tag-event); 
	.tag.event-modifier color: var(--code-tag-event);
	.tag.mixin color: var(--code-mixin) fw:bold
	.tag.rule-modifier color: var(--code-rule-mixin); 
	.tag.rule-modifier.start opacity: 0.43; 
	.tag.rule color: var(--code-rule); 

	.constant.variable color: var(--code-constant);
	.variable.global color: var(--code-global-variable);
	.variable.imports color: var(--code-global-variable);
	.decorator color: var(--code-decorator); 
	
	.style.open color: var(--code-style-bracket); 
	.style.close color: var(--code-style-bracket); 
	.style.args.open color: var(--code-style); 
	.style.args.close color: var(--code-style); 
	.style color: var(--code-style); 
	.style.scope color: var(--code-style-scope); 
	.selector color: var(--code-selector); 
	.unit color: var(--code-style-unit); 
	.style.delimiter color: var(--code-style-delimiter); 
	.style.property color: var(--code-style-property); 
	.style.property.modifier color: var(--code-style-property-scope);
	.style.value color: var(--code-style-value); 
	.style.value.var color: var(--code-style-var);
	.style.value.size color: var(--code-style-value-size); 
	.style.value.scope color: var(--code-style-value-scope);
	.style.modifier color: var(--code-style-value-scope); 
	.selector.pseudostate color: var(--code-selector-pseudostate); 
	.selector.operator color: var(--code-selector-operator); 
	.selector.context color: var(--code-selector-context) 
	.selector.mixin color: var(--code-mixin) fw:bold
	.style.start-operator color: var(--code-delimiter-operator);
	span.operator.dot color:var(--code-identifier)
	span.region.more d:none d@md:contents

	.variable.highlight
		bg:rgba(255, 253, 227, 0.11)
		box-shadow:0px 0px 0px 2px rgba(255, 253, 227, 0.11)
		border-radius:3px
		transition: all 0.15s

	.region.hl2
		bg:rgba(0, 0, 0, 0.11)
		box-shadow:0px 0px 0px 2px rgba(0, 0, 0, 0.11)
		border-radius:3px
		transition: all 0.15s

	.region pos:relative

	& .region.arrow@before
		content: " "
		pos:absolute d:block
		size:16px
		bg: url('/images/arrow.svg')
		background-size: contain
		bottom:100% right:50% mr:-2px mb:-2px

	.css.attribute.name color:var(--code-style-property)
	.css.attribute.value color:var(--code-style-value)

tag app-code
	def awaken
		self

	def render
		<self>


tag app-code-block < app-code

	css pos:relative radius:1 fs:12px @md:13px d:block .shared:none
		--bg:$code-bg-lighter

	css %code pos:relative d:block
		.code-head display: none

	css code d:block ofx:auto ff: var(--code-font) ws:pre p:3 4 p@md:5 6
	css label bg:gray7 radius:2 pos:absolute d:flex ai:center p:1

	css %btn px:1 mx:1 c:gray6 fw:500 radius:2 bg@hover:gray7/10 outline@focus:none
		@not-md mx:0 ml:1 bg:gray7/90 bg@hover:gray7/100 c:gray4
		@is-active bg:blue6 c:white

	css .tabs d:flex radius:2

	css .nostyles ._style d:none

	css code.has-focus > span@not(.focus)@not(._style) opacity: 0.6
	css code.has-hide span.hide d:none

	css code@hover.has-hl > span@not(.hl)@not(._style) opacity: 0.7
	css code span.region.hl pos:relative
		@before
			pos:absolute inset:0 m:-1 radius:3 b:1px dashed yellow7 content:' '
			box-shadow: 0px 0px 10px 2px rgba(42, 50, 63,0.7), inset 0px 0px 2px 2px rgba(42, 50, 63,0.7)
			rotate:-1deg

	prop tab = 'imba'
	prop lang
	prop options = {}
	prop dir
	prop files
	prop file

	def hydrate
		lang = dataset.lang
		files = []
		file = null

		if dataset.dir
			dir = ls(dataset.dir)
			console.log 'found dir?',dir
			files = dir.files
			file = files[0]

		dataset.path

		code = highlight(textContent,lang)
		innerHTML = '' # empty
		options.compile = !code.options.nojs and !code.plain.match(/^tag /m)
		options.run = !code.options.norun

		if code.options.preview
			let file = {path: dataset.path, body: code.plain,size: code.options.preview}
			options.preview = file


	def mount
		schedule!
		render!
	
	def unmount
		unschedule!

	def run
		let source = ""
		for item in parentNode.querySelectorAll('app-code-block.shared')
			source += item.code.plain + '\n'

		source += code.plain

		let lines = source.split('\n')
		let last = lines.reverse!.find do !$1.match(/^[\t\s]*$/) and $1[0] != '\t'
		if let m = (last and last.match(/^tag ([\w\-]+)/))
			source += "\n\nimba.mount <{m[1]}>"
		# console.log 'found last',last
		emit('run',{code: source})

	def toggleJS
		console.log 'toggleJS',tab
		unless js
			let res = await sw.request(event: 'compile', body: code.plain, path: 'playground.imba')
			js = res.js
			$compiled.innerHTML = highlight(res.js,'javascript').html
			render!

		tab = tab == 'js' ? 'imba' : 'js'
		console.log 'toggledJS',tab
		render!

		# flags.toggle('show-js')

	def pointerover e
		let vref = null
		if let el = e.target.closest('.variable')
			vref = el.className.split(/\s+/g).find do (/var\d+/).test($1)
		
		if vref != hlvar
			if hlvar
				el.classList.remove('highlight') for el in getElementsByClassName(hlvar)
			if vref
				el.classList.add('highlight') for el in getElementsByClassName(vref)
			hlvar = vref
	
	css %tabs d:flex cursor:default us:none
	css %tab d:flex px:3 py:2 fs:sm fw:500 radius:3px 3px 0 0
		bg:gray2 @hover:gray3 .on:var(--bg)
		c:gray6 c.on:white


	css %main
		pos:relative radius:2 c:$code-color bg:var(--bg)

	css %preview
		min-height:106px
		mt:0 radius:0 0 3px 3px
		color:gray6
		pos:absolute
		t:0 l:100%
		w:calc(min(100vw,1340px) - 980px - 40px)
		max-width:500px
		h:100%
		w:$doc-margin
		pl:4
		.frame shadow:sm @lt-xl:none radius:2
		.controls d@lt-xl:none
		@lt-xl pos:relative l:0 h:200px ml:0 w:100% p:4 pt:0 bg:var(--bg) max-width:initial

	def editorResized e
		editorHeight = Math.max(editorHeight or 0,e.rect.height)
	
	def render
		return unless code

		<self.{code.flags} @pointerover=pointerover>
			<header>
				<div%tabs> for item in files
					<a%tab .on=(file==item) @click=(file=item)> item.name
			<main%main [border-top-left-radius:0]=dir>
				<div$editor%editor.code[min-height:{editorHeight}px]  @resize=editorResized>
					if file
						<code.{file.highlighted.flags} %code innerHTML=file.highlighted.html>
					unless dir
						<div$code[pos:relative] %code>
							if lang == 'imba'
								<div[pos:absolute top:-2 @md:2 right:1 @md:2]>
									if options.compile
										<button%btn .active=(tab == 'js') @click=toggleJS> 'js'
									if options.run
										<button%btn @click=run> 'run'

							<div$source.source .(d:none)=(tab != 'imba')> <code.{code.flags} innerHTML=code.html>
							<div.output.js .(d:none)=(tab != 'js')> <code$compiled>
				if options.preview or dir
					<app-repl-preview$preview%preview file=options.preview dir=dir>
			

tag app-code-inline < app-code

	css &
		display: inline-block
		font-size: 0.75em
		border-radius: 3px
		background: hsla(210, 7%, 31%, 0.06)
		-webkit-box-decoration-break: clone
		vertical-align: middle
		padding: 0.1em 5px
		font-family: var(--code-font)


tag app-code-preview
	def render
		<self>
			<div> 'Preview'
			<div$container> <iframe$frame>