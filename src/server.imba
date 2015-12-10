require 'imba'
Imbac = require 'imba/compiler'
DEBUG = 1
Imba.SERVER = 1
ENV_CLIENT = 0

require './views'
import App from './app'

var express = require 'express'
var app = express()

var hl = require 'scrimbla/src/core/highlighter'

app.disable('etag')
app.use(express.static('./www'))

# connection to github
var github = require 'octonode'
var ghclient = github.client('585e26874810a933142ad98ebc5d247cec474994')
var ghrepo = ghclient.repo('somebee/imba')

# creating the local app
APP = App.new
APP.Highlighter = hl.Highlighter
APP.Markdown = require('./markdown')

# simple extension to nicely support imba-rendering
# override the renderer
app.use do |req,res,next|
	var render = res:render

	res:render = do |view,o,fn|
		APP.req = req
		APP.res = res

		if view isa Function
			APP.reset
			view = view()

		if view isa String and Imba.TAGS[view]
			view = Imba.tag(view).end

		if view isa Imba.Tag
			return res.send(view.toString)

		render(view,o,fn)
	next()

app.get '/' do |req,res| res.redirect('/home')
app.get '/install' do |req,res| res.redirect('/guides#toc-getting-started-installation')

# catch-all rendering for the whole site
# routing etc is handled by the <site> tag itself
app.get(/^([^\.]*)$/) do |req,res|

	res.render do <site>

var issueCache = {}

app.get '/api/issues.json' do |req,res|
	console.log 'get issues',req:params[0]
	if issueCache:issues
		return res.send issueCache:issues
	# issues should be synced and cached by the server instead
	ghrepo.issues do |err, body|
		console.log(arguments)
		res.send(issueCache:issues = body)

app.get '/api/issues/:nr.json' do |req,res|

	if issueCache[req:params:nr]
		return res.send issueCache[req:params:nr]
	# console.log 'get issue',req:params[0],req:params:nr,req:query:nr
	# var md = renderer.render("{__dirname}/../docs/welcome.md")
	var issue = ghclient.issue('somebee/imba', req:params:nr)
	# issues should be synced and cached by the server instead
	issue.info do |err, info|

		issue.comments do |err,comments|
			# console.log(arguments)
			if info:body
				info:md = APP.Markdown.render(info:body)[:body]

			info:comments = comments.map do |comment|
				if comment:body
					comment:md = APP.Markdown.render(comment:body)[:body]
				comment
			console.log 'returned from issue',info
			res.send issueCache[req:params:nr] = info

# rendering markdown
app.get(/^(.+\.(md|json|imba))$/) do |req,res|
	APP.fetchDocument(req:path) do |doc|
		res.send doc

# return the requested document as a script where
# the content is assigned to the global DEPS cache
app.get(/^(.+\.(md|json|imba))\.dep$/) do |req,res|
	var src = req:params[0]
	APP.fetchDocument(src) do |doc|
		res.type 'js'
		res.send "DEPS['{src}'] = " + JSON.stringify(doc)

var server = app.listen(3011) do
	console.log 'server is running'

