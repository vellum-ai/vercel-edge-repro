import { VitePluginConfig, vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { vercelPreset } from "@vercel/remix/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { JSDOM } from "jsdom"
import * as fs from "node:fs"


const isExtension = process.env.VITE_TARGET === "extension";
const isProduction = process.env.NODE_ENV === "production";

installGlobals();

const webConfig: VitePluginConfig = {
	ssr: true,
	ignoredRouteFiles: ["**/*.ext.tsx"],
	presets: [
		vercelPreset()
	]
}

const extensionConfig: VitePluginConfig = {
	ssr: false,
	buildEnd: () => {
		console.info("--- transforming entrypoint for extension ---");
		const manifest = {
			"manifest_version": 3,
			"version": "1.2.2",
			"key": process.env.GOOGLE_EXTENSION_PUBLIC_KEY,
			"name": "tlai",
			"side_panel": {
				"default_path": "./index.html"
			},
			"content_scripts": [
				{
					"js": ["./extension/content.js"],
					"matches": ["https://im.kendallhunt.com/*"]
				}
			],
			"background": {
				"service_worker": "./extension/background.js"
			},
			"permissions": [
				"sidePanel",
				"identity"
			],
			"icons": {
				"16": "./extension/16.png",
				"48": "./extension/48.png",
				"128": "./extension/128.png"
			},
			"host_permissions": [
				"https://*/*"
			],
			"oauth2": {
				"client_id": process.env.OAUTH_GOOGLE_CLIENT_ID,
				"scopes": ["openid", "email", "profile"]
			}
		}
		try {
			const checkHTML = fs.existsSync('build/client/index.html');
			if (!checkHTML) {
				console.error('HTML file not found');
				return;
			}
			const html = fs.readFileSync('build/client/index.html', 'utf-8');
			const dom = new JSDOM(html);
			let document = dom.window.document;
			const scripts = Array
				.from(document
					.querySelectorAll('script'))
				.map((script) => script.text)
				.join('\n');
			const newHTML = document
				.documentElement
				.innerHTML
				.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

			document = new JSDOM(newHTML).window.document;
			const script = document.createElement('script');
			script.src = 'init.js';
			script.type = 'module';
			document.body.appendChild(script);
			const updatedHTML = document.documentElement.outerHTML;
			fs.writeFileSync('build/client/init.js', scripts, { flag: 'w+' });
			fs.writeFileSync('build/client/index.html', updatedHTML, { flag: 'w+' });
			fs.writeFileSync('build/client/manifest.json', JSON.stringify(manifest, null, 2), { flag: 'w+' });
			console.info("--- entrypoint transformed for extension ---");
		} catch (error) {
			console.error('Error modifying HTML:', error);
		}
	},
	ignoredRouteFiles: ["**/**"],
	routes(defineRoutes) {
		return defineRoutes((route) => {
			route("/", "routes/_index.tsx");
			route("/index.html", "routes/redirect.tsx");
			route("/my-tools", "routes/my-tools.tsx");
			route("/history", "routes/history.tsx");
			route("/about", "routes/about.tsx");
			route("/tools/:toolID", "routes/tools.$toolID.ext.tsx");
			route("/tools/:toolID/threads/:threadID", "routes/tools.$toolID.threads.$threadID.ext.tsx");
		})
	},
}

export default defineConfig({
	ssr: {
		noExternal: isProduction ? [/^@mui\//] : [],
	},
	plugins: [
		remix(isExtension ? extensionConfig : webConfig), tsconfigPaths()]
});

