
# connection to github
var github = require 'octonode'
var ghclient = github.client('')
var ghrepo = ghclient.repo('somebee/imba.io')

var cache = {}

export def issues opts = {}, &cb
	if cache:issues
		return cb(cache:issues)
	# issues should be synced and cached by the server instead
	ghrepo.issues(opts) do |err, body|
		console.log(arguments)
		cb(cache:issues = body)

export def issue nr, &cb
	if cache[nr]
		return cb(cache[nr])

	ghclient.issue('somebee/imba.io', nr).info do |err,info|
		info:md = APP.Markdown.render(info:body)[:body]
		cb(cache[nr] = info)

# 	issue.info do |err, info|
# 
# 		issue.comments do |err,comments|
# 			if info:body
# 				info:md = APP.Markdown.render(info:body)[:body]
# 
# 			info:comments = comments.map do |comment|
# 				if comment:body
# 					comment:md = APP.Markdown.render(comment:body)[:body]
