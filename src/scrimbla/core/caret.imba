import './util' as util
import List from './list'
import Region from '../region'
import Command from './command'

export class Caret
	
	prop view
	prop region watch: yes
	prop collapsed
	prop active
	prop color
	prop session
	# remember column

	def buffer
		view.@buffer

	def initialize view, options = {}
		@view = view # should rather be for buffer, no?
		@region = Region.new(0,0,view.root,view)
		@collapsed = yes
		@options = options
		color = @options:color
		self

	def adjust rel, ins = yes
		region.adjust(rel,ins)
		self

	def set region, broadcast = no
		# console.log 'Caret.set',region
		self.region = Region.normalize(region,view)
		collapsed = no if self.region.size > 0
		unblink(yes)
		self

	def regionDidSet new, old
		if !old or (new and !new.equals(old))
			var mode = view.@batch

			var opts = {
				region: new.toJSON,
				prev: old and old.toJSON,
				rel: old and new.relativeTo(old).toJSON
			}

			view.listeners.emit('SelectionModified',opts,self)
		self

	def destroy
		deactivate
		view.carets.remove(self)
		self

	def activate
		active = yes
		self

	def deactivate
		active = no
		self

	def modified
		self

	def broadcast
		self

	# what does this do?
	def normalize
		# head.normalize
		self

	def isCollapsed
		region.isCollapsed

	def isReversed
		region.reversed

	def size
		region.size

	def canEdit
		@active

	def decollapse
		# just a friendly flag to say that the caret
		collapsed = no
		# tail = head.clone if tail == head
		self
		
	def collapsed
		@collapsed and region.size == 0

	def move offset = 1, mode = 0
		return self if offset == 0
		console.log 'move caret-mark',offset,mode
		var new = region.clone
		var to = Math.max(Math.min(buffer.size,region.b + offset),0)

		new.b = to
		new.collapseToHead if @collapsed # confusing
		region = new
		unblink(yes)
		return self

	def expand a = 0, b = 0
		region.expand(a,b)
		self

	def expandTo reg
		var reg = Region.normalize(reg,view)
		region = reg
		self

	def alter offset = 1, mode = 0
		if mode == IM.CHAR
			move(offset)
		else
			var loc = buffer.offsetFromLoc(region.b,mode)
			console.log 'altered to new',loc,'from',region.b
			moveTo(loc)

		@realCol = null
		self

	def moveTo loc
		move(loc - region.b)

	def moveUp
		# first remember the current column
		var from = region.start
		var curr = buffer.locToCell(from)
		@realCol ||= curr[1]
		var cell = [curr[0] - 1,@realCol]
		var loc = buffer.cellToLoc(cell)
		# console.log 'move down from',curr,cell,loc,@realCol
		moveTo(loc) # simply move by that amount
		self

	def moveDown
		# var cell = region.cell
		var from = region.end
		var curr = buffer.locToCell(from)
		@realCol ||= curr[1]
		var cell = [curr[0] + 1,@realCol]
		# console.log 'move down from',curr,cell
		var loc = buffer.cellToLoc(cell)
		moveTo(loc) # simply move by that amount
		# first remember the current column

		self

	def collapseToStart
		region = region.clone.collapseToStart
		collapsed = yes
		self


	def collapseToEnd
		region = region.clone.collapseToEnd
		collapsed = yes
		self

	def expandToLines
		console.log 'caret expandToLines'
		collapsed = no
		region = region.clone.expandToLines
		self

	def selectAll
		collapsed = no
		# why change the previous region instead of creating a new one?
		region.a = 0
		region.b = buffer.len
		self

	def insert text, edit
		unless canEdit
			# console.log 'caret.insert -- not allowed'
			view.trigger('scrimbla:readonly',[self,'insert',text])
			return

		var sub = ''
		view.history.mark('action')
		unblink(yes)

		if !collapsed
			let reg = region
			if reg.size > 0
				sub = reg.text
				view.erase(reg)
			collapseToStart

		let sel
		# need a different syntax for $0 -- can be in regular pasted code
		# should have a separate command for insertSnippet probably.
		# what happens if we paste something that contains this?
		if text.indexOf('$0') >= 0
			sel = region.clone(0,sub:length).move(text.indexOf('$0'))
			text = text.replace('$0',sub)

		edit ||= {size: text:length}

		view.runCommand('Insert', region.start, text)

		if sel
			console.log 'sel modified!!',view.@batch
			region = sel
		return self

	def erase mode
		unless canEdit
			# console.log 'caret.erase -- not allowed'
			view.trigger('scrimbla:readonly',[self,'erase'])
			return

		unblink(yes)
		view.history.mark('action')

		if region.size == 0 # collapsed
			console.log 'isCollapsed',mode
			let reg = region.clone
			if mode
				reg.a = buffer.offsetFromLoc(reg.a,mode)
			else
				reg.expand(-1,0)
			view.erase(reg)
			return self

		console.log 'erasing region',region

		view.erase(region)
		# collapseToStart # should happen be default through adjust no?
		collapsed = yes
		return self

	def paste text, options = {}
		# remove invisible characters
		text = text.replace(/[\u200B-\u200D\uFEFF\x7F]/g, "")
		var multiline = text.indexOf('\n') >= 0

		# possibly reindent the first line with the supplied indentation
		if multiline and options:indent and text.indexOf(options:indent) != 0
			text = options:indent + text

		text = util.cleanIndent(text)

		# automatically reindent - should be possible to opt out
		text = util.reindent(text,indent,1)
		insert(text)

	def dirty
		self

	def text
		region.text

	def peekbehind reg
		var str = buffer.substringBeforeLoc(region.start)
		reg isa RegExp ? str.match(reg) : str

	def peekahead reg
		var str = buffer.substringAfterLoc(region.end)
		reg isa RegExp ? str.match(reg) : str

	def indent
		# TODO support other than tab-indent?
		var str = buffer.linestringForLoc(region.start)
		var ind = str.match(/^(\t*)/)[0]
		return ind

	def model
		self

	def node
		@node ||= <caretview[self].caret>

	def unblink force
		@node.unblink(force) if @node
		self

	def blink force
		@node.blink(force) if @node
		self

	def toJSON
		region.toJSON

export class LocalCaret < Caret
	
	def canEdit
		@active and view.editable


export class RemoteCaret < Caret

	def canEdit
		yes
	
	def node
		@node ||= <caretview[self].remote.caret>

export class Carets < List

	def initialize view
		@view = view
		@array = []
		self