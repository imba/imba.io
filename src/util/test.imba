
var highlighter = require './highlighter'
import Theme from './theme'
import TokenTheme from './monarch.js'
# register theme
var raw = Theme.toMonaco
var theme = TokenTheme.createFromRawTokenTheme(raw:rules)

var compiler = require 'imba/compiler'
var helpers = require 'imba/lib/compiler/helpers'

var code = """
const app =
	title: ""
	items: []

	def addItem
		if self:title
			self:items.push(title: self:title)
			self:title = ""

	def toggleItem item
		item:completed = !item:completed

Imba.mount <div[app].vbox ->
	<header>
		<input model.trim='title' :keyup.enter.addItem>
		<button :tap.addItem> 'add item'
	<ul> for item in data:items
		<li .done=item:completed :tap.toggleItem(item)> item:title
"""

var tokens = highlighter.tokenize('imba',code,decorate: yes, theme: highlighter:theme)
console.log "tokens!!",tokens

var css = []

for color,i in theme.getColorMap when i > 0
	css[i] = ".mtk{i} \{ color: {color}; \}"

console.log css

# let rules: string[] = [];
#	for (let i = 1, len = colorMap.length; i < len; i++) {
#		let color = colorMap[i];
#		rules[i] = `.mtk${i} { color: ${color}; }`;
#	}
#	rules.push('.mtki { font-style: italic; }');
#	rules.push('.mtkb { font-weight: bold; }');
#	rules.push('.mtku { text-decoration: underline; }');
#	return rules.join('\n');

# console.log highlighter.tokenize('imba',code)
# for token in tokens:tokens
# 	let typ = theme._match(token:type)
# 	console.log "token",typ
# console.log tokens# 