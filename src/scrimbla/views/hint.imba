import '../core/util' as util
import List from '../core/list'
import Region from '../region'
import Command from '../core/command'

import RangeView,LocView from './range'

tag hintview

	prop row watch: yes
	prop col watch: yes
	prop len watch: yes
	prop active watch: yes


	def rowDidSet new, old
		var val = "{new * 100}%"
		@dom:style:top = val

	def colDidSet new, old
		var val = "{new * 100}%"
		@dom:style:left = val

	def lenDidSet new, old
		var width = "{new * 100}%"
		@dom:style:width = width

	def activeDidSet bool
		setTimeout(&,0) do flag('active',bool)

	def buffer
		view.@buffer

	def view
		object.view

	def region
		object.region

	def render
		let reg = region
		return self unless reg

		console.log 'hintview render',object.active

		var a = @a = @start = buffer.locToCell(reg.start)
		var b = @b = @end = buffer.locToCell(reg.end)

		row = a[0]
		col = a[1]

		if a[0] == b[0] and reg.size > 1
			len = reg.size
		
		<self.hint .{object.type} active=(object.active) .collapsed=(reg.size == 0)>
			<.tip>
				<@label>
				<@arrow>
			<.line>

		if @hint != object.label
			@label.dom:innerHTML = @hint = object.label
		self

	# def render
	# 	super
	# 	# setFlag('color',object.color)
	# 	# flag('active',object.active)