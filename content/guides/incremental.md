# Incremental Adoption & Reusable Components

Since Imba components are actual custom elements, you can use
them with both plain HTML and most JavaScript UI frameworks
(React, Vue, Svelte, etc.)

Using imported Imba components is as simple as
appending their names with `-tag`.
For example, if you have this Imba file:

```imba
tag marshmellow
  <self> "yo!"
```

In React you can use the component with:

```js
<marshmellow-tag/>
```

See the following sections for how to import components
depending on your configuration.

## With Vite

The best way to include Imba components and scripts in your
existing non-Imba project is with [Vite](https://vitejs.dev/). If
your existing project doesn't use Vite, try
[#with-the-component-template](#with-the-component-template) or
[#with-npm](#with-npm) instead.

- Add `imba` and `vite-plugin-imba` to your existing project:
	```bash
	npm i -D imba vite-plugin-imba
	```

- In `vite.config.js` import the Imba plugin:

	```js
	import { imba } from 'vite-plugin-imba'
	```

- And add `imba()` to the list of plugins:

	```js
		plugins: [vue(),imba()],
	```

- In your app you can now import any imba files with:

	```js
	import './filename.imba'
	```

## With The Component Template

If you use eslint, this option may not work without disabling
some rules; try [#with-npm](#with-npm) instead.

- Click `Use this template` on our
	[component template](https://github.com/imba/imba-component-template)
	and choose a name. We'll use the name `imba-component` as an example.

- Clone your `imba-component` repository directly into your
	non-Imba project.

- Run:

	```
	cd imba-component
	npm i
	npm run build
	```

- Import the component into your non-Imba project as a module via:

	```js
	import './imba-component'
	```

## With NPM

- Click `Use this template` on our
[component template](https://github.com/imba/imba-component-template)
and choose a name. We'll use the name `imba-component` as an example.

- Clone your `imba-component` repository into anywhere on your
	computer.

- Run:

	```
	cd imba-component
	npm i
	npm run build
	npm link
	```

	`npm link` will expose your component as a package to the rest
	of your computer as the `"name"` field from your component's
	`package.json` file. By default this is `my-lib`.

- In your non-Imba project, run:

	```
	npm link linked_package_name
	```

- In your non-Imba project, import your component with

	```js
	import 'linked_package_name'
	```

Read more about `npm link`
[here](https://docs.npmjs.com/cli/v8/commands/npm-link).

## With Script Tags


- Click `Use this template` on our
[component template](https://github.com/imba/imba-component-template)
and choose a name. We'll use the name `imba-component` as an example.

- Clone your `imba-component` repository into your existing
project's `/public` directory.

- Run:

	```bash
	cd imba-component
	npm i
	npm run build
	```

- In your non-Imba project's `index.html` file, source the
component's bundle with a script tag:

	```html
	<script src="imba-component/dist/my-lib.js"></script>
	```
