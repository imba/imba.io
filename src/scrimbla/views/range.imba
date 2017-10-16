export tag LineRangeView

export tag LocView
	prop view
	prop row watch: yes
	prop col watch: yes

	def rowDidSet new, old
		var val = "{new * 100}%"
		@dom:style:top = val

	def colDidSet new, old
		var val = "{new * 100}%"
		@dom:style:left = val

	def setup
		<self>
			<.mark>
			<.vbar>

export tag LineRegionView
	prop view
	prop row watch: yes
	prop col watch: yes
	prop len watch: yes

	def rowDidSet new, old
		var val = "{new * 100}%"
		@dom:style:top = val

	def colDidSet new, old
		var val = "{new * 100}%"
		@dom:style:left = val

	def lenDidSet new, old
		var width = "{new * 100}%"
		@dom:style:width = width


export tag RangeView

	prop view
	prop region
	prop row watch: yes

	def buffer
		view.@buffer

	def rowDidSet new, old
		var val = "{new * 100}%"
		@dom:style:top = val

	def ranges
		for reg,i in @regions
			<LineRegionView@{i}.part view=view row=reg[0] col=reg[1] len=reg[2]>

	def calculate
		var a = @a = @start = buffer.locToCell(region.start)
		var b = @b = @end = buffer.locToCell(region.end)
		var lc = @lc = (b[0] - a[0])

		if region.reversed
			@a = @end
			@b = @start

		self.row = @start[0]

		@regions = []

		for r in [0..@lc]
			# 80 is arbitrary
			var str = buffer.lines[@row + r]
			var c = r == 0 ? @start[1] : 0
			var l = r == @lc ? (@end[1] - c) : ((Scrimbla:util.colsForLine(str) - c) or 0.5)
			@regions.push([r,c,l])
		self


	def render
		let reg = region
		return self unless reg
		calculate

		<self.RangeView .collapsed=(region.size == 0)>
			if region.size > 0
				ranges
			aview
			bview

	def aview
		<LocView@aview.loc.a row=(@a[0] - row) col=(@a[1])>

	def bview
		<LocView@bview.loc.b row=(@b[0] - row) col=(@b[1])>