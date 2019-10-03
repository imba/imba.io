var fs = require 'fs'
var path = require 'path'

import LanguageGuide from '../util/languages'

export class Guide
	var instance = []
	def self.get lang
		instance[lang] ||= Guide.new(lang)
		
	prop docs

	def locateRoot lang
		const location = LanguageGuide(lang)
		path.resolve(__dirname,"../../{location}")

	
	def initialize lang
		# var path = require 'path'
		var md = require '../util/markdown'
		var root = locateRoot(lang)
		var docs = []
		var guides = []
		var guide = null # {sections: []}
		var toc = []
		var data = {toc: toc}
		var lastDoc = null
		
		var add = do |dir|
			let parts = []

			for filename in fs.readdirSync(dir).sort
				let id = filename.replace(/^\d+\-/,'').replace(/\.md$/,'')
				let src = path.resolve(dir,filename)
				# console.log "found directory"
				if fs.lstatSync(src).isDirectory
					let prev = guide
					toc.push(guide = {id: id.toLowerCase, title: id, sections: []})
					add(src)
					guide = prev
				else
					continue unless filename.toLowerCase().endsWith(".md")
					
					let file = fs.readFileSync(src,'utf-8')
					let doc = md.render(file)
					
					let route = guide ? (guide:id + '/' + id) : id
					# doc:guide = guide:id
					doc:id = doc:route = route
					if !doc:title and doc:toc[0]
						doc:title = doc:toc[0]:title
					
					data[route] = doc
					parts.push(doc) unless doc:type == 'snippet'
			
			parts = parts.sort do |a,b|
				a:order - b:order
				
			for part,i in parts
				if let next = parts[i + 1]
					part:next = next:id
					next:prev = part:id
				guide:sections.push(part:id) if guide
						
		add(root)
		@docs = data
		return self
		