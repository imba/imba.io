
tag imroot < imblock

	prop view

	@nodeType = 'code'
	# def self.dom
	#	@dom ||= document.createElement('code')

	def tryUndent e
		log 'tryUndent'
		var nodes = e.view.nodesInRegion(e.region.clone.startAtLine)
		nodes.map do |match|
			if match:node.matches('._imnewline') && match:mode != 'start'
				match:node.undent
				view.caret.move(-1)
				# e.caret.move(-1)
				# e.caret.expand(0,-1)

		# e.moveCaret = 0
		e.handled
		self

	def next= node
		appendChild(node)
		return node

	def prev= node
		var first = dom:firstChild
		first ? insertBefore(node,first) : appendChild(node)
		return node

	def onlinebreak e
		var pre = e.linestr('pre')
		var indent = e.indent
		var new = text.ins('',e.relRegion)
		# need to first consider the splitting, no?
		indent += '\t' if increaseIndent(pre)
		indent = indent.slice(1) if decreaseIndent(pre)
		onwhitespace(e,'\n' + indent)
		return e.handled

	def mutated
		log 'imroot mutated'
		return self

	def dirtyExtent
		log 'imroot dirtyExtent'
		# super
		var nodes = children.map(|n| n.dom )

		return {
			code: code
			nodes: nodes
			parent: dom
			contains: do |el| dom.contains(el.@dom or el)
		}
		