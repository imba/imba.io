import Highlighter from '../core/highlighter'
import '../core/util' as util

# dangerous to extend all htmlelement tags globally
extend tag htmlelement

	def bubble name, data
		# log "bubble event",name,data
		var ev = Imba.Events.trigger(name,self,data: data, bubble: yes)
		return ev

	def delay name, time, blk
		@timeouts ||= {}
		clearTimeout(@timeouts[name])
		@timeouts[name] = setTimeout(blk,time) unless time == -1
		self

	def next= el
		if el isa IMFragment
			el = Array:prototype:slice.call(el.dom:childNodes)

		if el isa Array
			for item,i in el.reverse
				self.setNext(item)
			return self

		var curr = dom:nextSibling
		if el isa String
			el = document.createTextNode(el)

		if curr
			parent.insertBefore(el, curr)
		else
			parent.appendChild(el)

		return el

	def prev= el
		if el isa IMFragment
			el = Array:prototype:slice.call(el.dom:childNodes)
			# el = [].concat(el.dom:childNodes)

		if el isa Array
			setPrev(item) for item,i in el
			return self

		var curr = dom:prevSibling
		if el isa String
			el = document.createTextNode(el)
		parent.insertBefore(el,self)
		# parent.insert(el, before: self)
		return el

	def nextNode
		dom:nextSibling

	def prevNode
		dom:prevSibling

IM.Types = {}

tag im < b

	def self.key key, handler
		self:prototype["handle{key}"] = handler
		self

	def self.native typ
		@nativeType = typ
		self

	def self.type typ
		IM.Types[typ] = self
		@type = typ
		self:prototype.@type = typ
		# @domFlags.push(typ) if @domFlags
		self

	type 'Tok'

	def self.alias typ
		IM.Types[typ] = self
		self

	def self.trigger match, cmd
		if cmd isa Function
			cmd = {command: cmd}

		cmd:trigger = match
		self:prototype["trigger-{match}"] = cmd

	def hint= hint
		if hint and hint != @hint
			setAttribute('hint',hint.ref)
			setAttribute("hint-type",hint.type)
		else
			removeAttribute('hint')
			removeAttribute('hint-type')
		@hint = hint

	def hint
		# strange no?		
		@hint or view.hints.get(getAttribute('hint'))
	
	# go over to using this 
	def walkTextNodes mark = no
		root = dom
		var el
		var nodes = []
		var pos  = 0
		var walk = document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false)

		while el = walk.nextNode
			if mark
				var len = el:length
				el.@loc = pos
				pos += len
			nodes.push(el)

		return nodes


	def util
		util

	def select
		view.localCaret.set(region,yes)

	def canPrepend text
		no

	def canAppend text
		no

	def log
		view.logger.log(*arguments)
		self

	def toString
		dom:outerHTML

	def spaced
		if dom:nextSibling isa Text
			return (/[\t ]/).test(dom:nextSibling:textContent[0])
		return false

	def unspaced
		!spaced

	def nextImmediate
		# could be text as well?
		dom:nextSibling isa Text ? null : next

	def prevImmediate
		# could be text as well?
		dom:previousSibling isa Text ? null : prev

	def repair
		self

	def text
		dom:textContent

	def text= text
		dom:textContent = text
		self

	def code
		dom:textContent

	def setCode code, silent = no
		var prev = self.code

		if @dom:firstChild == @dom:lastChild and @dom:firstChild isa Text
			# still set if it has not changed?
			@dom:firstChild:textContent = code
		else
			@dom:textContent = code

		if code != prev
			hint?.changed
			onchanged(code,prev) unless silent
		self

	def onchanged code, prev
		flag('dirty')

	def size
		code:length

	def view
		@view or (parent?.view) or VIEW
		
	def sel
		view.caret

	def region
		view.regionForNode(self)

	def loc
		region.loc

	def load
		self

	def decreaseIndent pre, state
		false

	def increaseIndent pre, state
		var reg = /^(\s*(.*\=\s*)?(class|def|tag|unless|if|else|elif|switch|try|catch|finally|for|while|until|do))/
		reg.test(pre)

	def erase region, mode
		if mode == 'all'
			orphanize
		else
			code = util.patchString(code,'',region) # code.ins('',region)
		self

	def insert region, str, edit, mode: null
		code = util.patchString(code,str,region)
		self

	def oninserted e
		self
	
	def oncommand e, cmd
		var name = cmd:command
		var fn = self[name]
		log 'run oncommand',name,cmd

		if fn isa Function
			fn.call(self,e,cmd)
		self

	def indentBlock e
		log 'im.indentBlock',arguments,self
		self

	def clone val
		IM.tok(val).classify

	def validate code
		false

	def isFirst
		var par = parent
		par isa IM.Types.Tok and par.dom:firstChild == dom

	def isLast
		var par = parent
		par isa IM.Types.Tok and par.dom:lastChild == dom

	def isValid code = text
		validate(code)

	def markInvalid
		flag('invalid')
		self

	def markValid
		unflag('invalid')
		self

	def isInvalid
		hasFlag('invalid')

	def classify
		self

	# unwrap / remove this node from parent
	def unwrap
		var el = dom
		var par = el:parentNode

		while el:firstChild
			par.insertBefore(el:firstChild, el)
		return self

	def replaceWith other
		prev = other
		orphanize

	def scope
		closest(%indent)

	def mutated muts
		# remove node if it is orphanized
		if code == ''
			log 'remove whole node'
			# should possibly
			orphanize
		else
			log 'mutated -- reparse'
			view.observer.pause do
				view.parser.reparse(dirtyExtent)


	def reclassify type
		# reclassify should happen through the highlighter
		# log 'reclassify node as type',type
		var cls = IM.Types[type] or Imba.TAGS["im{type}"]

		if cls
			# log 'found class to reclassify as',cls,self:constructor
			if cls == self:constructor
				return self

			# log 'found class to reclassify as',cls
			var node = cls.new(dom).use
			return node
		self

	def reparsed
		self

	def baseClasses
		var cls = self:constructor.dom:className
		cls += ' ' + @type if @type
		return cls

	def setup
		self

	def use
		@dom:className = baseClasses
		self

	def reuse
		use(*arguments)

	def isAtomic
		no

	# find the nodes / region that should be reparsed if this element has changed
	# this is currently quote 
		
	def dirtyExtent
		# 3log "get dirty extent for",dom
		if let sel = up(%.selector)
			return sel.dirtyExtent

		elif let sel = up(%imtagnode)
			return sel.dirtyExtent

		elif let sel = up(%imistring)
			return sel.dirtyExtent

		if isAtomic # hmm
			return {
				nodes: [dom],
				code: code,
				contains: do |el| dom.contains(el.@dom or el)
			}

		var start = dom
		var end = dom

		var prev, next
		var nodes = [dom]
		var opener, closer

		while prev = start:previousSibling
			if prev isa Text
				break
			elif tag(prev).matches('._imnewline,._imtab') # ,._imopen,._imclose
				break
			
			if tag(prev).matches('._imopen')
				opener = prev
			
			start = prev
			nodes.unshift(start)

		while next = end:nextSibling
			if next isa Text
				break
			elif tag(next).matches('._imnewline') # ._imopen,._imclose
				break

			if tag(next).matches('._imclose')
				closer = next

			end = next
			nodes.push(end)

		# see if we include an open or close-tag

		var result = {
			nodes: nodes,
			code: "",
			target: dom,
			nested: [],
			contains: do |node| this:nodes.indexOf(node) >= 0
		}

		if opener or closer
			# log "includes opener and / or closer",opener,closer
			let par = tag((opener or closer):parentNode)
			if par?.isAtomic
				# log 'return the parent dirty extent',par
				return par.dirtyExtent

			nodes = for el in (opener or closer):parentNode:children
				el

		var loc = 0

		# should use the tags directly
		for node in nodes
			var rich = tag(node)
			var text = node:textContent
			var len = text:length

			if false and rich and (rich isa IM.Types:pair or rich.isInvalid)
				text = "'§§§'"
				len = 5
				log "added node as nested reference",rich.dom
				# this is fucked up
				# this really does mess up the rich nodes here(?!)
				result:nested.push(rich)

			result:code += text
			loc += len

		result:nodes = nodes
		return result

	def reparseExtent e
		view.observer.pause do 
			var dirty = dirtyExtent
			e.handled if e
			view.parser.reparse(dirty)

tag imindex < im
	type 'index'

# piece of unparsed code
tag imraw < im
	type 'raw'
	alias '@'

	def raw= raw
		@raw = raw
		@dom:textContent = raw
		self

	def onedit e
		code = e.patch(self)
		return e.handled

tag imfragment < imraw
	type 'fragment'

	def setContent content
		if typeof content == 'string'
			dom:innerHTML = content
		else
			super
		return self
	
	def repair
		unwrap
		orphanize
		self

IMFragment = Imba.TAGS:imfragment

tag imvalue < im
	type 'value'

tag imopen < im

	# @nodeType = 's'
	type 'open'

	alias '['
	alias '('
	alias '{'
	alias '{{'
	alias 'index_start'
	alias 'block_param_start'

tag imclose < im

	type 'close'
	# @nodeType = 's'

	alias ']'
	alias ')'
	alias '}'
	alias '}}'
	alias 'index_end'
	alias 'block_param_end'

tag imrparen < imclose
	type 'rparen'
	alias ')'

tag imtagopen < imopen
	type 'tag_start'

tag imtagclose < imclose
	type 'tag_end'

tag imselopen < imopen
	type 'selector_start'

tag imselclose < imclose
	type 'selector_end'

tag imquote < im

tag imsinglequote < imquote
	type "'"

tag imdoublequote < imquote
	type '"'

tag imstrstart < imopen
	type 'string_start'

tag imstrend < imclose
	type 'string_end'
