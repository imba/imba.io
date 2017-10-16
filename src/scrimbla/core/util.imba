import Region from '../region'


export def isWhitespace str
	(/^[\n\t\ ]+$/).test(str)

export def commonAncestor a,b
	if a isa Array
		var arr = a.slice
		return arr.reduce(&,arr.shift) do |prev,curr,i|
			commonAncestor(prev,curr)

	return (a or b) if !a or !b

	a = a.@dom or a
	b = b.@dom or b

	a = a:parentNode until a.contains(b)
	b = b:parentNode until b.contains(a)

	return tag(a)


var pairs =
	'"': '"'
	"'": "'"
	'(': ')'
	'<': '>'
	'[': ']'
	'{': '}'

export def wrapText text, open, close
	close ||= pairs[open]
	text = text.replace(/\'/g,"\\'") if open == "'"
	(open or '') + text + (close or '')

export def normalizeNewlines str
	if str.indexOf('\r\n') >= 0
		return str.replace(/\r\n/g,'\n')
	return str

export def stringIsBalanced str, i = 0
	var opens = '[{("\''
	var closes = ']})"\''
	var stack = []
	var i = 0
	var s,end

	while s = str[i++]
		var oid = opens.indexOf(s)

		if s == end
			stack.pop
			end = stack[stack:length - 1]
		elif oid >= 0
			stack.push(end = closes[oid])

	return stack:length == 0 ? true : false

BBALANCED = do |str,loc|
	var opens = '[{("\''
	var closes = ']})"\''
	var stack = []
	var pairs = []
	var i = loc
	var s,end

	while s = str[i--]
		var oid = closes.indexOf(s)

		if s == end
			stack.pop
			end = stack[stack:length - 1]
			if stack:length == 0
				return i + 1

		elif oid >= 0
			stack.push(end = opens[oid])

	return stack:length == 0 ? true : false

export def findPairStart str, loc
	var opens = '[{("\''
	var closes = ']})"\''
	var stack = []
	var pairs = []
	var i = loc
	var s,end

	while s = str[i--]
		var oid = closes.indexOf(s)

		if s == end
			stack.pop
			end = stack[stack:length - 1]
			if stack:length == 0
				return i + 1

		elif oid >= 0
			stack.push(end = opens[oid])

	return -1

export def colToLoc line, col, tabsize = 4
	var ci = 0
	var rci = 0 # real column
	var char

	return 0 if col == 0

	while char = line[ci++]
		if char == '\t'
			var rest = tabsize - rci % tabsize
			if rest > 3 and col <= rci + 2
				return ci - 1

			rci += rest
		else
			rci += 1

		if rci >= col
			return ci

	return line:length

export def colToViewCol line, col, tabsize = 4
	var ci = 0
	var rci = 0 # real column
	var char

	return 0 if col == 0

	while char = line[ci++]
		if char == '\t'
			var rest = tabsize - rci % tabsize
			break if rest > 3 and col <= rci + 2
			rci += rest
		else
			rci += 1

		break if col <= rci
	return rci

export def colsForLine line, tabsize = 4
	var col = 0
	var idx = 0
	var char

	if line.indexOf('\t') == -1
		return line:length

	while char = line[idx++]
		if char == '\t'
			var rest = tabsize - col % tabsize
			col += rest
		else
			col += 1
	return col

export def rowcol buf, loc, tabsize = 4
	buf = buf.toString
	var pos = loc
	var col = 0
	var line = 0
	var char

	# go back to start of line
	while char = buf[pos - 1]
		if char == '\n'
			break
		pos--

	# get column for slice
	while (pos < loc) and char = buf[pos]
		if char == '\t'
			var rest = tabsize - (col % tabsize)
			col += rest
		else
			col += 1
		pos++

	while char = buf[pos - 1]
		if char == '\n'
			line++
		pos--

	return [line,col]


export def increaseIndent str
	var reg = /^(\s*(.*\=\s*)?(export |global |extend )?(class|def|tag|unless|if|else|elif|switch|try|catch|finally|for|while|until|do))/
	var other = /\b(do)\b/
	reg.test(str) or other.test(str)


export def findIndent str
	for line in str.split('\n')
		if var m = line.match(/^[\ \t]+/)
			return m[0]
	return ""


export def normalizeIndent str, indent='\t'
	return str unless indent

	var m
	var reg = /\n+([^\n\S]*)/g
	var ind = null

	var lines = str.split('\n')
	var min = null
	var il = indent:length

	for ln,i in lines
		let lnIndent = ''
		let pos = 0
		continue if ln == ''

		while (il == 1 ? ln[pos] : ln.substr(pos,il)) == indent
			lnIndent += indent
			pos += il

		if min == null or min:length > lnIndent:length
			min = lnIndent

	# now remove from lines
	if min and min:length > 0
		for ln,i in lines
			lines[i] = ln.substr(min:length)
		return lines.join('\n')

	return str


export def changeIndent str, prevIndent, indent='\t'
	if prevIndent and prevIndent != indent
		var lines = str.split('\n')
		var min = null
		var pil = prevIndent:length

		for ln,i in lines
			let pos = 0
			let to = ''

			while (pil == 1 ? ln[pos] : ln.substr(pos,pil)) == prevIndent
				to += indent
				pos += pil

			if pos > 0
				lines[i] = to + ln.substr(pos)
		return lines.join('\n')
	return str


export def cleanIndent str, indent = '\t'
	var prevIndent = findIndent(str)
	str = normalizeIndent(str,prevIndent)
	str = changeIndent(str,prevIndent,indent)
	return str


export def reindent str,indent,startLine = 0
	return str unless indent
	var lines = str.split('\n')
	return str if lines:length <= startLine

	for ln,i in lines
		continue if i < startLine
		lines[i] = indent + ln

	return lines.join('\n')


export def repeatString str, count
	return Array.new( count + 1 ).join( str )


export def patchString orig, str, mode
		var text = orig.toString

		if mode == 'append'
			return text + str
		elif mode == 'prepend'
			return "" + str + text
		else
			if let region = Region.normalize(mode)
				# let region = Region.normalize()
				text.substr(0,region.start) + str + text.slice(region.end)


export def boundsForBuffer buffer
	# find the longest line 
	var str = buffer.toString
	var horizontal = 0
	var vertical = 0
	# can be optimized by not splitting lines etc
	var lines = str.split('\n')
	for line,i in lines
		let len = colsForLine(line)
		if len > horizontal
			horizontal = len
	return [horizontal,lines.len]


