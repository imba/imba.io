# importing preflight css directly into the client bundle
import './assets/preflight.css'

global css
	@root
		# font-family: Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji
		-webkit-font-smoothing: antialiased
		-moz-osx-font-smoothing: grayscale
		--box-shadow-ring: 0 0 0 3px blue4/30
		scroll-behavior:smooth
		$header-height: 48px @md:48px
		$menu-width:240px @md:220px
		$doc-width: 768px
		$doc-margin: calc(100vw - $doc-width - 20px) @md:calc(100vw - $doc-width - $menu-width - 20px)

	html.noscroll body overflow: hidden
	html,body p:0px m:0px
	body pt: $header-height
	* outline:none

	html.fastscroll scroll-behavior:auto

	.menu-heading d:block p:1 2 fs:sm- fw:500 tt:uppercase cursor:default
	.menu-link d:block p:1 2 fs:sm fw:500

	.keycap rd:md bd:gray2 fs:xs h:5 px:1 c:gray5 d:hflex ja:center