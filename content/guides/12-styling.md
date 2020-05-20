---
title: Styling
multipage: true
---
# [WIP] css inline styles
# [WIP] css blocks
# [WIP] Imba Theme
Imba Themes take after the tailwind utility design pattern by default, and can be customized for your specific project.
## Base Theme
Imba's theme is a slightly modified version of the Tailwind default theme, but all of tailwind's classes can be used in imba with some syntax changes.

For example, the following tailwind ui element...
```imba
<h1 class="font-xl text-purple-800 hover:text-purple-500">
```
will be this in Imba syntax
```imba
<h1 .(font-xl text-purple-800 :hover:text-purple-500)>
```
pseudo selectors such as `:hover:` will have an added semi-colon at the beginning.
## Extend or Customize the Imba Theme
### Variants
Import variants from imba/theme, and you can modify the following values.

<!-- TODO: we could have a magic keyword like "extend" instead of having to do "export const variants" -->

```imba
import {variants} = 'imba/theme'
extend variants =
	radius:
		none: 0
		sm: 1
		default: 2
		md: 3
		lg: 4
		full: '9999px'
		step: '0.125rem'
	
	opacity:
		step: '1%'

	shadow:
		xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
		sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
		default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
		md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
		lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
		xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
		'2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
		inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
		outline: '0 0 0 3px rgba(66, 153, 225, 0.5)',
		none: 'none'
		
```
### Breakpoints
If you just specify the breakpoint values., Imba will takes care of min-max width behavior between them, but you can also specify min-width, max-width if you'd like.
```imba
extend breakpoints =
	sm: '(max-width: 640px)'
	md: '(min-width: 640px)'
	lg: '(min-width: 768px)'
	xl: '(min-width: 1024px)'
	xxl: '(min-width: 1280px)' // added extra breakpoint to original theme
```
### Colors
You can add, remove, or edit any of the color names `gray`, tone keys `100`, and tone values `#f7fafc`. Just know that if removed they will not be accessible via smart classes, if renamed, then you will need to use the new name.
```imba
extend colors = {
	gray: {
		100: '#f7fafc',
		200: '#edf2f7',
		300: '#e2e8f0',
		400: '#cbd5e0',
		500: '#a0aec0',
		600: '#718096',
		700: '#4a5568',
		800: '#2d3748',
		900: '#1a202c',
	},
	red: {
		100: '#fff5f5',
		200: '#fed7d7',
		300: '#feb2b2',
		400: '#fc8181',
		500: '#f56565',
		600: '#e53e3e',
		700: '#c53030',
		800: '#9b2c2c',
		900: '#742a2a',
	},
	orange: {
		100: '#fffaf0',
		200: '#feebc8',
		300: '#fbd38d',
		400: '#f6ad55',
		500: '#ed8936',
		600: '#dd6b20',
		700: '#c05621',
		800: '#9c4221',
		900: '#7b341e',
	},
	yellow: {
		100: '#fffff0',
		200: '#fefcbf',
		300: '#faf089',
		400: '#f6e05e',
		500: '#ecc94b',
		600: '#d69e2e',
		700: '#b7791f',
		800: '#975a16',
		900: '#744210',
	},
	green: {
		100: '#f0fff4',
		200: '#c6f6d5',
		300: '#9ae6b4',
		400: '#68d391',
		500: '#48bb78',
		600: '#38a169',
		700: '#2f855a',
		800: '#276749',
		900: '#22543d',
	},
	teal: {
		100: '#e6fffa',
		200: '#b2f5ea',
		300: '#81e6d9',
		400: '#4fd1c5',
		500: '#38b2ac',
		600: '#319795',
		700: '#2c7a7b',
		800: '#285e61',
		900: '#234e52',
	},
	blue: {
		100: '#ebf8ff',
		200: '#bee3f8',
		300: '#90cdf4',
		400: '#63b3ed',
		500: '#4299e1',
		600: '#3182ce',
		700: '#2b6cb0',
		800: '#2c5282',
		900: '#2a4365',
	},
	indigo: {
		100: '#ebf4ff',
		200: '#c3dafe',
		300: '#a3bffa',
		400: '#7f9cf5',
		500: '#667eea',
		600: '#5a67d8',
		700: '#4c51bf',
		800: '#434190',
		900: '#3c366b',
	},
	purple: {
		100: '#faf5ff',
		200: '#e9d8fd',
		300: '#d6bcfa',
		400: '#b794f4',
		500: '#9f7aea',
		600: '#805ad5',
		700: '#6b46c1',
		800: '#553c9a',
		900: '#44337a',
	},
	pink: {
		100: '#fff5f7',
		200: '#fed7e2',
		300: '#fbb6ce',
		400: '#f687b3',
		500: '#ed64a6',
		600: '#d53f8c',
		700: '#b83280',
		800: '#97266d',
		900: '#702459',
	},
	// extended theme by adding my own colors
	tomato: {
		100: 'hsl(10,95%,90%)',
		200: 'hsl(10,90%,80%)',
		300: 'hsl(10,85%,70%)',
		400: 'hsl(10,80%,60%)',
		500: 'hsl(10,80%,50%)',
		600: 'hsl(10,85%,40%)',
		700: 'hsl(10,90%,30%)',
		800: 'hsl(10,95%,20%)',
		900: 'hsl(10,100%,10%)',
	}
}
```
# [WIP] Imba Styled Classes
Imba styled classes are magical classes that tap into the design patterns stored in your theme. 
## Using Styled Classes
Imba's theme is highly inspired by [Tailwind](https://tailwindcss.com/docs), so the vast majority of their documentation will be applicable to Imba Styles, but you can override or extend the default Imba theme by creating your own theme constants

### Colors


| table |
| --- |
| `blue` |
| `purple` |
| `indigo` |
| `red` |
| `pink` |
| `orange` |
| `yellow` |
| `green` |
| `mint` |
| `teal` |




### Color Tones
Following Tailwind's pattern each color can then be paired with one of 9 tone values numbered 100 to 900. 100 being the lightest color, and 900 being the darkest. 

**Here's are some of the colors paired with the tone values.**

| table | | | | | | |
| --- | --- | --- | --- | --- | --- | --- |
|`blue-100`| `purple-100` | `indigo-100` | `red-100` | `pink-100` | `orange-100` | `etc.` |
|`blue-200`| `purple-200` | `indigo-200` | `red-200` | `pink-200` | `orange-200` | `etc.` |
|`blue-300`| `purple-300` | `indigo-300` | `red-300` | `pink-300` | `orange-300` | `etc.` |
|`blue-400`| `purple-400` | `indigo-400` | `red-400` | `pink-400` | `orange-400` | `etc.` |
|`blue-500`| `purple-500` | `indigo-500` | `red-500` | `pink-500` | `orange-500` | `etc.` |
|`blue-600`| `purple-600` | `indigo-600` | `red-600` | `pink-600` | `orange-600` | `etc.` |
|`blue-700`| `purple-700` | `indigo-700` | `red-700` | `pink-700` | `orange-700` | `etc.` |
|`blue-800`| `purple-800` | `indigo-800` | `red-800` | `pink-800` | `orange-800` | `etc.` |
|`blue-900`| `purple-900` | `indigo-900` | `red-900` | `pink-900` | `orange-900` | `etc.` |

<!-- TODO: Would be a nice shortcut -->
In Imba you can just do `blue-1` for short.

The styled classes above can be used in yor HTML elements or Imba tags in many ways, but here is one example:

```imba
<h1 .(text-blue-800)>
```

# [WIP] Imba styled components
In some development environments, a styled component architecture is prefered, and in Imba you can this by applying smart classes to a tag in a css code block.

### Creating styled components
```imba
tag app-button < button
	css {
		// css variables
		var-color: gray; // default color
		var-tone: 500; // default tone
		transition: all 200ms ease-in-out;
		.( // styled classes
			p-2
			bg-{var-color}-{var-tone}
			border-2
			text-{var-color}-800
			border-{var-color}-{var-tone}
		)
		:hover {
			var-tone: 400;
		}

		:active {
			var-tone: 500;
		}

		:is-parimary {
			var-color: blue;
		}

		:is-success {
			var-color: green;
		}
		:is-warning {
			var-color: orange;
		}
		:is-alert {
			var-color: red;
		}
	}
tag app-root
	def render
		<self .(theme)> 
			// Styled components
			<app-button>
			<app-button.primary> <a href="/"> "primary"
			<app-button.success> <a href="/"> "success"
			<app-button.warning> <a href="/"> "warning"
			<app-button.alert> <a href="/"> "alert"
			
			// Alternate syntax for styled components
			<a.primary as="app-button" href="/">
			<a.success as="app-button" href="/">
			<a.warning as="app-button" href="/">
			<a.alert as="app-button" href="/">
			
			// Without styled components
			// primary
			<button .(p-2 border-2 text-gray-800 border-2 bg-gray-50 hover:bg-gray-400 active:bg-gray-600  border-gray-500 hover:border-gray-400 active:border-gray-600)> 
				<a href=""> "primary"
			<button .( p-2 border-2 text-gray-800 border-2 bg-gray-50 hover:bg-gray-400 active:bg-gray-600 border-gray-500 hover:border-gray-400 active:border-gray-600)> 
				<a href=""> "secondary"
			<button .( p-2 border-2 text-gray-800 border-2 bg-green-50 hover:bg-green-400 active:bg-green-600 border-green-500	hover:border-green-400 active:border-green-600)>
				<a href=""> "success"
			<button .( p-2 border-2 text-gray-800 border-2 bg-orange-50 hover:bg-orange-400 active:bg-orange-600 border-orange-500	hover:border-orange-400 active:border-orange-600)>
				<a href=""> "warning"
			<button .( p-2 border-2 text-gray-800 border-2 bg-red-50 hover:bg-red-400 active:bg-red-600 border-red-500	hover:border-red-400 active:border-red-600)>
				<a href=""> "alert"
			
```
### Syntax Ideas
```imba
.(p-2)
.(p-{20px}) is this possible?
```
