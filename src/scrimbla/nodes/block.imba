
import Highlighter from '../core/highlighter'
import '../core/util' as util

tag imblock < im

	def deleteLeftRight e
		log 'imblock deleteLeftRight',e.region.peek(-1,1)

		if e.region.peek(-1,1) == code
			orphanize
			return e.handled

		self

	def indentBlock e
		e.handled

		view.caret.expandToLines
		var region = view.caret.region
		var nodes = view.nodesInRegion(region)

		nodes.map do |match|
			if match:node.matches('._imnewline')
				log 'found tab in selection',match
				unless match:mode == 'start'
					match:node.indent

		view.caret.dirty
		self

	def undent e
		log 'imblock.undent',arguments
		var nodes = e.view.nodesInRegion(e.region.clone.startAtLine)
		nodes.map do |match|
			if match:node.matches('._imnewline') && match:mode != 'start'
				match:node.undent
				# e.caret.expand(0,-1)
		view.caret.expandToLines
		e.handled

	def pairable str,e
		return true

	def wrap node
		self.children = [node]
		self

	def repair
		# log "repair block"
		%(imraw).map do |raw| raw.repair
		self

	def rehighlight
		# var reg = view.sel.region
		var state = codeState
		var hl = IM.parse(state:code)
		# could send this through load instead
		# what about annotations here?
		throw 'dont rehighlight'

		if hl
			view.observer.pause do
				dom:innerHTML = hl + '\n'
				state:invalids.map do |inv|
					# we could go local instead
					if var node = view.nodeAtRegion(inv:region,yes)
						log 'found node at invalid position',node
						node.replaceWith(inv:node)
		self

	# bad naming
	def codeState
		var real = code
		var valid = real
		var invalids = %(.invalid)
		var ownreg = region
		var selreg = view.sel.region

		var remember = invalids.map do |inv|
			# multilevel nesting?
			var region = inv.region
			var relreg = region.relativeTo(ownreg)
			log 'invalid region',ownreg,'self',region,relreg
			valid = valid.ins(inv.placeholder,relreg)
			return {region: region, placeholder: inv.placeholder, raw: inv.code, node: inv, root: self, relRegion: relreg}

		return {
			region: ownreg
			marker: (selreg.intersects(ownreg) ? selreg : null)
			raw: real
			code: valid
			invalids: remember
		}


tag iminterpolated < imblock

tag indent < imblock

	def variables
		var map = {}
		var vars = []
		%(lvar).map do |lvar|
			var name = lvar.text
			unless map[name]
				map[name] = yes
				vars.push(name)
		return vars

tag impair < imblock
	type 'pair'

	def self.pair open, close
		self:prototype.@open = open
		self:prototype.@close = close
		self

	def open do @open or ''
	def close do @close or ''

	def setup
		gen
		self

	def content= content
		throw 'should not get here'
		dom:innerHTML = open + IM.parse(content) + close
		self

	def isEmpty
		code.replace(/[\s\t \n]/,'') == (open + close)

	def isPaired
		var code = code
		code[0] == open and code[code:length - 1] == close

	def isOpened
		code[0] == open

	def isClosed
		code[code:length - 1] == close

	def unwrap
		if isEmpty
			log 'remove the whole thing'
			orphanize
		else
			var el 
			var par = parent
			while el = @dom:firstChild
				par.dom.insertBefore(el,@dom)
			# remove self as well
		return self

	def onunwrap e
		log 'impair onunwrap!!!',e
		e.halt

	def gen
		self.children = [
			<imopen> open
			<imclose> close
		]
		self

	def oninserted e
		e.caret = region.collapse(no).move(1)
		self

	def select
		self

	def onlinebreak e
		var pre = e.linestr('pre')
		var indent = e.indent
		var new = text.ins('',e.relRegion)

		# this is a special case - no?
		if new == (open + close)
			var prefix = '\n' + indent + '\t'
			var post = '\n' + indent
			onwhitespace(e,prefix + post)
			e.caret.collapse(no).move(-post:length)
			return e.handled

		# need to first consider the splitting, no?
		indent += '\t' if increaseIndent(pre)
		indent = indent.slice(1) if decreaseIndent(pre)
		onwhitespace(e,'\n' + indent)
		return e.handled

	def repair
		log 'repair imtag'
		revalidate(true) unless isPaired
		self

	def mutated
		log 'impair mutated'
		revalidate

	def defaultValidationMode
		'tokenize'

	def rehighlight
		self

	def revalidate mode = defaultValidationMode, write = no
		# tricky motherfucker -- mostly useful for validations
		# I suppose we can do this a simpler way -- by turning
		# off observers -- temporarily replacing inner code etc

		# when a block checks validity it should probably
		# substitute inner invalid parts - so that the block
		# thing is still valid
		var wasInvalid = hasFlag('invalid')
		var oldState = hasFlag('invalid')
		var state = codeState
		var code = state:code

		unless isPaired
			return markInvalid

		console.log 'will revalidate with code',code
		console.time('revalidate')

		try 
			if mode == 'compile'
				@output = Imbac.compile(code,{bare: yes})
				@tokens = @output:options.@tokens
			else
				@tokens = Imbac.tokenize(code,{bare: yes})
			markValid
		catch e
			@tokens = null
			markInvalid

		console.timeEnd('revalidate')

		if wasInvalid and @tokens
			# need to fix inner for root
			if var hl = Highlighter.highlight(code, tokens: @tokens, inner: yes)
				# this should be refactored out into a separate method
				# possibly do loadState / dumpState
				view.observer.pause do
					dom:innerHTML = hl
					state:invalids.map do |inv|
						if var node = view.nodeAtRegion(inv:region,yes)
							node.replaceWith(inv:node)
					view.sel.set(state:marker) if state:marker

		return self

	def placeholder
		open + (' ').repeat(size - 2) + close

	def isAtomic
		yes

	def mutated
		# log 'muated imcurly'
		view.parser.reparse(dirtyExtent)
		self

tag imcurly < impair
	type 'curly'
	pair '{', '}'

tag imsquare < impair
	type 'square'
	pair '[', ']'

	def prettify e
		log 'prettify!'
		e.handled if e
		# var ind = e.region.indent
		var ind = '' # '\t'
		log 'with indentation',ind,ind:length

		view.observer.pause do 
			for child in children
				if child.matches('.comma,._imopen')
					child.setNext('\n' + ind + '\t')
				elif child.matches('._imclose')
					child.setPrev('\n' + ind)

		true

tag imparens < impair
	type 'parens'
	pair '(', ')'

	def onunwrap e
		log 'impair onunwrap!!!',e
		e.halt
		# look at prev and next as well?
		# should do this through the view
		code = ' ' + code.slice(1,-1)
		view.repair

tag imistring < impair
	type 'istring'
	pair '"', '"'

tag imiexpr < impair
	type 'iexpr'
	pair '{', '}'

tag imblockparams < impair
	type 'blockparams'
	pair '|', '|'

tag imtagnode < impair
	type 'tagnode'
	pair '<', '>'

	def pairable str,e
		str in ['{','[','(','"',"'"]

	def placeholder
		open + ('x').repeat(size - 2) + close

	def defaultValidationMode
		'compile'
