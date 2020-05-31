import * as imba-lang from './languages/imba'
import * as js-lang from './languages/javascript'
import {theme} from './theme'

global.loadMonaco and global.loadMonaco do
	global.monaco.editor.defineTheme('scrimba-dark',theme.toMonaco!)
	imba-lang.setup(global.monaco)
	imba.commit!