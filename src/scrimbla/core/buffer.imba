import './util' as util
import Region from '../region'

export class Buffer

	prop view

	def initialize view
		@view = view
		@buffer = ''
		@cache = {}
		self

	def set buffer
		if buffer == @buffer
			return self

		@buffer = buffer
		@cache = {}
		@lines = null
		# should be updated through view instead?
		view.parser.onmodified(view)
		self

	def raw
		@buffer

	def refresh
		set view.root.code

	def lines
		@lines ||= if true
			@buffer.split('\n')

	def split
		@buffer.split(*arguments)

	def linecount
		lines:length

	def line nr
		if nr isa Number
			lines[nr] or ''
		else
			''

	def len
		@buffer:length

	def size
		len

	# location to 
	def loc-to-rc loc
		util.rowcol(self, loc)

	def location
		self

	def locToRow loc
		var ln = 0
		var len = 0
		for ln,i in lines
			len += ln:length + 1
			return i if loc < len
		return lines:length

	def locToCell loc
		if @cache[loc]
			return @cache[loc]

		var pos = loc
		var col = 0
		var row = 0
		var char

		var buf = @buffer
		var tabsize = @view.tabSize

		# go back to start of line
		# goes through the whole
		while char = buf[pos - 1]
			if char == '\n'
				break
			pos--

		# get column for slice
		while (pos < loc) and char = buf[pos]
			if char == '\t'
				var rest = tabsize - (col % tabsize)
				col += rest
			else
				col += 1
			pos++

		while char = buf[pos - 1]
			if char == '\n'
				row++
			pos--

		return @cache[loc] = [row,col]

	def cellToLoc cell
		var loc = 0
		var row = cell[0]
		var col = cell[1]
		var lines = lines

		if row >= lines:length
			return size

		for line,i in lines
			if i < row
				loc += line:length + 1 # the last line
			elif i == row
				var colLoc = util.colToLoc(line,col)
				loc += colLoc
			else
				break
		return loc
		
	def substr region, len
		if region isa Region
			@buffer.substr(region.start,region.size)

		elif region isa Number
			@buffer.substr(region,len or 1)
		else
			throw 'must be region or number'

	def toString
		@buffer or ''

	# analysis should happen in the buffer, not in the view?
	# hack - should introduce IM.INDENT_START instead
	def offsetFromLoc loc, mode, indented = yes
		# should be able to do this without using views
		# should instead iterate with pairings etc
		var chr
		var part
		var initial = loc

		if mode == IM.WORD_START
			loc -= 1
			while chr = @buffer[loc - 1]
				if chr in [' ','\t','\n','.','"',"'",'[','<','>','(','{',',']
					return loc
				loc -= 1
			return loc

		elif mode == IM.WORD_END
			while true
				chr = @buffer[loc + 1]
				if !chr or chr in [' ','\t','\n','.','"',"'",'>',']',')','}',',',':']
					return loc + 1
				loc += 1
			return loc

		elif mode == IM.LINE_END
			while chr = @buffer[loc]
				return loc if chr == '\n'
				loc++
			return loc
			# self.set(row,1000)

		elif mode == IM.LINE_START
			var start = 0
			while chr = @buffer[loc - 1]
				if chr == '\n'
					start = loc
					break
				loc--

			if indented
				# find first non-indented
				while @buffer[loc] == '\t'
					loc++

				if loc == initial
					return start

			return loc

		return loc

	def linestringForLoc loc
		var a = offsetFromLoc(loc,IM.LINE_START,no)
		var b = offsetFromLoc(loc,IM.LINE_END)
		return @buffer.substr(a,b - a)


	def substringBeforeLoc loc
		var a = offsetFromLoc(loc,IM.LINE_START,no)
		return @buffer.substr(a,loc - a)

	def substringAfterLoc loc
		var b = offsetFromLoc(loc,IM.LINE_END)
		return @buffer.substr(loc,b - loc)