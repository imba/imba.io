# require 'imba'

Imbac = require 'imba/compiler'
DEBUG = 0

require './views'
import App from './app'

var chokidar = require 'chokidar'
var hl = require './scrimbla/core/highlighter'

# creating the local app
APP = App.new
APP.Highlighter = hl.Highlighter
APP.Markdown = require('./markdown')

# Setting up the express server
var express = require 'express'
var srv = express()

srv.disable('etag')
srv.use(express.static('./www'))

srv.get '/' do |req,res| res.redirect('/home')
srv.get '/install' do |req,res| res.redirect('/guides#toc-installation')

# rendering markdown
srv.get(/^([^\.]+\.(md|json|imba))$/) do |req,res|
	APP.fetchDocument(req:path) do |doc|
		res.send doc

# return the requested document as a script where
# the content is assigned to the global DEPS cache
srv.get(/^([^\.]+.(md|json|imba))\.dep$/) do |req,res|
	var src = req:params[0]
	APP.fetchDocument(src) do |doc|
		res.type 'js'
		res.send "DEPS['{src}'] = " + JSON.stringify(doc)

# catch-all rendering for the whole site
# routing etc is handled by the <site> tag itself
srv.get(/^([^\.]*)$/) do |req,res|

	APP.req = req
	APP.res = res
	APP.reset

	var view = <site>
	res.send view.toString
	# res.render do <site>

# watch for changes to documents to prune cache
chokidar.watch("{__dirname}/../docs/").on('change') do |path|
	var src = path.split('/docs').pop
	APP.deps[src] = null

var server = srv.listen(3011) do
	console.log 'server is running'
