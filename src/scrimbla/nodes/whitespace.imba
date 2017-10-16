tag iminsert < im

	def canAppend
		yes

	def canPrepend
		yes

	def insert reg, ins
		# console.log 'insert code into iminsert!!',ins,reg

		if ins isa IM.Types:fragment
			ins = ins.code
		elif ins isa IM.Types:raw
			ins = ins.@raw
		elif ins isa String
			ins = (self.code or "").ins(ins,reg)
		
		self.code = ins
		self

	def isWhitespace
		code.match(/^[\n\t\ ]+$/)

	def mutated
		# log 'iminsert mutated'
		var dirty = dirtyExtent
		view.parser.reparse(dirty)
		self

tag imwhitespace < im

	def canPrepend str
		validate( str + code )

	def canAppend str
		validate( code + str )

	def validate
		no

tag imnewline < imwhitespace

	type 'newline'
	alias '\n'

	def canPrepend str
		if str.match(/^[\n\t\ ]+$/)
			console.log 'newline can prepend'
			# should not really be able to prepend here
			# it shold rather insert a new newline in
			# an iminsert, and that should be able to
			# decide that no reparse is needed
			return yes
		return no

	def validate val = code
		val == '\n'

	def indent
		view.insert(region.end,'\t')
		self

	def undent
		log 'undent newline'
		var reg = region.clone.collapse(yes).clone(0,1)
		if reg.text == '\t'
			log 'can undent!!'
			view.erase(reg)

		# view.observer.pause do
		#	next.orphanize if next?.matches('._imtab')
		self

	def mutated
		# log 'imnewline mutated!!'
		# remove node if it is orphanized
		if code == ''
			log 'remove whole node'
			orphanize
		else
			log 'reparse newline'
			view.parser.reparse({nodes: [dom], code: code})

		

tag imspace < imwhitespace

	type 'whitespace'

	def validate val = code
		(/^[ ]+$/).test(val)

	# this should be the default for all nodes, no?
	def mutated o = {}
		return self if !o:deep and validate(code)
		super

tag imsemicolon < imwhitespace
	type 'semicolon'
	alias ';'

tag imtab < imwhitespace
	
	type 'tab'
	alias '\t'

	def onedit e
		if e.isSurrounded
			log 'delete tab?!?'
			if e.text # otherwise we really are done
				e.redirect(prev or next or parent)
			else
				e.handled

			e.region.collapse(no)
			orphanize
			return

	def validate val = code
		val == '\t'

var COMMENT = /^\#[ \t][^\n]*$/

tag imcomment < im

	type 'comment'

	def validate code
		console.log 'validatte comment',code
		COMMENT.test(code)

	def mutated
		log 'imcomment mutated'
		super

	def repair
		self
		log 'repair comment'
		var region = self.region.endAtLine
		var full = region.text # should not include the last line?
		var nodes = region.nodes(no)
		log 'whole region should be',region,full,nodes
		log 'all nodes',nodes

		# VERY temporary
		if nodes:length > 1
			code = full
			while nodes:length > 1
				var el = nodes.pop
				el:node.orphanize
		self

	def oninserted e
		repair

	def canPrepend text
		console.log 'canPrepend',text
		no

	def canAppend text
		console.log 'canAppend',text
		yes unless text.match(/[\n]/)


# allow inserting additional tabs directly here?

tag eof