extern xr
export def save path, content, encoding = 'utf-8', &cb
	console.log 'save',path,content,encoding

	xr.post(path,body: content).then do 
		console.log 'responded'
		cb and cb(arguments)

export def readFileAsync path, encoding = 'utf-8', &cb
	console.log 'save',path,encoding

	xr.get(path).then do |res|
		console.log 'responded',res
		cb and cb(arguments)
		res