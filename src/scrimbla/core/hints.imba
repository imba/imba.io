import Region from '../region'

var labels =
	"Unexpected 'TAG_END'": 'Tag closed unexpectedly'
	"Unexpected 'TERMINATOR'": 'Unexpected <b>⏎</b>'
	"Unexpected 'POST_IF'": 'Missing body in <b>if</b>'
	"Unexpected 'DEF_EMPTY'": 'Unexpected <b>def</b>'

var rules = [
	[/Uncaught Error: tag (\w+) is not defined/,"tag <b>$1</b> does not exist"]
	[/tag\$\.\$([\w\_]+) is not a function/,"tag <b>$1</b> is not defined"]
	[/\_T\.(\w+)\(\.\.\.\)\.set(\w+) is not a function/,(do |m,a,b| "setter {b.toLowerCase} not found")]
]

export class Hint

	def self.build o, view, ref
		self.new(o, view, ref)

	prop view
	prop region
	prop active
	prop data

	def initialize opts, view, ref
		@ref = ref
		@view = view
		@data = opts
		active = no
		@region =  Region.normalize(opts:loc or opts:region,view)
		@node = opts:node
		self

	def update data
		@data = data
		@label = null
		console.log 'updating hint'
		self

	def getAttribute key
		@data[key]

	def setAttribute key,val
		@data[key] = val
		self

	def type
		@data:type or 'error'

	def group
		@data:group

	def ref
		@ref

	def node
		@node ||= @region and view.nodeAtRegion(@region)

	def row
		region.row

	def col
		region.col

	def label
		@label ||= if true
			var lbl = @data:label or @data:message or 'Hint'
			lbl = lbl.split(/error at (\[[\d\:]*\])\:\s*/).pop
			lbl = labels[lbl] or lbl

			for rule in rules
				if rule[0].test(lbl)
					lbl = lbl.replace(rule[0],rule[1])
			lbl


	def activate
		unless active
			active = yes
			view.listeners.emit('ShowHint',self)
		self

	def deactivate
		if active
			active = no
			view.listeners.emit('HideHint',self)
		self

	def deactivateOnIntersect
		!data:ref

	def deactivateOnEdit
		group == 'runtime' && !data:ref

	def prune
		# why not remove immediately?
		view.hints.prune(self)

	# should make this hint ready to be removed
	def cleanup
		self

	def remove
		view.hints.rem(self)
		deactivate
		return self

	def changed
		# console.log 'deactivate on changed!'
		# @deactivate = yes
		prune
		self

	def adjust reg, ins = yes
		return self unless region
		# console.log 'adjust hint',reg,data
		if region.intersects(reg)
			# deactivate
			region.adjust(reg,ins)
			prune if deactivateOnIntersect
		else
			region.adjust(reg,ins)
		self

	def popup
		<hintview@popup[self]>

	def toJSON
		{
			type: type
			group: group
			ref: ref
			region: region.toArray
			label: label
		}


# TODO use List

export class Hints
	
	var nr = 0

	def initialize view
		@prune = []
		@array = []
		@map = {}
		@view = view

	def toArray
		@array

	def get ref
		@map[ref]

	def activate
		for item in @array
			item.activate
		self

	# this should take care of deallocating the hint no?
	def rem hint
		if hint isa Function
			hint = @array.filter(hint)

		if hint isa Array
			rem(item) for item in hint
			return hint

		if hint isa String
			return rem get(hint)

		if @array.indexOf(hint) >= 0
			hint.deactivate
			hint.cleanup
			@map[hint.ref] = null # remove reference to the hint
			@array.splice(@array.indexOf(hint),1)

		return hint

	def prune hint
		@prune.push(hint) unless @prune.indexOf(hint) >= 0
		return self

	def clear
		var arr = @array
		@array = []

		for item in arr
			item.deactivate
		self

	def cleanup

		@array.map do |item|
			if @prune.indexOf(item) >= 0
				item.deactivate
				rem(item)
		@prune = []
		self


	def filter cb
		@array.filter(cb)

	def map cb
		@array.map(cb)

	def add o, ref = null
		ref ||= "h{nr++}"
		o = Hint.build(o,@view,ref) unless o isa Hint
		@map[ref] = o
		@array.push(o)
		return o