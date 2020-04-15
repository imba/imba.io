import * as imba-lang from './languages/imba'

global.loadMonaco and global.loadMonaco do
	console.log 'loaded monaco!',imba-lang
	imba-lang.setup(global.monaco)