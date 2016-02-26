extern hljs, eval

# var hljs = require 'highlight.js'

tag tool < button
	prop action

	def render
		<self.sym>

	def onclick e
		log 'button click',e
		e.halt

	def ontouchstart e
		log 'touchstart'
		yes
		e.event.preventDefault

tag snippet-hint
	prop view

	def render
		<self> "I am a hint!!"

tag overlays
	prop view

	def render
		if var root = view.@root
			var left = 0, top = 0, el = root.dom

			while el and !el.contains(@dom)
				left += el:offsetLeft
				top += el:offsetTop - el:scrollTop
				el = el:parentNode

			@dom:style:left = left + 'px'
			@dom:style:top = top + 'px'

		self

tag hint-label

	def label= text
		if text != @label
			@label = text
			dom:innerHTML = text
		self

tag overlay-hint
	attr type

	prop view
	prop row watch: yes
	prop col watch: yes
	prop len watch: yes

	def rowDidSet new, old
		var val = "{object.row * view.lineHeight}px"
		@dom:style:top = val

	def colDidSet new, old
		var val = "{object.col * view.charWidth}px"
		@dom:style:left = val

	def lenDidSet new, old
		var width = "{new * view.charWidth}px"
		@dom:style:width = width

	def render
		# console.log 'hint at',object.row
		let reg = object.region

		if reg
			row = object.row
			col = object.col
			len = reg.size

		<self.warn .global=(!reg) type=(object.type)>
			<hint-label.label label=object.label>

tag jsview

	attr autosize

	def render
		<self> <code@code>

	def load code, &cb
		# should compile bare
		code = code.replace(/\/\/\# sourceMapping(.*)$/,'')
		code = code.replace(/^\(function\(\)\{\n/,'')
		code = code.replace(/\n?\}\)\(\)\n?$/,'')
		# code = code.replace(/^\t/mg,'')

		if code != @code.dom:textContent
			@code.dom:textContent = code
			@code.@html = null

		flag('huge',code:length > 1000)

		if autosize
			refit

		setTimeout(&,0) do
			hljs.configure classPrefix: ''
			var hl = hljs.highlight('javascript',code)
			@code.html = hl:value
			cb and cb(self)
		self

	def refit
		var h = height
		var ih = @code.height
		var top = Math.floor((h - ih) / 2)
		@code.css top: Math.max(0,top)
		# log 'refit js',h,ih,top
		self

tag console
	prop editor

	def reset
		empty
		self

	def log val
		# console.log(*arguments)

		if editor
			editor.flag('console')

		if val == self
			return

		if val and val:dom
			val = val.dom:outerHTML

		elif val isa Object
			val = JSON.stringify(val)

		if val != undefined
			append <.json> val

		return


# this is basically like an editor
tag snippet

	var counter = 0

	prop imba
	prop config
	prop src watch: :reload

	attr heading
	attr layout
	attr tab

	prop active watch: yes

	def id
		dom:id ||= "snippet{counter++}"

	def activeDidSet bool
		bool ? activated : deactivated

	def activated
		schedule(fps: 60)

	def deactivated
		unschedule

	def input
		<imcaptor@input>

	def view
		@view ||= <imview@view input=input>

	def build

		if Imba.SERVER
			if src and src.match(/\.imba$/)
				APP.fetchDocument(src) do |res|
					imba = res:html
			# prerender shell
			<self>
				<section@main>
					<header@header>
						<.title.path> heading
						<.tools>
							<tool.reset title='reset' :tap='reset'> 'reset'
							<tool.js title='show js' :tap='toggleJS'> 'show js'
							<tool.run title='run' :tap='run'> 'run'
							<tool.fullscreen title='+' :tap='openInFullscreen'> '+'
					<div@view> <code.imbacode data-src=(src)> imba
				<@inspector>
			return self

		super
		reload if src

	def onannotate
		scheduler.mark

	def config= cfg
		if cfg != @options
			@options = cfg
			heading = cfg:title if cfg:title
		self

	def copts
		@copts ||= {
			bare: no
			standalone: no
			sourceMapInline: yes
			filename: "{id}.imba"
			targetPath: "{id}.js"
			sourcePath: "{id}.imba"
		}

	def option key
		@options ? @options[key] : null

	def configure o
		@options = o
		render

	def awaken
		var config = {}
		var code = try %%(.imbacode).dom:innerHTML

		if code
			config:html = code
			view.load(null,html: code)
			configure(config)

		return self

	def load code, o = {}
		view.load(code, o) if code or o:html
		self

	def code
		view.code

	def compile code, o = copts, &blk
		# cache latest compilation - return?
		Scrimbla.worker.compile(code,o) do |res|
			oncompiled(res,o)
			blk and blk(res,o)

	def oncompiled res
		self

	def overlays
		for hint,i in view.hints when hint.active	
			<overlay-hint[hint]@{'hint'+i} view=view>

	def toggleJS
		if tab != 'js'
			showjs
		else
			tab = 'imba'
		self

	def oninputfocus e
		VIEW = self # hack
		flag('focus')
		active = yes

	def oninputblur e
		unflag('focus')
		var rel = e.event:relatedTarget
		unless rel and dom.contains(rel) 
			unflag('focus')
			active = no
		self

	def render
		return self if Imba.SERVER

		<self>
			@input
			<section@main>
				<header@header>
					<.title.path> heading
					<.tools>
						<tool.reset title='reset' :tap='reset'> 'reset'
						<tool.js title='show js' :tap='toggleJS'> 'show js'
						<tool.run title='run' :tap='run'> 'run'
						<tool.fullscreen title='+' :tap='openInFullscreen'> '+'
				<overlays@overlays view=view> overlays
				@view.end
				js
				self.console
			<@inspector> output

	def console
		<console@console.dark editor=self>

	def sandbox
		<sandbox@sandbox.playground editor=self>

	def output
		sandbox

	def js
		<jsview@jsview>

	def reload
		return unless @built

		if DEPS[src]
			var res = DEPS[src]
			view.load(null,html: res:html, filename: src)
			if autorun
				setTimeout(&,50) do run
			return self

		# get imba document?!?
		APP.fetchDocument(src) do |res|
			view.load(res:body, filename: src)
			if autorun
				setTimeout(&,50) do run
		self

	def onrun
		run

	def autorun
		no

	def oneditedasync
		flag('dirty')
		self

	def onsave
		view.hints.clear
		run

	def reset e
		@console.reset
		if @options:html
			view.load(null,html: @options:html)
		if e
			e.cancel
		unflag('dirty')
		view.caret.normalize.dirty
		self

	def run
		flag('running')
		compile(code, copts) do |res|
			view.hints.rem do |hint| hint.group == 'runtime'

			if res:js and res:js:body
				@runData = res:js
				# @jsview.load(res:data:code) if res:data
				try @sandbox.run(res:js) catch e
					console.log 'error',e
		self

	def showjs
		var o = {bare: yes, standalone: no, filename: 'a.imba'}

		compile(code, o) do |res|
			if res:js and res:js:body
				js.load(res:js:body) do tab = 'js'

			elif res:data and res:data:error
				console.log 'has error'

	def runError o
		o:type = 'error'
		o:group = 'runtime'
		# console.log 'runError',o
		# only show error if we have a line and column
		view.hints.add(o).activate
		render

	def runLog o
		o:type = 'log'
		o:group = 'runtime'
		o:message ||= JSON.stringify(o:params[0])
		# console.log 'runLog',o

		if o:nr != null and !o:loc
			var logs = view.find('.identifier.log,.identifier[name="log"]').toArray
			var node = logs[o:nr]

			o:node = node

			if node
				let reg = node.region # node.next ? node.next.region : 
				o:loc = reg.endAtLine.collapse # {line: reg.row, column: col} #  reg.toJSON # {line: reg.row, column: 100}

				# o:loc = logs[o:nr].region.toJSON
		view.hints.add(o).activate
		render

	def runResult o
		# console.log 'runResult',o
		flag('repl',!!o)
		@console.log(o)
		self

	def open-in-fullscreen
		#gist.open(code: view.buffer.toString)
		self


tag example < snippet

	def autorun
		yes

tag herosnippet < example

	def oneditedasync
		flag('dirty')
		refit
		self

	def refit
		var ow = dom:offsetWidth
		var cs = view.charWidth
		var iw = view.root.dom:offsetWidth
		var chars = iw / cs
		var font-size = Math.floor((ow / chars) / 0.6)

		# calculate the desired font size
		log ow,iw,cs, chars,font-size
		


unless Imba.SERVER
	Imba.Event.PROCESSING

	extend class Imba.Event

		var prev = self:prototype:process

		def process
			Imba.Event.PROCESSING = self
			prev.call(self)


tag sandbox

	prop editor

	def render
		self

	def console
		editor.@console

	# should be a shared method for all editors instead
	def onerror msg,url,line,col,err

		if url.match(/snippet(\d+)\.(imba|js)/)
			
			var id = url.split('.').shift
			var snippet = tag(document.getElementById(id))

			if snippet
				snippet.output.onerror(msg,'',line,col,err)
				return

		elif url == 'undefined'
			# safari?
			var ev = Imba.Event.PROCESSING
			console.log 'last event target',ev and ev.target
			if ev and ev.target
				var snippet = ev.target.closest(%snippet)
				if snippet
					return snippet.output.onerror(msg,'',line,col,err)

		console.log 'caught the error here!!!',arguments,this
		var locs = []

		err and err:stack?.replace(/(\<anonymous\>|snippet\d+\.imba)\:(\d+):(\d+)/g) do |m,source,line,col|
			locs.push(line: parseInt(line), column: parseInt(col))
			return ""

		locs.push(line: line, column: col)

		if locs[0]
			var map = object:sourcemap
			var consumer = Scrimbla.SourceMap.SourceMapConsumer(map)
			var loc = consumer.originalPositionFor(locs[0])
			console.log 'original location is',loc
			editor.runError({message: msg, loc: loc})

		return true

	def onlog nr, pars
		editor.runLog({nr: nr, params: pars})
		self

	def empty
		for item in %(.scheduled_)
			item.unschedule
		super

	def present res
		var node
		if res and res:prototype isa Imba.Tag
			node = res.new(res.createNode)

		elif res isa Imba.Tag
			node = res

		if node
			empty.append(node)
			node.end
		
		self.console.log(node or res)

	def run src
		var code = src:body
		return self unless code

		@object = src

		try
			window:onerror = do |msg,url,line,col,err|
				console.log 'caught error',msg,url,line,col,err,this
				onerror(msg,url,line,col,err)

			code = code + '\n//# sourceURL=' + editor.id + '.imba'
			var tag$ = Imba.TAGS.__clone
			var console = self.console
			var res = eval(code)
			present(res)
		catch e
			log 'immediate error in eval-inline',e
			onerror(e:message,'',e:lineNr or e:line or 0,e:column,e)

		return self
