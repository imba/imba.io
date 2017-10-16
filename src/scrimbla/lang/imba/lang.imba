import Lang from '../base/lang'
import Highlighter from '../../core/highlighter'

export class ImbaLang < Lang
	register 'imba'

	def worker
		IM.worker

	prop annotations

	def rawToHTML code
		Highlighter.highlight(code)

	def reparse chunk
		Highlighter.reparse(chunk)

	def annotate view
		# should have created an instance for the view

		var state = view.root.codeState
		var code = state:code
		console.log 'annotating'

		var apply = do |meta|
			ANNO = @annotations = meta
			var vars = []
			for scope in meta:scopes
				for v in scope:vars
					vars.push(v)


			var warnings = meta:warnings or []
			# dont show errors when not editing
			if view.editable
				var oldWarnings = view.hints.filter do |hint|
					hint.group == 'analysis'

				# if the hints already exists - dont add them again
				warnings.map do |warn|
					warn:type ||= 'error'
					warn:group = 'analysis'

					let reg = warn:loc or warn:region
					# console.log 'region for warning',reg,warn
					for prev,i in oldWarnings
						# console.log 'prev warning',prev.region,reg
						if prev.region and prev.region.equals(reg)
							# console.log 'found existing warning for this?',prev
							prev.update(warn)
							oldWarnings[i] = null
							return

					view.hints.add(warn)

				if oldWarnings
					view.hints.rem oldWarnings.filter(|hint| hint)

			view.trigger(:annotate,meta)

			return self if warnings:length

			var nodes = IM.textNodes(view.root.dom,yes)
			# what about removing old warnings?

			var map = {}
			for node,i in nodes
				map[node.@loc] = node

			# get textNodes with mapping(!)
			for variable,i in vars
				for ref,k in variable:refs
					var a = ref:loc[0]
					var b = ref:loc[1]
					var eref = "v{i}"

					if map[a]
						let dom = map[a]:parentNode
						let oldRef = dom.getAttribute('eref')
						let el = tag(dom)
						if el and el:setEref
							el.eref = eref
							el.setFlag('vartype',"{variable:type}ref")

			return

		try
			console.time('analyze')
			worker.analyze(code, bare: yes) do |res|
				console.log 'result from worker analyze'
				console.timeEnd('analyze')

				if res:meta
					console.time('annotate')
					apply(res:meta)
					console.timeEnd('annotate')
				else
					yes
				
		catch e
			console.log 'error from annotate',e
