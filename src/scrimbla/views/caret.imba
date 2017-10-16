
import '../core/util' as util
import List from '../core/list'
import Region from '../region'
import Command from '../core/command'

import RangeView from './range'

export tag CaretView < RangeView
	
	def view
		object.view

	def region
		object.region

	def unblink force = no
		# if force
		# 	log 'CaretView unblink!'
		unflag('blink')
		@unblinked = Date.now
		render
		self

	def blink
		unless (Date.now - @unblinked) < 100
			flag('blink')
		self

	def render
		super
		setFlag('color',object.color)
		flag('active',object.active)

tag caretview < CaretView