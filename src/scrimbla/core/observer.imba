import './util' as util

export class Observer

	prop view
	prop config
	prop active

	def initialize view, cfg
		@active = no
		@view = view
		@config = cfg or { attributes: false, childList: true, characterData: true, subtree: true }
		@observer = MutationObserver.new do |muts| onmutations(muts)
		self
	
	def resume
		unless @active
			@observer.observe(view.root.dom, config)
			@active = yes
		self

	def pause blk
		var wasActive = @active
		@active = no
		@observer.disconnect if wasActive
		
		if blk isa Function
			blk()
			resume if wasActive

		self
	
	def paused
		!@active

	def onmutations mutations
		view.logger.group('mutations')

		var deep = no
		var nodes = []
		for mut in mutations
			view.log 'mutation',mut
			var type = mut:type
			var target = mut:previousSibling or mut:target

			if type == 'characterData'
				view.log "updated code to {target:textContent}"
				target = target:parentNode

			elif type == 'childList'
				deep = yes
				var add = mut:addedNodes
				if add:length == 1 and add[0] isa Element
					target = add[0]

			view.log target,tag(target)
			# var added = mut:addedNodes
			# for node in mut:addedNodes
			# if target and target:parentNode # and target.@tag
			if var el = tag(target)
				view.log 'add target?!'
				nodes.push(el) unless nodes.indexOf(el) >= 0

			# if we have added a node instead

		# mutations are not registered on node-level but on extent
		# not really how this should happen

		var common = util.commonAncestor(nodes)

		view.log 'common container for mutations is',common,nodes

		var extent

		if nodes:length == 1
			view.log 'a single node was mutated',nodes[0]
			nodes[0].mutated(deep: deep, mutations: mutations)
		else
			# collect extents for all nodes?
			# rather make a region expand 
			for node in nodes
				if extent and extent.contains(node.dom) # :nodes.indexOf(node.dom) >= 0
					view.log 'this node is already part of the extent',node.dom
				else
					extent = node.dirtyExtent
				# node?.mutated

			if extent
				# console.log 'found extent(!)',extent
				pause do yes

		view.logger.groupEnd
		view.onmutations(nodes: nodes, mutations: mutations, extent: extent)
		self
		
		