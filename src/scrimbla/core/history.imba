class HistoryState

	prop data
	prop timestamp

	def initialize data = {}
		@timestamp = Date.new
		@data = data
		self

	def apply view
		self

	def update data
		@data = data
		@timestamp = Date.new
		self
		

class FullHistoryState < HistoryState

	def apply view
		view.loadState(@data)
		self

class DiffHistoryState < HistoryState

var types = {}

class Command

	prop prev
	prop next
	prop frame

	def self.sym sym, *pars
		self:prototype.@symbol = sym
		self:prototype.@signature = pars
		types[sym] = self
		self

	def self.load o
		var typ = types[o[0]]
		var frame = o[1]
		var cmd = typ.build(o[2])
		cmd.frame = frame
		return cmd

	def self.build params
		self.new(params)

	def initialize params
		@params = params

	def data
		@data

	def params
		@params

	def undo view
		prev

	def redo view
		self

	def enter view
		self

	def remove
		prev.next = next if prev
		next.prev = prev if next
		self

	def toJSON
		[@symbol,@frame or 0,params or []]

class Mark < Command

	sym 'M', 'value'


class Snapshot < Mark

	sym 'S', 'code'

	def initialize params
		@code = params[0]

	def params
		[@code]

	def redo view
		console.log 'load',@code
		view.load @code
		# must repair? what about annotations?
		self

class Selection < Command

	sym '|', 'old', 'new'

	def self.load val
		self.new(val)

	def initialize params
		@old = params[0]
		@new = params[1]

	def params
		[@old,@new]

	def redo view
		view.caret.set(JSON.parse(@new))
		self

	def enter view
		redo(view)
		self

	def undo view
		# we need to know about the previous selection for this?
		# can either store both - or traverse backwards to the previous
		# command like this
		var old = JSON.parse(@old)
		console.log 'move selection back to old',old,data
		view.caret.set(old)
		prev


class Insert < Command

	sym '+', 'point', 'str'

	def initialize pars
		@point = pars[0]
		@str = pars[1]

	def params
		[@point,@str]

	def redo view
		console.log 'redo Insert'
		view.insert(@point,@str)

	def undo view
		console.log 'undo Insert'
		view.erase([@point, @point + @str:length])
		prev

class Erase < Command

	sym '-', 'region', 'str'

	def initialize params
		@region = params[0]
		@str = params[1]

	def params
		[@region,@str]

	def redo view
		console.log 'redo Erase'
		view.erase(@region)

	def undo view
		# if we dont know the text to 
		console.log 'undo Erase'
		view.insert(@region.start,@str)
		prev


export class History
	
	prop mode
	prop view
	prop enabled
	prop current
	prop seed
	prop tail # is this behind or in the very front?

	def initialize view
		@mode = 'normal'
		@view = view
		@enabled = yes
		@active  = no
		current = @seed = Mark.new
		self

	def add item, move = yes, frame = view.frames
		item.frame = frame

		if current
			# if current has a next event
			# this should be detached here?
			item.prev = current
			current.next = item

		current = item if move
		self

	def next
		current?.next

	def prev
		current?.prev

	def update o
		return self

	def move dir = 1
		self

	def redo
		apply do 
			while next
				next.redo(view,self)
				current = next
				break if current isa Mark
		self

	def undo
		apply do
			# should be possible to undo 
			while current
				current = current.undo(view,self) if prev
				current?.enter(view,self)
				break if current isa Mark

		self

	def apply cb
		@active = yes
		cb and cb()
		@active = no
		self

	def batch cb
		self

	def enter state
		state.apply(view)
		self

	def onerase reg, str, edit
		return self if @active
		add Erase.new([reg, str])
	
	def oninsert loc, str, edit
		return self if @active
		add Insert.new([loc,str])

	def oncaret old, new
		return self if @active
		add Selection.new([old or new,new])

	def onload code
		return self if @active
		var mark = Snapshot.new([code])
		add mark

	def mark value
		return self if @active
		var mark = Mark.new([value])
		add mark

	def tick
		
		if @mode == 'play'
			# console.log 'plyaing'
			var frame = view.frames - @offset
			# console.log 'history.tick will play',frame,next,current
			apply do
				while next and next.frame <= frame
					# console.log 'history.tick play',frame,next,current
					# console.log 'replay frame!'
					next.redo(view,self)
					current = next

			unless next
				mode = 'live'
		self

	def play
		# should probably happen in a different manager
		var snap = seed
		until !snap or snap isa Snapshot
			snap = snap.next

		@offset = view.frames - snap.frame
		console.log "playing from seed",snap,@offset
		# console.log 'found snapshot?!? -- offset frame',@offset
		apply do current = snap.redo(view,self)
		mode = 'play'
		self

	def toJSON
		var data = []
		var step = @seed

		while step
			data.push(step.toJSON)
			step = step.next

		return {commands: data}

	def load data
		var step = seed
		for params in data:commands
			var item = Command.load(params)
			item.prev = step
			step.next = item
			step = item
			# console.log 'load item',item
		# console.log 'loaded'
		self


		