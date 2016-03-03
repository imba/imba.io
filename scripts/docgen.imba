
# should probably be in the imba-directory instead.
var fs = require 'fs'
var path = '/repos/imba/src'
var imbac = require 'imba/lib/compiler'
var mdr = require './../src/markdown'

require '../src/views/snippet'

var entityBased = yes
var version = Imba.VERSION

var doc = {
	version: version
	methods: {}
	classes: {}
	entities: {
		'Imba': {
			type: 'object'
		}
	}
}

class DocString

	def initialize str
		@head = 0
		@buffer = str

	def pluck reg, part = 1
		var tail = @buffer.slice(@head)
		var m = tail.match(reg)
		if m
			@buffer = @buffer.substr(0,@head) + tail.slice(m[0]:length)
			return m[part]
		return null

def parse node, desc
	var meta = {}
	var name
	var lines = for ln,i in desc.split('\n')
		var s = DocString.new(ln)

		if name = s.pluck(/^@([\w\-]+)[\s\t]*/,1)
			var val = s.pluck(/^\{([^\{]*)\}[\s\t]*/,1)
			var desc = s.pluck(/^(.+)$/)
			var obj = {name: name, value: val or '', desc: desc or ''}

			if meta[name] isa Object
				meta[name] = [meta[name],obj]
			elif meta[name] isa Array
				meta[name].push(obj)
			else
				meta[name] = obj

			continue
		ln

	for own key, value of meta
		if key == 'param'
			# should enrichen params instead
			node:params ||= value
		else
			if !value:value
				value = value:desc or yes

			node[key] = value

	var text = lines.join('\n').replace(/^\n+/,'').replace(/\n+$/,'')
	node:desc = text

	return [meta, text]

def inc path, outpath
	var body = fs.readFileSync(path,'utf-8')
	var meta = imbac.analyze(body,{entities: yes, scopes: yes})

	var json = {}

	# console.log meta
	if entityBased
		for own path,item of meta:entities.plain
			parse(item,item:desc) if item:desc
			item:html = mdr.render(item:desc).toString if item:desc
			doc:entities[path] = item
		return self

	var classes = meta:scopes.filter do |scope|
		scope:type == 'ClassScope' and scope:desc	

	for cls in classes
		continue unless cls:desc

		var c = {
			type: 'class'
			path: cls:meta:path
			desc: cls:desc.toDoc
			interface: {}
			methods: []
		}
		parse(c,c:desc)
		console.log c
		c:html = mdr.render(c:desc).toString


		doc:classes[c:path] = c

		for e in cls:entities
			continue unless e:desc

			var imdoc = parse(e,e:desc)
			console.log imdoc

			e:html = e:desc ? mdr.render(e:desc).toString : ''

			if e:type == 'method'

				var ref = cls:meta:path + '#' + e:name
				e:path = ref
				console.log 'found method!',e:type,e:name
				doc:methods[ref] = e
				c:interface[e:name] = e

				if e:name == 'initialize'
					c:ctor = e
				else
					c:methods.push(e)
				# c:methods
				# should add details about location etc as well?

			c:methods.sort do |a,b| a:name > b:name ? 1 : -1
	self


def generate
	console.log 'generating documentation'
	console.log doc:entities

	var docfile = {

	}

	var map = doc:entities

	for own path,item of map
		console.log "handle path {path}"
		var [all,up,typ,name] = (path.match(/^(.*)(\#|\.)([\w\=\-]+)$/) or [path,'','',path])

		if map[up]
			console.log "found up for {up}"
			map[up][typ] ||= []
			map[up][typ].push(path)

	# for now - we include all the methods in a flat structure,
	# and filter the ones we want to show for each class.
	# classes go in a separate thing?
	var path = "{__dirname}/../docs/api/{version}.json"
	fs.writeFileSync(path, JSON.stringify(doc), 'utf-8')
	fs.writeFileSync(path.replace(version,'current'), JSON.stringify(doc), 'utf-8')
	self



inc(path + '/imba/imba.imba')
inc(path + '/imba/scheduler.imba')

inc(path + '/imba/dom/tag.imba')
inc(path + '/imba/dom/html.imba')
inc(path + '/imba/dom/svg.imba')

inc(path + '/imba/dom/event-manager.imba')
inc(path + '/imba/dom/event.imba')
inc(path + '/imba/dom/touch.imba')
inc(path + '/imba/dom/pointer.imba')


generate