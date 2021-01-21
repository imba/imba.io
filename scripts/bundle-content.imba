

const chokidar = require 'chokidar'
const path = require 'path'
const fs = require 'fs'
const marked = require '../src/util/markdown'

const bundle = 'content'
const root = path.resolve(__dirname,'..','content')
const dest = path.resolve(__dirname,'..','public')
const imbasrc = path.resolve(__dirname,'..','node_modules','imba','dist')

const data = {
	path: ''
	children: []
}

const examples = {

}

const models = { }
const map = {'.': data}
const watcher = chokidar.watch(root)

def sort item
	if item.type == 'dir'
		item.children.sort do(a,b) a.sortKey > b.sortKey ? 1 : -1
		for child in item.children when child.type == 'dir'
			sort(child)
	return item

def save
	sort(child) for child in data.children
	let json = JSON.stringify(data,null,2)
	let js = "globalThis['{bundle}.json'] = {json}"
	# fs.writeFileSync(path.resolve(dest,"{bundle}.json"),json)
	fs.writeFileSync(path.resolve(dest,"{bundle}.json.js"),js)

	let examples-json = JSON.stringify(examples,null,2)
	# let js = "globalThis['{bundle}.json'] = {json}"
	fs.writeFileSync(path.resolve(dest,"examples.json"),examples-json)
	

watcher.on('all') do
	let abs = $2
	let is-dir = $1.indexOf('Dir') >= 0
	let rel = path.relative(root,abs)
	let sorter = path.basename(rel)
	let src = rel.replace(/\b\d+\-/g,'')
	let name = path.basename(src)
	let dirname = path.dirname(src)

	return if name == '.DS_Store' or src == '' or name.match(/\-(\.\w+)?$/)
	# console.log 'watcher',$1,src,dirname

	let up = map[dirname]
	let id = "/{src}"
	let item
	if $1 == 'addDir'
		item = {
			sortKey: path.basename(rel)
			type: 'dir'
			name: name
			children: []
			sorted: sorter != name
			# path: '/' + src
		}

	elif $1 == 'add' or $1 == 'change'
		item = {
			sortKey: path.basename(rel)
			type: 'file'
			name: name
			body: fs.readFileSync(abs,'utf8')
			ext: name.split('.').pop()
			# path: '/' + src
			fullPath: abs
		}

		if name == 'meta.json'
			let meta = JSON.parse(item.body)
			for own k,v of meta
				up[k] = v
			return

		if item.ext == 'md'
			let name = item.name.slice(0,-3)
			item.name = name

			let md = marked.render(item.body,path: id,file:item)
			# item.html = md.body
			# item.toc = md.toc
			# Object.assign(item,md.meta)
			Object.assign(item,md)
			item.name = name

			if md.#files
				Object.assign(examples,md.#files)

			if item.hidden
				return

			# if md.sections
			#	item.children = md.sections
			#	item.name = item.name.slice(0,-3) # remove markdown
			
			# if md.toc and md.toc.length > 1
			#	item.sections = md.toc

			if false and name == 'meta.md'
				Object.assign(up,md.meta)
				
				for own k,v of md
					up[k] = v
				return
		
		else
			console.log 'file',rel
			examples["/" + src] = {
				body: item.body
			}
	
	if item
		# item.path = '/' + src
		if models[id]
			Object.assign(models[id],item)
			save!
		else
			map[src] = item
			models[id] = item
			up.children.push(item)


watcher.on 'ready' do
	save!
	unless process.argv[2] == '-w'
		process.exit(0)