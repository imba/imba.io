# included in iframe to evaluate and present code snippets / examples

extern eval
require 'imba'

var Sandbox = {}

var observer = MutationObserver.new do |muts| 
	Sandbox.mutated(muts)

var colors = [
	'#CCFF66'
	'#66FFFF'
	'#6666FF'
	'#CC66FF'
]

def Sandbox.colorize node
	return unless node isa Element
	colors.unshift(let color = colors.pop)

	node:style:color = color
	if node:children:length
		for child in node:childNodes
			colorize(child)
		# var nodeIterator = document.createNodeIterator(root, whatToShow, filter)
	return

def Sandbox.mutated mutations
	var deep = no
	var nodes = []

	for mut in mutations
		# console.log 'mutation',mut
		let type = mut:type
		let target = mut:target

		if type == 'characterData'
			target = target:parentNode

		if type == 'childList'
			colorize(el) for el in mut:addedNodes
	self

def Sandbox.setup
	observer.observe(document:body, { attributes: false, childList: true, characterData: true, subtree: true })

def Sandbox.reset
	document:body:innerHTML = ''
	self

def Sandbox.present res
	var node

	if res and res:prototype isa Imba.Tag
		node = res.new(res.createNode)

	elif res isa Imba.Tag
		node = res

	if node
		document:body:appendChild(node.dom)
		node.end
	elif res != undefined
		document:body:textContent = String(res)
	return

def window.run pkg, editor
	Sandbox.Editor = editor
	# console.log 'should run code?!',pkg
	Sandbox.reset
	# creating a namespace
	var tag$ = Imba.TAGS.__clone
	console.log 'will run'

	try
		var res = eval(pkg:code)
		Sandbox.present(res)
	catch e
		console.log 'caught error in sandbox',e
		editor.onrunerror(e:message,'',e:lineNr or e:line or 0,e:column,e)

	# present the result
	# will show differently based on what it actually is
	self

def window.onerror msg,url,line,col,err
	console.log 'window.onerror in sandbox'
	Sandbox.Editor.onrunerror(msg,url,line,col,err)

Sandbox.setup