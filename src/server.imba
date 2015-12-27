require 'imba'
Imbac = require 'imba/compiler'

DEBUG = 0
Imba.SERVER = 1
ENV_CLIENT = 0

require './views'
import App from './app'

var fs = require 'fs'
var express = require 'express'
var app = express()

var hl = require 'scrimbla/src/core/highlighter'
var gh = require './github'

app.disable('etag')
app.use(express.static('./www'))

# creating the local app
APP = App.new
APP.Highlighter = hl.Highlighter
APP.Markdown = require('./markdown')


def link-blog-posts cb
	fs.readdir("{__dirname}/../docs/blog") do |err,files|
		console.log files
		files = files.filter do |f| f.match(/\.md$/)
		var posts = []

		files.map do |src|
			APP.fetchDocument('blog/' + src) do |doc|
				# console.log 'document',doc
				posts.push(
					id: doc:id
					title: doc:title
					author: doc:author
					date: doc:date
				)
				if posts:length == files:length
					console.log 'done!!',posts
					fs.writeFile("{__dirname}/../docs/blog.json",JSON.stringify(posts),cb)

# link-blog-posts

# gh.issues(labels: ['article']) do |items|
# 	APP.deps['/issues.json'] = items
# 	APP.ISSUES = items
# 	# res.send items

def fetch-issue nr
	gh.issue(nr) do |issue|
		fs.writeFileSync("{__dirname}/../docs/issues/{nr}.json",JSON.stringify(issue))

def fetch-issues deep = no
	gh.issues(labels: ['article']) do |items|
		if deep
			fetch-issue(item:number) for item in items

		fs.writeFileSync("{__dirname}/../docs/issues/all.json",JSON.stringify(items))

fetch-issues(no)

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


app.get '/issues.json' do |req,res|
	gh.issues(labels: ['article']) do |items|
		res.send items

app.get '/resync' do |req,res|
	fetch-issues(yes)
	res.send status: 0

app.get '/' do |req,res| res.redirect('/home')
app.get '/install' do |req,res| res.redirect('/guides#toc-getting-started-installation')

# catch-all rendering for the whole site
# routing etc is handled by the <site> tag itself
app.get(/^([^\.]*)$/) do |req,res|

	res.render do <site>


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

