import * as imba-lang from './languages/imba'
import {theme} from './theme'

global.loadMonaco and global.loadMonaco do
	global.monaco.editor.defineTheme('scrimba-dark',theme.toMonaco!)
	imba-lang.setup(global.monaco)