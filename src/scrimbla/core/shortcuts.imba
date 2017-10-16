import './util' as util

# move to class
export class Shortcut
	
	prop combos

var specialKeys = {
	8: "backspace"
	9: "tab"
	10: "return"
	13: "return"
	16: "shift"
	17: "ctrl"
	18: "alt"
	19: "pause"
	20: "capslock"
	27: "esc"
	32: "space"
	33: "pageup"
	34: "pagedown"
	35: "end"
	36: "home"
	37: "left"
	38: "up"
	39: "right"
	40: "down"
	45: "insert"
	46: "del"
	59: ";"
	61: "="
	96: "0"
	97: "1"
	98: "2"
	99: "3"
	100: "4"
	101: "5"
	102: "6"
	103: "7"
	104: "8"
	105: "9"
	106: "*"
	107: "+"
	109: "-"
	110: "."
	111: "/"
	112: "f1"
	113: "f2"
	114: "f3"
	115: "f4"
	116: "f5"
	117: "f6"
	118: "f7"
	119: "f8"
	120: "f9"
	121: "f10"
	122: "f11"
	123: "f12"
	144: "numlock"
	145: "scroll"
	173: "-"
	186: ";"
	187: "="
	188: ","
	189: "-"
	190: "."
	191: "/"
	192: "`"
	219: "["
	220: "\\"
	221: "]"
	222: "'"
}

var shiftNums = {
	"`": "~"
	"1": "!"
	"2": "@"
	"3": "#"
	"4": "$"
	"5": "%"
	"6": "^"
	"7": "&"
	"8": "*"
	"9": "("
	"0": ")"
	"-": "_"
	"=": "+"
	";": ": "
	"'": '"'
	",": "<"
	".": ">"
	"/": "?"
	"\\": "|"
}

var codeToCombo = {
	Digit1: "1"
	Digit2: "2"
	Digit3: "3"
	Digit4: "4"
	Digit5: "5"
	Digit6: "6"
	Digit7: "7"
	Digit8: "8"
	Digit9: "9"
	Digit0: "0"
	Numpad1: "1"
	Numpad2: "2"
	Numpad3: "3"
	Numpad4: "4"
	Numpad5: "5"
	Numpad6: "6"
	Numpad7: "7"
	Numpad8: "8"
	Numpad9: "9"
	Numpad0: "0"
	MetaLeft: 'super'
	MetaRight: 'super'
	Escape: 'esc'
}

def trigger key, o
	if o isa Function
		o = {command: o}
	o:trigger = key
	return o

def combo keys, o
	o = {command: o} if o isa Function
	o:keys = keys
	return o

IM.KeyBindings = [

	combo ['super+z'] do |sel| sel.view.history.undo
	combo ["super+shift+z"] do |sel| sel.view.history.redo
	combo ["alt+super+p"] do |sel| sel.view.history.play
	# combo ["alt+shift+r"] do |sel| sel.view.history.play

	combo ["super+s"], command: "save"
	# combo ["super+b"], command: "run"
	combo ["alt+super+s"], command: "saveSession"
	combo ["alt+shift+l"], command: "reparse"
	combo ["alt+shift+k"], command: "reparseExtent"
	
	combo ["super+a"] do |sel| sel.selectAll
	

	combo ['tab']
		context: do |sel|
			sel.text.indexOf('\n') >= 0

		command: do |sel|
			var region = sel.region.clone.expandToLines.expand(-1,0)
			var points = region.find('\n').reverse
			points.map do |pos|
				sel.view.insert(pos + 1,'\t')
			return yes


	combo ["shift+tab"]
		context: do |sel|
			yes
		command: do |sel|
			var region = sel.region.clone.expandToLines.expand(-1,0)
			var points = region.find("\n\t").reverse
			points.map do |pos| sel.view.erase([pos + 1,pos + 2])

	combo ["alt+shift+return"] do |sel| console.log 'prettify'

	combo ["backspace"]
		context: do |e|
			return e.region.peek(-1,1) in ['[]','{}','<>','()','""',"''"]

		command: do |sel|
			console.log 'moving!!'
			sel.model.expand(-1,1)
			sel.model.erase

	combo ["backspace"]
		context: do |sel,o|
			let reg = sel.region
			if reg.size == 0
				if reg.peek(-1,0) in [']',')','}']
					var start = util.findPairStart(reg.buffer.raw,reg.start - 1)
					if start >= 0
						o:region = [reg.start,start]
						return yes

				# console.log  'region selection?!? backspace??'
				# if o:node = reg.prevNode('._impair,._imstr')
				#	console.log 'found node?!',o:node
				#	return yes

		command: do |sel,o|
			# not sure about this one
			sel.set(o:region)
	
	combo ["backspace"]
		context: do |sel,o|
			if sel.text and !util.stringIsBalanced(sel.text)
				return yes
		command: do |sel,o|
			yes # noop

	combo ["backspace"] do |sel| sel.erase
	combo ["shift+backspace"] do |sel| sel.erase
	combo ["alt+backspace"] do |sel| sel.erase(IM.WORD_START)
	combo ["super+backspace"] do |sel| sel.erase(IM.LINE_START)

	combo ["super+shift+backspace"] do |sel|
		var text = sel.region.text
		var around = text[0] + text.slice(-1)

		if around in ['[]','{}','()']
			sel.insert(text.slice(1,-1))
			yes
		# sel.erase(IM.LINE_START)

	combo ["del"] do |sel|
		sel.size > 0 ? sel.erase : sel.expand(0,1).erase
	
	combo ["return",'shift+return','super+return'] do |sel|
		var ind = sel.indent
		ind += '\t' if util.increaseIndent(sel.buffer.substringBeforeLoc(sel.region.a))

		# should not happen in string
		if sel.region.peek(-1,1) in ['[]','{}','()']
			sel.insert('\n\t' + ind + '\n' + ind).move( -('\n' + ind):length )
		else
			sel.insert('\n' + ind)

		return yes


	combo ['space','shift+space'] do |sel|
		if sel.region.peek(-1,1) == '<>'
			# FIXME need to work with new caret
			# also - track move-event
			sel.move(1).erase
			sel.insert(' ')
			return yes

	combo ['tab'] do |sel|
		sel.insert('\t')

	combo ['super+up'] do |sel|
		# FIXME work with new caret
		sel.collapsed = yes
		sel.set([0,0],yes)

	combo ['ctrl+shift+up'] do |sel|
		sel.expandTo sel.region.clone.expandToEntity

	combo ['ctrl+shift+right'] do |sel|
		if var node = sel.view.nodeAtRegion(sel.region)

			if node.matches('._imopen')
				node = node.parent

			sel.region = node.region

	combo ['super+shift+up'] do |sel|
		sel.set([sel.region.a,0],yes)

	combo ['super+down'] do |sel|
		sel.collapsed = yes
		sel.set([sel.buffer.size,sel.buffer.size],yes)

	combo ['super+shift+down'] do |sel|
		sel.set([sel.region.a,sel.buffer.size],yes)

	combo ['super+u'] do |sel,o|
		console.log sel.target, "found ut!!!"
		console.log sel.target.bubble('unwrap',{})

	combo ['alt+super+r'] do window:location.reload
]

var mover = do |chr|
	{
		context: do |sel| sel.region.peek(0,1) == chr
		command: do |sel| sel.move(1)
	}

# var peeker = do |a,b,val,cmd|
# 	{
# 		context: do |sel| sel.region.peek(a,b) == val
# 		command: cmd
# 	}

IM.Triggers = [

	trigger '|'
		context: do |sel| sel.region.peek(-1,1) == '||'
		command: do |sel| sel.move(1)

	trigger ']', mover(']')
	trigger '}', mover('}')
	trigger ')', mover(')')
	trigger '"', mover('"')
	trigger "'", mover("'")

	trigger '[' do |sel| sel.insert('[$0]')
	trigger '(' do |sel| sel.insert('($0)')
	trigger '{' do |sel| sel.insert('{$0}')

	trigger '"'
		context: do |sel| sel.region.peek(-1,0) != '"'
		command: do |sel| sel.insert('"$0"')

	trigger "'"
		context: do |sel| sel.region.peek(-1,0) != "'"
		command: do |sel| sel.insert("'$0'")

	# trigger '"' do |sel| sel.insert('"$0"')
	# trigger "'" do |sel| sel.insert("'$0'")

	trigger '|'
		context: do |sel| sel.peekbehind(/(\bdo\s*|\()$/)
		command: do |sel| sel.insert('|$0|')

	trigger '<'
		context: do |sel| !sel.peekbehind(/(\b(tag|if|class) |\d\s*$)/)
		command: do |sel| sel.insert('<$0>')
]

global class ShortcutManager
	
	def self.instance
		@instance ||= self.new

	def self.keysForEvent e
		var combo = []
		var special = codeToCombo[e:code] or specialKeys[e:which]
		var chr = special or String.fromCharCode(e:which)

		# if e:code and 
		# 	chr 
		chr = chr.toLowerCase # unless e:shiftKey

		combo.push('ctrl') if e:ctrlKey # and special != 'ctrl'
		combo.push('alt') if e:altKey # and special != 'alt'
		combo.push('super') if e:metaKey # && !e:ctrlKey && special !== 'meta'
		combo.push('shift') if e:shiftKey # and special != 'shift'
		combo.push(chr) unless combo.indexOf(chr) >= 0
		
		# console.debug e:key,e:which,chr,e:code,String.fromCharCode(e:which),combo.join('+'),e:keyCode,e:charCode

		return combo.join('+')

	def initialize view, bindings
		@view = view
		@bindings = bindings or IM.KeyBindings
		self

	def view
		@view

	def register keys, o
		keys = [keys] if keys isa String
		o = {command: o} if o isa Function
		o:keys = keys
		@bindings.push(o)
		return self

	def keysForEvent e
		ShortcutManager.keysForEvent(e)

	def commandsForKeys combo
		@bindings.filter(|binding| binding:keys == combo)

	def getShortcut e
		var combo = keysForEvent(e.event)
		console.log combo

		for cmd in @bindings
			if cmd:keys.indexOf(combo) >= 0
				# will match on parts now?!
				var o = {}
				# console.log 'found shortcut',combo,cmd:keys
				if !cmd:context or cmd:context.call(view,view.localCaret,o,e,view)
					cmd:data = o
					return cmd

		return null

	def getTrigger view, text
		for cmd in IM.Triggers
			if cmd:trigger == text
				var res = cmd:context ? cmd:context.call(view,view.localCaret,view,text) : yes
				return cmd if res
		return null




		