var fs = require 'fs'
var path = require 'path'

export class Guide
	var instance = null
	def self.get
		instance ||= Guide.new
		
	prop docs
	
	def initialize
		# var path = require 'path'
		var md = require '../util/markdown'
		var root = path.resolve(__dirname,"../../guide")
		var docs = []
		var guides = []
		var guide = {sections: []}
		var toc = []
		var data = {toc: toc}
		var lastDoc = null
		
		var add = do |dir|
			for filename in fs.readdirSync(dir).sort
				
				let id = filename.replace(/^\d+\-/,'').replace(/\.md$/,'')
				let src = path.resolve(dir,filename)
				console.log "found directory"
				if fs.lstatSync(src).isDirectory
					let prev = guide
					toc.push(guide = {id: id.toLowerCase, title: id, sections: []})
					add(src)
					guide = prev
				else
					continue unless src.indexOf('.md') >= 0
					let file = fs.readFileSync(src,'utf-8')
					let doc = md.render(file)
					let route = guide:id + '/' + id
					# doc:guide = guide:id
					doc:id = doc:route = route
					if !doc:title and doc:toc[0]
						doc:title = doc:toc[0]:title

					data[route] = doc
					if lastDoc
						lastDoc:next = route
						doc:prev = lastDoc:id
						console.log "found last Doc",lastDoc:id

					guide:sections.push(route)
					lastDoc = doc
		
		if false		
			for filename in fs.readdirSync(root)
				fs.lstatSync(path_string).isDirectory			
				let file = fs.readFileSync(path.resolve(root,filename),'utf-8')
				let doc = md.render(file)
				doc:id = filename.replace('.md','')
				console.log "found doc",doc:id,doc:order
				if doc:order
					docs[doc:order] = doc
		
		
		add(root)
		@docs = data
		return self
		