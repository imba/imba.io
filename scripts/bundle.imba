const chokidar = require 'chokidar'
var path = require 'path'
var fs = require 'fs'

var bundle = 'content'

const root = path.resolve(__dirname,'..','content')
const dest = path.resolve(__dirname,'..','public')

console.log 'got here',root

const data = {
	path: '/'
	children: []
}

const models = {

}

const map = {'.': data}


const watcher = chokidar.watch(root)
watcher.on('all') do
	let abs = $2
	let is-dir = $1.indexOf('Dir') >= 0
	let src = path.relative(root,abs).replace(/\b\d\d\-/g,'')
	let name = path.basename(src)
	let dirname = path.dirname(src)

	return if name == '.DS_Store' or src == ''
	let up = map[dirname]
	let id = "/{src}"
	let item
	if $1 == 'addDir'
		item = {
			type: 'dir'
			name: name
			children: []
		}

	elif $1 == 'add'
		item = {
			type: 'file'
			name: name
			body: fs.readFileSync(abs,'utf8')
		}
		if name == 'meta.json'
			let meta = JSON.parse(item.body)
			for own k,v of meta
				up[k] = v
			item = null
	
	if item
		item.path = '/' + src
		map[src] = item
		models[id] = item
		up.children.push(item)

watcher.on 'ready' do
	console.log 'structure',data
	let json = JSON.stringify(data)
	let js = "globalThis['{bundle}.json'] = {json}"
	fs.writeFileSync(path.resolve(dest,"{bundle}.json"),json)
	fs.writeFileSync(path.resolve(dest,"{bundle}.json.js"),js)