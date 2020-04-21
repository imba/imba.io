

const chokidar = require 'chokidar'
const path = require 'path'
const fs = require 'fs'
const marked = require '../src/util/markdown'

const bundle = 'content'
const root = path.resolve(__dirname,'..','content')
const dest = path.resolve(__dirname,'..','public')

const data = {
	path: ''
	children: []
}

const models = { }
const map = {'.': data}
const watcher = chokidar.watch(root)

def save
	let json = JSON.stringify(data,null,2)
	let js = "globalThis['{bundle}.json'] = {json}"
	fs.writeFileSync(path.resolve(dest,"{bundle}.json"),json)
	fs.writeFileSync(path.resolve(dest,"{bundle}.json.js"),js)

watcher.on('all') do
	let abs = $2
	let is-dir = $1.indexOf('Dir') >= 0
	let src = path.relative(root,abs).replace(/\b\d\d\-/g,'')
	let name = path.basename(src)
	let dirname = path.dirname(src)

	return if name == '.DS_Store' or src == ''
	console.log 'watcher',$1,src

	let up = map[dirname]
	let id = "/{src}"
	let item
	if $1 == 'addDir'
		item = {
			type: 'dir'
			name: name
			children: []
			# path: '/' + src
		}

	elif $1 == 'add' or $1 == 'change'
		item = {
			type: 'file'
			name: name
			body: fs.readFileSync(abs,'utf8')
			ext: name.split('.').pop()
			# path: '/' + src
		}

		if name == 'meta.json'
			let meta = JSON.parse(item.body)
			for own k,v of meta
				up[k] = v
			return

		if item.ext == 'md'
			console.log 'test json!'
			let md = marked.render(item.body)
			item.html = md.body
			item.toc = md.toc
			Object.assign(item,md.meta)
			if md.sections
				item.children = md.sections
				item.name = item.name.slice(0,-3) # remove markdown
	
	if item
		# item.path = '/' + src
		if models[id]
			Object.assign(models[id],item)
			save!
		else
			map[src] = item
			models[id] = item
			up.children.push(item)

watcher.on 'ready' do save!

