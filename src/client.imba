require 'imba/src/imba/browser'

# need to use webpack for this include to work as intended
Scrimbla = require 'scrimbla/src/index'

import App from './app'
APP = App.new
APP.schedule

require './views'

# awaken pages etc
$(page).map do |el| el
$(.awaken).map do |el| el

if Imba.SERVER
	console.log "IS SERVER"