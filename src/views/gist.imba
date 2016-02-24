require './snippet'

import Gist from '../data/gist'

var gist-id = '1780e1ddcc26af847cca'

# var code = "# code"
# Imba.Events.register(['scroll']) if Imba.CLIENT

tag gist-output < iframe

	prop ready
	prop editor

	def build
		dom:onload = do setup
		self

	def ctx
		dom:contentWindow

	def doc
		dom:contentDocument or ctx:document

	def head
		<head>
			<link href='/css/sandbox.css' rel='stylesheet' type='text/css'>
			# <script src='/sandbox.js' type='text/javascript'>

	def run data
		@object = data
		log 'gist-output run!!',data,arguments
		ctx.run(data,editor)
		self

	def setup
		doc:head:innerHTML = head.dom:innerHTML
		var script = doc.createElement("script")
		script:type = 'text/javascript'
		script:src = '/sandbox.js'
		doc:head.appendChild(script)

		# ctx:onerror = do |msg,url,line,col,err|
		# 	console.log 'caught error',msg,url,line,col,err,this
		# 	onerror(msg,url,line,col,err)

		ready = yes
		self

tag gist < snippet

	tag sep

	tag pane

		attr name
		attr autosize

		def hide
			flag('hide').unflag('show')

		def show
			unflag('hide').flag('show')

		def maximize
			show
			for pane in siblings
				pane.hide if pane.matches(%pane)
			self

		def shown
			hasFlag('show')

		def render
			refit if autosize
			self

		def refit
			last?.refit
			self

	tag tab
		attr name

		def pane
			@pane ||= up(%snippet)?.pane(name)

		def ontap e
			console.log 'tap?',pane,e
			e.event:metaKey ? pane?.show : pane?.maximize
			e.halt

		def render
			<self .active=(pane?.shown)>

	tag group


	prop object watch: yes, observe: yes

	def objectDidEmit
		load(object)

	def route
		'/gists'

	def didscope
		show.maximize

	def didunscope
		hide.minimize

	def hide
		flag('hide').unflag('show')

	def show
		unless hasFlag('show')
			flag('show').unflag('hide')
		self

	def activated
		self

	def deactivated
		self

	def onscroll e
		# rerender on scroll
		e.halt.silence
		scheduler.mark

	def oncompiled res, o
		if res:data and res:data:code
			# compile again
			o:bare ? js.load(res:data:code) : compile(code,bare: yes, standalone: no)
		self

	def maximize
		flag('fullscreen')

	def maximized
		router.segment(0) == 'gists' or hasFlag('fullscreen')

	def minimize
		unflag('fullscreen')

	def render
		return self if Imba.SERVER

		let routeid = router.match(/\gists\/([\w]+)/,1)

		reroute

		<self.dark>
			<.header>
				<.path.grow>
					if object isa Gist
						<b> "Gist"
						<.title> object.title

				<.tools>
					<tab name='imba'> 'Imba'
					<tab name='js'> 'JavaScript'
					<tab name='output'> 'Output'

					unless routeid
						if !maximized
							<tab.ico :tap='maximize' title='Fullscreen'> '▲'
						else
							<tab.ico :tap='minimize' title='Halfscreen'> '▼'
						
						# should only show if we are in a history state
						<tab.close.ico :tap='hide'> '✕'

			<group.hor>
				<pane@main name='imba'>
					@input
					<overlays@overlays view=view> overlays
					@view.end
				<pane name='js' autosize=yes> js
				<pane name='output'> output

		if routeid and (!object or object?.id != routeid)
			open(routeid)
		self

	def pane name
		%%(pane[name={name}])

	def js
		<jsview@jsview autosize=yes>

	def sandbox
		<gist-output@sandbox editor=self>

	def awaken
		configure({})
		pane('output').maximize
		schedule(fps: 1, events: yes)
		self

	def load o
		if o isa Gist
			for own name,item of o.files
				# only single file now
				view.load(item:content,item)
		elif o:code
			view.load(o:code,{})
		run
		self

	def open o
		if o isa String
			o = Gist.get(o)

		object = o

		if o isa Gist
			load(o) if o.ready
		else
			load(o)

		show
		self

	def onrunerror msg,url,line,col,err
		var locs = []
		var map = @runData?:sourcemap

		return unless map

		err and err:stack?.replace(/(\<anonymous\>|snippet\d+\.imba)\:(\d+):(\d+)/g) do |m,source,line,col|
			locs.push(line: parseInt(line), column: parseInt(col))
			return ""

		locs.push(line: line, column: col)

		if locs[0]
			var consumer = Scrimbla.SourceMap.SourceMapConsumer(map)
			var loc = consumer.originalPositionFor(locs[0])
			console.log 'original location is',loc
			runError({message: msg, loc: loc})
		return true

		
