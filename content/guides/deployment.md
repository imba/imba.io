# Deploying Your App

## Deploying Imba as a static site

Imba transpiles to JavaScript, HTML and CSS. Using Vite as its bundler means you can follow [Vite's deploy instructions](https://vitejs.dev/guide/static-deploy.html).

For example, you can deploy it to these (and more!) static site hosts:

- [Deploy Vite sites to Netlify](https://vitejs.dev/guide/static-deploy.html#netlify).
- [Deploy Vite sites to GitHub Pages](https://vitejs.dev/guide/static-deploy.html#github-pages).
- [Deploy Vite sites to CloudFlare Pages](https://vitejs.dev/guide/static-deploy.html#cloudflare-pages).
- [Deploy Vite sites to Vercel](https://vitejs.dev/guide/static-deploy.html#vercel).

## Deploying Imba to run on your server

But what about the server side? Anything imported in the `server.imba` entrypoint will be included on the server. See the [production guide](run-in-production) to learn how to run Imba on the server.
