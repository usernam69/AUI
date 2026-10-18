# The Probe: AUI ideas (2026-10-18)

Ideas for AUI, the free in-browser chat site, drawn from our conversation. 1044 ideas in 21 categories.

## Quick wins

1. **Dark-mode default** — Follow the system theme on first visit and remember the choice.
2. **Keyboard shortcut sheet** — Press ? to see every shortcut in a small centered dialog.
3. **Copy last reply** — One shortcut copies the newest answer to the clipboard.
4. **New chat shortcut** — Cmd/Ctrl+K starts a fresh conversation instantly.
5. **Draft autosave** — Keep unsent text in the composer across reloads.
6. **Load percentage in the tab title** — Show the model download progress in the browser tab.
7. **Friendly WebGPU check** — Detect missing WebGPU up front and explain which browsers work.
8. **Estimated download size** — Tell users how many MB the first load needs before they start it.
9. **Preload button** — Let users download the model before their first message.
10. **Remember scroll position** — Return to where you were in a long chat after a reload.
11. **Timestamp on hover** — Show exact send times when hovering a message.
12. **Word counter in composer** — Show a live word count while typing long prompts.
13. **Enter-to-send toggle** — Let people choose Enter or Ctrl+Enter to send.
14. **Empty chat suggestions** — Show four tappable starter prompts on a blank chat.
15. **Rename chat inline** — Double-click a chat title to rename it.
16. **Pin favorite chats** — Keep pinned conversations at the top of the sidebar.
17. **Delete undo** — Offer a 10-second undo after deleting a chat.
18. **Sidebar search** — Filter the chat list by title as you type.
19. **Export chat to Markdown** — Download any conversation as a .md file.
20. **Export all chats** — One click zips every chat for backup.
21. **Import chats** — Restore a backup file from another device.
22. **Copy code button feedback** — Flip the copy button to a checkmark for two seconds.
23. **Code block language label** — Always show the language above each code block.
24. **Wrap long code toggle** — Switch between scrolling and wrapping for code blocks.
25. **Message permalink** — Link directly to a single message inside a chat.
26. **Auto-grow composer** — Let the input grow up to eight lines before scrolling.
27. **Paste image hint** — Explain that images can't be read by the small model.
28. **Stop button label** — Show "Stop" text beside the stop icon on wide screens.
29. **Typing indicator** — Show animated dots before the first token arrives.
30. **Tokens-per-second readout** — Display generation speed under each reply.
31. **Clear all confirmation text** — Require typing the word delete before wiping everything.
32. **Favicon badge** — Show a dot on the favicon while a reply is generating.
33. **Notification on finish** — Send a browser notification when a long reply completes in the background.
34. **Sound toggle** — Optional soft chime when a reply finishes.
35. **Focus the composer** — Always return focus to the input after sending.
36. **Escape closes dialogs** — Make Escape dismiss every popup consistently.
37. **Remember last mode** — Restore the previously chosen response mode on load.
38. **Show model name in header** — Display AUI SLM and its size next to the chat title.
39. **Version number in footer** — Show the build version so bug reports are easier.
40. **Link to source** — Add a GitHub link in the about page.
41. **Better 404 copy** — Point lost visitors to chat, about and beta pages.
42. **Print stylesheet** — Make a conversation print cleanly on paper.
43. **Larger tap targets** — Grow small buttons to 44px on touch screens.
44. **Reduce motion setting** — Respect the system reduced-motion preference everywhere.
45. **High-contrast theme** — Offer a stronger contrast palette for low-vision users.
46. **Font size slider** — Let users scale chat text from 90% to 130%.
47. **Compact message spacing** — A density toggle for power users.
48. **Show message count** — Display how many messages a chat contains in the sidebar.
49. **Last-edited label** — Show "edited 3h ago" under each chat title.
50. **Open in new tab** — Middle-click a chat to open it in another tab.

## Small language model and inference

51. **Model picker for SLMs** — Offer Qwen 2.5 0.5B, Llama 3.2 1B, Phi-3.5 mini and Gemma 2 2B.
52. **Auto-pick by device** — Choose the biggest model the user's GPU memory can hold.
53. **Quantization chooser** — Let users trade quality for size with q4 or q8 builds.
54. **Speculative decoding** — Use a tiny draft model to speed up the main one.
55. **KV cache reuse** — Keep the cache between turns so follow-ups start instantly.
56. **Prompt caching** — Cache the system prompt's processed state across chats.
57. **Context window slider** — Let users raise context at the cost of memory.
58. **Sliding-window summarizer** — Summarize old turns with the model itself to stay inside context.
59. **Temperature presets** — Name presets like Precise, Balanced and Wild.
60. **Top-p and top-k controls** — Expose sampling settings in an advanced panel.
61. **Seed control** — Fix the random seed for reproducible answers.
62. **Stop sequences** — Let users define strings that end generation.
63. **Max tokens setting** — Choose reply length from short to long.
64. **Repetition penalty** — Reduce loops common in very small models.
65. **Logit bias** — Ban or favor specific words in replies.
66. **JSON mode** — Constrain output to valid JSON using grammar-based decoding.
67. **Grammar-constrained output** — Force replies to match a user-provided grammar.
68. **Function calling** — Let the SLM call small JavaScript tools in the page.
69. **Structured extraction** — Pull fields out of pasted text into a table.
70. **Embeddings in the browser** — Run a small embedding model for local search.
71. **Semantic chat search** — Find old conversations by meaning, not keywords.
72. **Reranker** — Re-score retrieved snippets with a tiny cross-encoder.
73. **Local RAG over files** — Answer questions from uploaded documents without any server.
74. **Chunking strategies** — Pick sentence, paragraph or fixed-size chunking for documents.
75. **Citations to chunks** — Show which passage supported each claim.
76. **Web Worker engine** — Run the model in a worker so the UI never stalls.
77. **Shared worker across tabs** — Load the model once for every open AUI tab.
78. **Service worker model cache** — Keep weights available offline for installed users.
79. **Cache eviction control** — Show and clear stored model files from settings.
80. **WebGPU fallback to WASM** — Run a tiny model on CPU when WebGPU is missing.
81. **Battery-aware mode** — Lower generation rate on low battery.
82. **Thermal throttling guard** — Pause generation if the device gets too hot.
83. **Memory pressure watcher** — Unload the model when the tab is backgrounded for long.
84. **Warm start on idle** — Pre-initialize the engine when the browser is idle.
85. **Streaming tokens smoothing** — Even out bursty token arrival for a calmer display.
86. **Reasoning mode** — Let the model think step by step in a collapsible block.
87. **Self-consistency voting** — Sample several answers and pick the most common.
88. **Draft then refine** — Run a second pass that critiques and improves the first.
89. **Few-shot library** — Let users save example pairs that prime the model.
90. **System prompt editor** — Edit the assistant's instructions per chat.
91. **Persona templates** — Ship ready-made personas like tutor, editor and coder.
92. **Language detection** — Reply in the language the user writes in.
93. **Translation mode** — A dedicated translate-and-explain preset.
94. **Summarize long text** — Chunked map-reduce summarization for big pastes.
95. **Tokenizer inspector** — Show how text splits into tokens and the token count.
96. **Perplexity meter** — Show how confident the model was per token.
97. **Token probability view** — Hover a word to see alternative tokens.
98. **Model benchmark page** — Time your device and show expected speed.
99. **LoRA adapters** — Load tiny task-specific adapters over the base model.

## Offline and PWA

100. **Installable app** — Add a manifest so AUI installs like a native app.
101. **Offline chat** — Keep chatting with no network after the model is cached.
102. **Offline indicator** — Show a clear banner when the connection drops.
103. **Update prompt** — Offer a reload button when a new version is ready.
104. **Background sync for cloud saves** — Queue cloud writes and send them when online returns.
105. **Offline queue for sign-in** — Explain what works offline for guests and members.
106. **Share target** — Let users share text from other apps straight into AUI.
107. **Launch handler** — Open AUI with a pre-filled prompt from a link.
108. **File handler** — Open .txt and .md files directly in AUI.
109. **Badge API** — Show unread-reply counts on the installed icon.
110. **App shortcuts** — Long-press the icon for New chat and Resume.
111. **Splash screen** — Branded loading screen while the engine warms up.
112. **Adaptive icon** — Provide maskable icons for Android.
113. **Standalone display mode** — Hide browser chrome when installed.
114. **Window controls overlay** — Use the desktop title bar for the chat title.
115. **Storage persistence request** — Ask the browser not to evict the model cache.
116. **Storage quota meter** — Show how much space chats and models use.
117. **Cached assets versioning** — Bust caches only when files actually change.
118. **Offline about page** — Make the about and beta pages work offline.
119. **Pre-cache next likely pages** — Fetch chat assets while the user reads the landing page.
120. **Delta updates** — Avoid re-downloading unchanged model shards.
121. **Resume interrupted downloads** — Continue a model download after a dropped connection.
122. **Download pause button** — Let users pause and resume the first big download.
123. **Download on Wi-Fi only** — Wait for unmetered networks before fetching the model.
124. **Metered connection warning** — Warn before downloading on cellular data.
125. **Data saver respect** — Honor the browser's data-saver hint.
126. **Offline analytics queue** — Hold privacy-friendly counters until online.
127. **Clipboard history offline** — Keep copied replies in a local history.
128. **Offline help docs** — Bundle a short guide that works without a network.
129. **Local-only mode** — A toggle that blocks every network request after setup.
130. **Network request log** — Show users exactly what AUI sends, which should be nothing.
131. **Airplane mode demo** — A guided demo proving chat works with Wi-Fi off.
132. **Offline fonts** — Self-host fonts so text never flashes.
133. **Self-hosted model files** — Serve weights from the same domain to avoid CDN dependence.
134. **Subresource integrity** — Pin hashes for every third-party script.
135. **CDN fallback chain** — Try jsDelivr, then unpkg, then a local copy for the engine.
136. **Local copy of web-llm** — Bundle the engine so no CDN is needed at all.
137. **Offline error messages** — Say "you're offline" instead of a raw fetch error.
138. **Retry with backoff** — Automatically retry failed downloads with growing delays.
139. **Service worker diagnostics page** — Show cache state for debugging.
140. **Cache-first model loading** — Check the cache before touching the network.
141. **Warm cache after install** — Pre-download in the background right after install.
142. **Periodic background sync** — Refresh app files quietly when allowed.
143. **Multi-device handoff** — Open the same chat on a phone from a QR code.
144. **QR code sharing** — Show a QR for the site address in the about dialog.
145. **Add-to-home-screen nudge** — Suggest installing after the third visit.
146. **Offline-ready checklist** — Show model, files and settings status as green ticks.
147. **Safe update window** — Delay reloads while a reply is generating.
148. **Crash recovery** — Restore the open chat if the tab crashes mid-reply.
149. **Tab restore** — Reopen exactly the last chat on launch.

## Chat interface and UX

150. **Split view chats** — Show two conversations side by side on wide screens.
151. **Floating mini chat** — A small popup window for quick questions over any page.
152. **Message branching** — Fork a conversation at any message to explore alternatives.
153. **Branch tree view** — Visualize all branches of a chat as a tree.
154. **Edit and resend** — Edit an earlier prompt and regenerate from there.
155. **Reply alternatives carousel** — Swipe through regenerated answers for the same prompt.
156. **Pin a message** — Keep an important message visible at the top of the chat.
157. **Star replies** — Collect favorite answers into a saved list.
158. **Quote reply** — Select text and ask a follow-up about just that part.
159. **Inline follow-up chips** — Show suggested next questions under each reply.
160. **Slash commands** — Type /summarize, /translate or /clear in the composer.
161. **Mention files** — Type @ to attach a previously uploaded document.
162. **Command palette** — Cmd/Ctrl+P opens a searchable list of every action.
163. **Drag and drop files** — Drop files anywhere on the page to attach them.
164. **Paste long text as attachment** — Turn very long pastes into a collapsible chip.
165. **Voice input** — Dictate prompts using the browser's speech recognition.
166. **Read aloud** — Speak replies with local text-to-speech voices.
167. **Hands-free conversation** — Talk and listen in a loop without touching the keyboard.
168. **Streaming markdown polish** — Avoid flicker when tables and lists render mid-stream.
169. **Table copy as CSV** — Copy any rendered table as CSV in one click.
170. **Math rendering** — Render LaTeX formulas with KaTeX.
171. **Diagram rendering** — Render Mermaid blocks as diagrams in replies.
172. **Code run button** — Run JavaScript snippets in a sandboxed iframe.
173. **Python in the browser** — Run Python snippets via Pyodide offline.
174. **Image paste preview** — Show pasted images in the composer before sending.
175. **Message reactions** — Thumbs up and down feeding a local quality log.
176. **Feedback note** — Add a short comment explaining a thumbs-down.
177. **Jump to latest button** — Appear when scrolled up during streaming.
178. **Smooth autoscroll** — Pause autoscroll when the user scrolls up.
179. **Chat minimap** — A thin scroll bar showing user prompts as markers.
180. **Collapse long replies** — Fold very long answers with a Show more button.
181. **Sticky chat title** — Keep the title visible while scrolling long chats.
182. **Date separators** — Group messages under Today, Yesterday and older headings.
183. **Unread divider** — Mark where new content began after returning to a tab.
184. **Multi-select messages** — Select several messages to copy or delete together.
185. **Share a single exchange** — Create a link to one question and answer.
186. **Chat folders** — Organize chats into named folders.
187. **Tags and labels** — Color-coded labels for chats.
188. **Archive chats** — Hide finished chats without deleting them.
189. **Trash with restore** — Keep deleted chats for 30 days.
190. **Duplicate chat** — Clone a conversation as a starting point.
191. **Merge chats** — Combine two related chats into one.
192. **Chat templates** — Start from saved prompts with fill-in blanks.
193. **Prompt library** — A searchable personal collection of prompts.
194. **Variables in prompts** — Use {{topic}} placeholders that prompt for values.
195. **Recent prompts dropdown** — Press up arrow to cycle through earlier prompts.
196. **Spellcheck toggle** — Turn the composer's spellcheck on or off.
197. **Right-to-left support** — Mirror the layout for Arabic and Hebrew.
198. **Mobile bottom sheet menus** — Use thumb-friendly sheets on phones.
199. **Swipe gestures** — Swipe to open the sidebar or delete a chat.

## Design and branding

200. **A-logo animation** — Animate the letter A drawing itself on the landing page.
201. **Logo variants** — Provide light, dark, mono and favicon versions of the A mark.
202. **Brand color system** — Define a primary red with tints for states and charts.
203. **Custom accent color** — Let users pick the accent color from a palette.
204. **Theme gallery** — Offer Midnight, Paper, Terminal and Sunset themes.
205. **Seasonal themes** — Swap in subtle holiday touches automatically.
206. **Glassmorphism option** — A frosted-glass sidebar for supported browsers.
207. **Gradient mesh background** — A slowly moving soft gradient on the landing hero.
208. **Typography pairing** — Pick a distinctive heading font with a readable body font.
209. **Variable font weight** — Use a variable font to reduce downloads.
210. **Monospace choice** — Let users pick their favorite code font.
211. **Ligatures toggle** — Enable or disable coding ligatures.
212. **Iconography set** — Replace emoji-like glyphs with a consistent icon set.
213. **Empty state illustrations** — Friendly drawings for empty chats and search.
214. **Loading skeletons** — Show gray placeholders while chats load.
215. **Micro-interactions** — Subtle button press and send animations.
216. **Haptic feedback** — Short vibrations on supported phones.
217. **Sound design** — A tasteful set of optional interface sounds.
218. **Landing page hero demo** — A looping clip of a chat running offline.
219. **Feature tour** — Three-step overlay for first-time visitors.
220. **Onboarding checklist** — Preload model, try a prompt, save a chat.
221. **Dark mode images** — Provide dark versions of illustrations and og image.
222. **OG image generator** — Create share images with the chat title.
223. **Responsive typography** — Fluid font sizes between phone and desktop.
224. **Container queries** — Let components adapt to their own width.
225. **Design tokens file** — Single source for colors and spacing.
226. **Storybook-style gallery page** — A page that shows every component state.
227. **Accessible color pairs** — Test every color pair for contrast automatically.
228. **Focus ring style** — A distinctive but clear keyboard focus outline.
229. **Cursor animation** — A blinking caret that follows streaming text.
230. **Message bubble styles** — Choose bubbles, flat blocks or compact lines.
231. **Avatar options** — Pick an emoji, color or uploaded picture.
232. **Name display preferences** — Show first name, username or nothing.
233. **Sidebar width resize** — Drag to resize the sidebar.
234. **Collapsible sections** — Remember which sidebar groups are collapsed.
235. **Zen mode** — Hide all chrome except the conversation and composer.
236. **Presentation mode** — Large text view for sharing answers on a projector.
237. **Print-ready styles** — Clean black-on-white output for printing chats.
238. **Easter eggs** — Hidden surprises in the 404 page and logo.
239. **Konami code theme** — A secret retro theme unlocked by the classic sequence.
240. **Mascot** — A small friendly character for errors and empty states.
241. **Brand voice guide** — Consistent microcopy for buttons, errors and toasts.
242. **Tooltip system** — Consistent hover hints with keyboard support.
243. **Toast stacking rules** — Limit and group notifications cleanly.
244. **Centered dialogs everywhere** — Keep every popup in the middle of the screen consistently.
245. **Dialog animations** — Subtle scale-in and backdrop fade.
246. **Backdrop blur strength** — Tune blur for performance on weak GPUs.
247. **Scrollbar styling** — Slim themed scrollbars across browsers.
248. **Selection color** — Brand-colored text selection.

## Accounts, auth and privacy

249. **Real owner login** — Replace the placeholder owner with a proper verified sign-in.
250. **Magic link option** — Offer passwordless email links as one option among others.
251. **Passkeys** — Support WebAuthn passkeys for fast secure sign-in.
252. **Social sign-in** — Add Google and GitHub buttons through Supabase.
253. **Anonymous accounts** — Let guests save chats to the cloud without an email.
254. **Upgrade anonymous to full** — Attach an email later without losing chats.
255. **Two-factor authentication** — TOTP codes for owner and support accounts.
256. **Session list** — Show active devices and let users sign them out.
257. **Account deletion** — A self-serve delete that removes cloud data.
258. **Data export** — Download everything AUI stores about you as JSON.
259. **Privacy dashboard** — One page showing what's local, what's in the cloud and what's never sent.
260. **End-to-end encrypted cloud sync** — Encrypt chats in the browser so the server can't read them.
261. **Passphrase-derived keys** — Derive the encryption key from a user passphrase.
262. **Recovery key** — A printable recovery code for encrypted accounts.
263. **Local-only default** — Keep chats on the device unless the user opts into sync.
264. **Per-chat sync toggle** — Choose which chats go to the cloud.
265. **Private chat mode** — A chat that is never saved anywhere.
266. **Auto-delete timers** — Delete chats after 7, 30 or 90 days.
267. **Panic button** — Instantly wipe all local data with one shortcut.
268. **App lock** — Require a PIN or biometrics to open AUI on shared devices.
269. **Idle auto-lock** — Lock after a set period of inactivity.
270. **Hide sensitive in screenshots** — Blur chat content when the tab loses focus.
271. **Redaction helper** — Mask emails and phone numbers before sharing a chat.
272. **PII detection** — Warn when a prompt contains personal data.
273. **Cookie-free analytics** — Count visits without cookies or fingerprints.
274. **Visitor counter privacy note** — Explain exactly what the counter stores.
275. **Consent-free design** — Avoid trackers so no banner is needed.
276. **Terms and privacy pages** — Plain-language legal pages.
277. **Security.txt** — Publish a contact for vulnerability reports.
278. **CSP headers** — A strict content security policy where headers are possible.
279. **Rate limiting** — Throttle sign-up and reset attempts.
280. **Email verification for roles** — Require verified email before any elevated role.
281. **Role-based access** — Owner, support, member and guest roles with clear powers.
282. **Invite-only beta** — Join the beta with a single-use invite link.
283. **Waitlist** — Collect emails for new features with consent.
284. **Audit log** — Record owner actions like approvals and role changes.
285. **Admin dashboard** — A page for usage totals and beta requests.
286. **Support impersonation guard** — Let support view settings without seeing chats.
287. **Abuse reporting** — A report button on shared links.
288. **Block lists** — Prevent known bad accounts from signing up.
289. **Username profiles** — Simple public profile names without email exposure.
290. **Avatar upload limits** — Compress and cap profile pictures safely.
291. **Password strength meter** — Guide users to strong passwords.
292. **Breached password check** — Warn about passwords seen in breaches using k-anonymity.
293. **Login notifications** — Email when a new device signs in.
294. **Security checkup** — A page listing weak spots in the account.
295. **Trusted devices** — Skip two-factor on devices the user marks as trusted.
296. **Sign-out everywhere** — One button ends all sessions.
297. **Account recovery flow** — Clear steps when email access is lost.
298. **Logout confirmation of local data** — Ask whether to keep or clear local chats on sign-out.

## Hosting and deployment

299. **Custom domain** — Point a real domain at the GitHub Pages site.
300. **HTTPS enforcement** — Force HTTPS and add HSTS where possible.
301. **Cloudflare Pages mirror** — Deploy a second free copy for redundancy.
302. **Netlify deploy previews** — Preview every pull request at its own URL.
303. **Vercel edge functions** — Run optional server features on the free tier.
304. **Preview URL comment** — A bot comment linking each PR's preview site.
305. **Deploy from main only** — Gate production deploys behind a green main branch.
306. **Environment protection fix** — Allow main in the github-pages environment automatically.
307. **Workflow summary page** — Print deploy URL and size in the job summary.
308. **Build artifact size check** — Fail the build if the site grows past a limit.
309. **Link checker in CI** — Crawl the built site for broken links.
310. **Lighthouse CI** — Track performance, accessibility and SEO scores per PR.
311. **Playwright smoke tests in CI** — Load chat with a mock model on every pull request.
312. **Unit tests for storage** — Run the cloud storage tests in CI.
313. **Lint and format step** — Add ESLint and Prettier checks.
314. **Type checking with JSDoc** — Check JavaScript types without migrating to TypeScript.
315. **Dependency pinning bot** — Keep CDN versions current with automated pull requests.
316. **Release tags** — Tag each deploy with a version and changelog.
317. **Changelog page** — Show recent changes inside the app.
318. **Status page** — A simple page showing site and CDN availability.
319. **Uptime monitor** — Ping the site and alert on failures.
320. **Error reporting without trackers** — Collect anonymous client errors users can review.
321. **Feature flags** — Toggle experiments with a JSON file.
322. **A/B testing locally** — Assign variants without any server.
323. **Staging environment** — A separate branch deployed to a staging path.
324. **Rollback button** — Redeploy the last good build quickly.
325. **Base path handling** — Make the site work at both a root domain and a subpath.
326. **Relative URL refactor** — Replace root-absolute paths with relative ones.
327. **Pages-specific build script** — Move the sed rewrites into a tested Node script.
328. **404 redirect handling** — Support clean URLs on static hosting.
329. **Sitemap and robots** — Generate sitemap.xml and robots.txt.
330. **Open Graph previews** — Per-page share images and titles.
331. **Structured data** — Add schema.org markup for the app.
332. **RSS feed for updates** — Publish release notes as a feed.
333. **Docker image** — Run AUI locally with one command.
334. **Self-hosting guide** — Document hosting on any static server.
335. **One-click deploy buttons** — Deploy to Netlify or Vercel from the readme.
336. **Template repository** — Let others fork AUI as a ready-made starter.
337. **Monorepo layout** — Separate site, engine and docs packages.
338. **Build with Vite** — Bundle modules for faster loads.
339. **Code splitting** — Load the engine and markdown renderer only when needed.
340. **Tree-shaken icons** — Ship only the icons that are used.
341. **Image optimization** — Serve AVIF and WebP versions of images.
342. **Brotli precompression** — Precompress assets where the host allows.
343. **HTTP caching headers plan** — Document the best cache settings per host.
344. **Edge cache for model files** — Mirror weights on a fast CDN.
345. **Hugging Face as weight host** — Fetch weights from a mirrored model repository.
346. **Torrent or IPFS weights** — An optional peer-to-peer weight source.
347. **Cost dashboard** — Show hosting costs, expected to stay at zero.
348. **Carbon footprint note** — Explain why on-device inference is light on servers.

## Code quality and architecture

349. **Split chat/app.js** — Break the 4000-line file into focused modules.
350. **Remove the legacy root app.js** — Retire the older duplicate of the chat logic.
351. **Single source for shared code** — Stop keeping two copies of sign-in and rendering code.
352. **State store module** — Centralize state with predictable updates.
353. **Event bus** — Decouple UI parts with a tiny publish-subscribe helper.
354. **Typed message schema** — Validate stored chats against a schema on load.
355. **Storage migrations** — Version the saved data and migrate old shapes.
356. **Corruption recovery** — Detect broken saved data and offer a safe reset.
357. **Defensive JSON parsing** — Never crash on malformed stored values.
358. **Error boundaries** — Catch UI errors per component and show a retry.
359. **Central logger** — One logging helper with levels and a debug switch.
360. **Debug panel** — Hidden panel showing engine state, memory and timings.
361. **Performance marks** — Measure load, first token and render times.
362. **Test fixtures** — Sample chats for repeatable tests.
363. **Mock engine for tests** — Ship the mock model used in browser tests.
364. **Visual regression tests** — Screenshot comparison for key screens.
365. **Accessibility tests** — Automated axe checks in CI.
366. **Mutation testing** — Check that tests actually catch broken code.
367. **Contract tests for storage** — Verify the cloud functions against the SQL schema.
368. **Schema-to-code check** — Fail CI if the SQL table and code fields drift.
369. **SQL migrations folder** — Number migrations instead of loose files.
370. **Seed data script** — Create demo accounts and chats for development.
371. **Dev server script** — One command to serve and watch the project.
372. **Hot reload** — Refresh the page when files change.
373. **Contributor guide** — Explain setup, testing and style.
374. **Architecture diagram** — A picture of how engine, UI and storage connect.
375. **Decision records** — Short notes explaining key choices.
376. **Comment cleanup** — Remove stale comments that no longer match the code.
377. **Dead code removal** — Delete the unused image and search handlers when they're cut.
378. **Constant extraction** — Gather magic numbers like the prompt budget in one config.
379. **Config file** — One place for limits, URLs and model IDs.
380. **Internationalization layer** — Move every user-facing string into a catalog.
381. **Message formatting helper** — Share date and number formatting rules.
382. **Sanitization audit** — Review every place HTML is inserted.
383. **Content security review** — Check third-party scripts for risk.
384. **Dependency audit** — Report outdated or risky CDN packages.
385. **License file** — Add a clear open-source license.
386. **Code owners file** — Assign reviewers to areas of the code.
387. **Issue templates** — Bug and feature templates for GitHub.
388. **Pull request template** — A checklist for contributors.
389. **Commit message convention** — Adopt a consistent commit style.
390. **Pre-commit hooks** — Run syntax checks before each commit.
391. **Syntax check script** — One npm script that checks every file.
392. **Stop hook friendliness** — Make the repo hook ask less often by auto-committing safely.
393. **Scratch-free repo** — Keep temporary test files out of the repository.
394. **Probe files location** — Store brainstorm outputs in a docs folder, not the root.
395. **Docs site** — Generate documentation from markdown files.
396. **API reference for modules** — Document every exported function.
397. **Examples folder** — Small demos of embedding the engine.

## Features users would love

398. **Study buddy mode** — Quiz me on pasted notes with spaced repetition.
399. **Flashcard maker** — Turn any text into question and answer cards.
400. **Writing coach** — Suggest edits with tracked-style highlights.
401. **Grammar checker** — Local grammar fixes without sending text anywhere.
402. **Email drafter** — Turn bullet points into a polite email.
403. **Meeting notes cleaner** — Convert rough notes into action items.
404. **Resume helper** — Tighten bullet points and match job descriptions.
405. **Cover letter helper** — Draft a letter from a resume and job link text.
406. **Recipe scaler** — Scale a pasted recipe to any number of servings.
407. **Unit converter** — Convert units mentioned in plain language.
408. **Regex helper** — Explain and generate regular expressions.
409. **SQL helper** — Turn a plain question into a query from a pasted schema.
410. **Spreadsheet formula helper** — Write formulas from descriptions.
411. **Shell command explainer** — Explain any pasted command in plain words.
412. **Code explainer** — Walk through pasted code line by line.
413. **Commit message writer** — Draft messages from a pasted diff.
414. **Docstring generator** — Add comments to pasted functions.
415. **Bug triage assistant** — Summarize an error log and suggest likely causes.
416. **Text rewriter** — Change tone: formal, friendly, short or detailed.
417. **Reading level adjuster** — Rewrite text for a chosen grade level.
418. **Summarize a webpage paste** — Condense a long article to five bullets.
419. **Key points extractor** — Pull dates, names and numbers from text.
420. **Outline generator** — Create an outline from a topic.
421. **Brainstorm partner** — Rapid-fire idea lists on any subject.
422. **Name generator** — Suggest names for projects, pets and products.
423. **Slogan maker** — Short punchy taglines for a brand.
424. **Story starter** — Opening lines and plot twists for writers.
425. **Dungeon master helper** — Describe scenes and rules for tabletop games.
426. **Character sheet builder** — Make consistent fictional characters.
427. **Poem forms** — Write sonnets, haiku and limericks on request.
428. **Joke of the day** — A fresh clean joke on the landing page.
429. **Trivia game** — Quiz the user on chosen topics with scoring.
430. **Language practice partner** — Casual conversation in a target language with corrections.
431. **Pronunciation tips** — Phonetic hints for tricky words.
432. **Vocabulary builder** — Daily words with example sentences.
433. **Math tutor** — Step-by-step help with hints before answers.
434. **Science explainer** — Explain concepts at several depths.
435. **History timeline maker** — Turn a topic into a dated timeline.
436. **Debate sparring partner** — Argue the opposite side of a user's view.
437. **Decision helper** — Lay out pros, cons and questions for a choice.
438. **Habit tracker chat** — Check in daily and log answers locally.
439. **Journal prompts** — Gentle daily reflection questions saved privately.
440. **Mood diary** — Track feelings with simple charts, stored on the device.
441. **Meal planner** — Weekly menus from dietary preferences.
442. **Workout planner** — Simple routines for chosen equipment and time.
443. **Travel itinerary** — Draft day-by-day plans from a destination and dates.
444. **Packing list maker** — Checklists tailored to a trip.
445. **Gift ideas** — Suggest gifts from a few details about the person.
446. **Party planner** — Schedules and shopping lists for events.
447. **Budget buddy** — Explain budgeting concepts and review pasted numbers.

## Performance

448. **First token latency budget** — Set and monitor a target for time to first token.
449. **Lazy-load markdown renderer** — Fetch the renderer only when the first reply appears.
450. **Lazy-load highlight library** — Load syntax highlighting only for code replies.
451. **Virtualized message list** — Render only visible messages in very long chats.
452. **Chunked persistence** — Save changed chats only, not the whole state.
453. **Debounced autosave tuning** — Adjust save timing by chat size.
454. **IndexedDB for chats** — Move large histories out of localStorage.
455. **Compressed storage** — Compress chat JSON before saving.
456. **Attachment size caps** — Warn before big files slow the page.
457. **Image downscaling** — Shrink pasted images before storing them.
458. **Worker for file parsing** — Parse PDFs and spreadsheets off the main thread.
459. **Idle-time work** — Run housekeeping with requestIdleCallback.
460. **Streaming render throttle** — Update the DOM at most once per frame.
461. **Incremental markdown parsing** — Re-parse only the newest block while streaming.
462. **Avoid layout thrash** — Batch reads and writes of layout properties.
463. **CSS containment** — Isolate message styling to cut reflow cost.
464. **Content visibility** — Skip rendering of off-screen messages.
465. **Reduce JS bundle** — Remove unused code paths after the model switch.
466. **Preconnect hints** — Warm connections to the CDN early.
467. **Preload critical assets** — Hint the browser about fonts and the main script.
468. **Module preloading** — Preload modules the chat page always needs.
469. **HTTP/3 friendly layout** — Avoid sequential request chains.
470. **Memory profiling session** — Find leaks over a long chat.
471. **GPU memory display** — Show how much VRAM the model uses.
472. **Model unload on idle** — Release the model after long inactivity.
473. **Quick reload of model** — Re-initialize from cache in seconds.
474. **Shard parallel downloads** — Fetch several weight shards at once.
475. **Download speed estimate** — Show remaining time based on measured speed.
476. **Progressive greeting** — Let users type while the model loads.
477. **Queue first message** — Send it automatically when loading finishes.
478. **Throughput governor** — Cap tokens per second on slow devices to keep the UI smooth.
479. **Frame budget monitor** — Detect jank and lower animation quality.
480. **Low-end device mode** — Turn off blur and animations automatically.
481. **Reduced data mode** — Skip optional visuals on slow networks.
482. **Cache warming on hover** — Prepare the chat page when the user hovers the start button.
483. **Scroll performance** — Passive listeners everywhere.
484. **Font loading strategy** — Use swap and subset fonts.
485. **Subset emoji and icons** — Ship only the glyphs used.
486. **Service worker navigation preload** — Speed up first paint when installed.
487. **Skeleton to content swap** — Avoid layout shift when chats load.
488. **CLS budget** — Keep cumulative layout shift near zero.
489. **INP optimization** — Keep interactions responsive during generation.
490. **Long task detection** — Report tasks over 50ms for fixing.
491. **Performance regression alerts** — Fail CI when load time worsens.
492. **Benchmark chat script** — A repeatable scripted conversation for timing.
493. **Tokenizer in a worker** — Count tokens without blocking input.
494. **Cached token counts** — Avoid recounting unchanged messages.
495. **Prompt budget accuracy** — Use real token counts instead of character estimates.
496. **Smarter history trimming** — Summarize dropped turns instead of discarding them.
497. **Context usage meter** — Show how full the context window is.

## Accessibility

498. **Screen reader announcements** — Announce streaming progress in sensible chunks.
499. **Live region tuning** — Avoid reading every token aloud.
500. **Skip to content link** — Jump past the sidebar with one keypress.
501. **Landmark roles** — Label header, nav, main and complementary regions.
502. **Heading structure** — Use a logical heading order on every page.
503. **Keyboard-only navigation** — Make every control reachable and operable.
504. **Focus trapping in dialogs** — Keep focus inside open popups.
505. **Focus return after close** — Return focus to the control that opened a dialog.
506. **Visible focus always** — Never hide the focus outline.
507. **Roving tabindex in lists** — Use arrow keys inside the chat list.
508. **Accessible menus** — Follow standard menu keyboard patterns.
509. **Accessible tooltips** — Show hints on focus as well as hover.
510. **Alt text for images** — Require or generate descriptions for uploaded images.
511. **Reduced motion respect** — Disable animations when requested.
512. **Color is never the only cue** — Pair color with icons or text for status.
513. **Text spacing support** — Keep layout intact when users widen spacing.
514. **Zoom to 400%** — Ensure no loss of content at high zoom.
515. **Touch target size** — Meet minimum sizes for fingers.
516. **Orientation support** — Work in portrait and landscape.
517. **Dyslexia-friendly font** — Offer a font designed for dyslexic readers.
518. **Line length control** — Limit message width for readability.
519. **Simple language mode** — Rewrite replies with plain language on demand.
520. **Voice control labels** — Make visible labels match accessible names.
521. **Switch device support** — Support scanning interfaces.
522. **Captions for audio output** — Show text while text-to-speech reads.
523. **Speech rate control** — Slow or speed the read-aloud voice.
524. **Voice choice** — Pick from available system voices.
525. **Dictation commands** — Say "send" or "new line" while dictating.
526. **Error messages that help** — Explain what went wrong and how to fix it.
527. **Form labels and hints** — Associate every input with a label.
528. **Autocomplete attributes** — Help password managers and browsers.
529. **Time limits** — Avoid timeouts that interrupt users.
530. **Pause streaming** — Let users pause a reply and resume it.
531. **Reading mode** — Strip chrome and show a clean article view of a reply.
532. **High contrast forced colors** — Support the operating system's forced colors mode.
533. **Dark mode contrast check** — Verify contrast in every theme.
534. **Language attributes** — Mark the page and replies with correct language codes.
535. **Direction attributes** — Handle mixed left-to-right and right-to-left text.
536. **Accessible tables** — Use proper headers in rendered tables.
537. **Accessible code blocks** — Make code regions focusable and labeled.
538. **Accessible charts** — Provide data tables behind any chart.
539. **Accessible dialogs titles** — Give every dialog a clear title and description.
540. **Accessible toasts** — Announce toasts without stealing focus.
541. **Accessible file upload** — Support keyboard and screen reader flows.
542. **Accessible drag and drop** — Offer a button alternative to dropping files.
543. **Accessibility statement** — Publish known issues and a contact.
544. **User testing sessions** — Test with assistive technology users regularly.
545. **Automated audits in CI** — Run accessibility checks on every pull request.
546. **Accessibility settings page** — Gather motion, contrast and text options in one place.

## Education and learning

547. **Classroom mode** — A teacher-curated set of prompts for students.
548. **Offline school kit** — A USB-friendly bundle that runs without internet.
549. **Low-bandwidth schools** — Preload everything once and share via local network.
550. **Lesson plan generator** — Draft plans from a topic and grade level.
551. **Quiz builder** — Create multiple-choice questions from a passage.
552. **Rubric helper** — Draft grading rubrics for assignments.
553. **Reading comprehension coach** — Ask guiding questions about a passage.
554. **Socratic tutor mode** — Answer questions with hints, not solutions.
555. **Homework helper with limits** — Guide without handing over finished answers.
556. **Citation helper** — Format references in common styles from pasted details.
557. **Plagiarism-safe paraphrasing** — Explain how to cite instead of copy.
558. **Essay feedback** — Comment on structure, clarity and evidence.
559. **Thesis statement workshop** — Iterate on a claim with prompts.
560. **Study schedule maker** — Build a plan around exam dates.
561. **Pomodoro companion** — Timer with encouraging check-ins.
562. **Note summarizer** — Turn lecture notes into concise study guides.
563. **Glossary builder** — Extract terms and definitions from a chapter.
564. **Concept map generator** — Produce a map of related ideas as a diagram.
565. **Explain like I'm five** — One-click simpler explanation of any reply.
566. **Explain at several levels** — Switch between beginner, intermediate and expert.
567. **Worked examples** — Show step-by-step solutions on request.
568. **Practice problem generator** — Fresh problems with answer keys.
569. **Math with LaTeX** — Pretty equations in explanations.
570. **Graph plotting** — Plot simple functions in the browser.
571. **Chemistry helper** — Balance equations and explain reactions.
572. **Physics sandbox** — Small simulations with explanations.
573. **Coding tutor** — Teach programming with runnable examples.
574. **Debugging buddy for students** — Ask what the student thinks before showing a fix.
575. **Language flashcards** — Spaced repetition for vocabulary.
576. **Conversation roleplay** — Practice ordering food or asking directions.
577. **Writing prompts for kids** — Age-appropriate story starters.
578. **Reading buddy** — Read aloud and ask simple questions.
579. **Parent guide** — Explain how AUI works and what stays private.
580. **Teacher guide** — Classroom setup, safety notes and sample activities.
581. **Student privacy promise** — State that nothing leaves the device.
582. **Content filter option** — A safe mode with stricter language rules.
583. **Age-appropriate presets** — Settings tuned for younger users.
584. **Time limits for kids** — Optional daily usage limits set by a parent.
585. **Teacher dashboard offline** — Local-only view of class activity exports.
586. **Assignment links** — Share a prompt that opens ready for students.
587. **Group activities** — Two students share one device with turn taking.
588. **Peer review helper** — Structure feedback between classmates.
589. **Science fair assistant** — Help plan experiments and data tables.
590. **Debate practice** — Assign sides and time rounds.
591. **Public speaking coach** — Time practice talks and suggest improvements.
592. **Interview practice** — Mock interviews with feedback.
593. **Career explorer** — Describe jobs and the skills they need.
594. **Scholarship search helper** — Organize requirements and deadlines.
595. **Accessibility for learners** — Pair every study tool with read-aloud and large text.

## Developer and API ideas

596. **Embeddable widget** — A script tag that adds an AUI chat bubble to any site.
597. **Iframe embed mode** — A minimal chat view designed for embedding.
598. **JavaScript SDK** — A tiny library wrapping the engine for other pages.
599. **npm package** — Publish the engine wrapper for reuse.
600. **OpenAI-compatible local API** — Expose the in-browser model through a service worker endpoint.
601. **Browser extension** — Right-click any text to ask AUI about it.
602. **Bookmarklet** — Send the selected text to AUI from any page.
603. **Userscript** — Add AUI to sites through a user script manager.
604. **Web component** — A custom element like aui-chat for plain HTML.
605. **React and Vue wrappers** — Thin components around the web component.
606. **Plugin system** — Let users add small tools written in JavaScript.
607. **Tool marketplace** — A community list of safe, reviewed tools.
608. **Prompt sharing links** — Encode a prompt in a URL fragment.
609. **Chat export API** — A documented format for conversation files.
610. **Webhook on finish** — Call a user-provided URL when a reply completes.
611. **CLI companion** — A command-line tool that talks to the local page.
612. **VS Code extension** — Ask AUI about selected code without leaving the editor.
613. **Obsidian plugin** — Use AUI inside a notes vault.
614. **Raycast and Alfred workflows** — Quick launchers that open AUI with a prompt.
615. **Mobile share sheet** — Send text from any phone app to AUI.
616. **Shortcuts app support** — Automate AUI on iOS and macOS.
617. **Zapier-style recipes** — Describe how to connect AUI to other tools.
618. **Local file system access** — Read and write files with the File System Access API.
619. **Folder chat** — Ask questions about a whole folder of notes.
620. **Git repo helper** — Summarize commits and diffs from a pasted log.
621. **Log analyzer** — Find patterns in pasted log output.
622. **Config explainer** — Explain pasted YAML and JSON files.
623. **API response formatter** — Pretty-print and explain pasted responses.
624. **Mock data generator** — Create realistic fake records in a chosen schema.
625. **Test case generator** — Suggest unit tests for pasted code.
626. **Refactor suggestions** — Offer cleaner versions of pasted functions.
627. **Code review buddy** — Point out likely bugs in a pasted diff.
628. **Security checklist** — Review pasted code for common vulnerabilities.
629. **Performance tips** — Suggest optimizations for pasted snippets.
630. **Documentation writer** — Draft readme sections from pasted code.
631. **Changelog writer** — Turn commit lists into release notes.
632. **Issue summarizer** — Condense long GitHub threads.
633. **Pull request description writer** — Draft descriptions from a pasted diff.
634. **Regex tester** — Test patterns against sample text visually.
635. **JSON schema generator** — Create a schema from example JSON.
636. **Type definition generator** — Produce TypeScript types from JSON.
637. **SQL explain helper** — Explain a query plan in plain words.
638. **Dockerfile helper** — Review and improve pasted Dockerfiles.
639. **CI config helper** — Suggest fixes for failing workflow files.
640. **Accessibility reviewer** — Check pasted HTML for common issues.
641. **CSS helper** — Explain and fix pasted styles.
642. **Color palette generator** — Build accessible palettes from a base color.
643. **Icon suggestion** — Suggest simple SVG icons from descriptions.
644. **SVG generator** — Draw simple graphics as SVG code.
645. **ASCII art maker** — Generate text art from a short description.
646. **Playground page** — A sandbox page to try engine settings and code.

## Community and growth

647. **Public roadmap** — A page showing what's planned and in progress.
648. **Feature voting** — Let visitors upvote ideas without accounts.
649. **Feedback button** — A one-click form that stays private on the device until sent.
650. **Changelog emails** — Optional monthly update emails.
651. **Discord community** — A place for users to share prompts and tips.
652. **GitHub discussions** — Q&A and ideas threads on the repo.
653. **Contributor spotlight** — Credit people who improve AUI.
654. **Good first issues** — Label small tasks for new contributors.
655. **Translation drive** — Crowdsource interface translations.
656. **Prompt contest** — Monthly challenge with shared winning prompts.
657. **Showcase gallery** — A curated page of creative uses.
658. **Success stories** — Short interviews with students and teachers.
659. **Press kit** — Logos, screenshots and a short description.
660. **Launch post** — An announcement explaining free, private, on-device AI.
661. **Product Hunt launch** — Prepare assets and a launch day plan.
662. **Hacker News post** — A technical write-up about running a model in the browser.
663. **Reddit communities** — Share in privacy and local-AI communities.
664. **YouTube demo** — A three-minute walkthrough video.
665. **Short clips** — Vertical videos showing offline chat.
666. **Blog** — Posts about how AUI works and what's next.
667. **Newsletter signup** — A privacy-respecting list for updates.
668. **Referral link** — A simple share link with no tracking.
669. **Badge for websites** — "Runs on AUI" badge for embedded widgets.
670. **Open-source sponsorship** — Optional donation links.
671. **Merch** — Stickers with the A logo.
672. **Hackathon** — Invite builders to create plugins in a weekend.
673. **University partnerships** — Offer AUI for offline classroom use.
674. **Library programs** — Run AUI workshops in public libraries.
675. **Nonprofit toolkit** — Setups for organizations with limited internet.
676. **Privacy advocate outreach** — Share the no-server design with experts for review.
677. **Security researcher program** — Thank people who report issues responsibly.
678. **Documentation contests** — Reward clear tutorials.
679. **Video tutorials** — Short how-to clips for key features.
680. **FAQ page** — Answer common questions about speed, size and privacy.
681. **Comparison page** — Explain how AUI differs from cloud chatbots honestly.
682. **Benchmarks page** — Publish speeds on common devices.
683. **Device compatibility list** — Community-maintained list of working hardware.
684. **Browser support matrix** — Show which browsers and versions work.
685. **Troubleshooting guide** — Fix common load and speed problems.
686. **Community prompts library** — Browse and copy user-shared prompts.
687. **Rating system for prompts** — Let users rate shared prompts locally.
688. **Event calendar** — Webinars and community calls.
689. **Office hours** — Regular live Q&A sessions.
690. **Ambassador program** — Volunteers who help new users.
691. **Mentorship pairing** — Connect new contributors with experienced ones.
692. **Code of conduct** — Set clear community expectations.
693. **Moderation guide** — Rules and tools for community spaces.
694. **User research interviews** — Talk with users each quarter.
695. **Usage survey** — Anonymous, optional, on-device summary of habits.
696. **Net promoter prompt** — A rare, dismissible satisfaction question.

## Monetization with a free core

697. **Keep it free forever promise** — State clearly that core features stay free.
698. **Tip jar** — Optional one-time support links.
699. **Sponsor tiers** — Thank supporters on a page with no perks that gate features.
700. **Open collective** — Transparent funding and expenses.
701. **Paid hosted sync** — An optional paid cloud sync for convenience.
702. **Paid backup service** — Encrypted off-device backups as a subscription.
703. **Team workspaces** — Paid shared prompt libraries for small teams.
704. **Education licenses** — Low-cost site licenses for schools.
705. **Enterprise self-host support** — Paid help for organizations running AUI internally.
706. **White-label edition** — A paid version with custom branding.
707. **Premium themes** — Optional paid theme packs.
708. **Premium voices** — Higher-quality local speech voices as an add-on.
709. **Larger model packs** — Optional bundles of bigger models.
710. **Priority support** — Paid faster responses for businesses.
711. **Training workshops** — Paid sessions for teams adopting local AI.
712. **Consulting for private AI** — Help companies deploy on-device models.
713. **Plugin marketplace revenue share** — Take a small cut from paid plugins.
714. **Affiliate-free recommendations** — Never push products inside answers.
715. **Ethical ads decision** — Document why AUI shows no ads.
716. **Grants** — Apply for open-source and digital-rights grants.
717. **Crowdfunding campaign** — Fund a specific big feature publicly.
718. **Bounties** — Pay for fixes to specific issues.
719. **Pay what you want hardware guide** — Sell a short guide to running AUI on old devices.
720. **Course** — A paid course on building local-first AI apps.
721. **Book** — A guide to in-browser machine learning.
722. **Templates store** — Sell polished classroom and business prompt packs.
723. **API credits alternative** — Offer optional cloud models for users who want them, clearly marked.
724. **Bring your own key** — Let users add their own provider keys, stored only locally.
725. **Local-first licensing** — Offer one-time purchases for add-ons that work offline.
726. **Donation transparency page** — Show income and spending monthly.
727. **Cost per user stays near zero** — Publish why hosting costs don't grow with usage.
728. **Sustainable pricing principles** — Write rules for any future paid options.
729. **Nonprofit status exploration** — Consider a nonprofit structure.
730. **Corporate sponsors with no influence** — Accept funding with a published independence policy.
731. **Pro badge cosmetic** — A purely visual supporter badge.
732. **Early access for supporters** — Let supporters try features sooner, then release to all.
733. **Supporter wall** — List supporters who opt in.
734. **Gift subscriptions** — Let people gift paid sync to others.
735. **Student discounts** — Reduced prices with simple verification.
736. **Regional pricing** — Adjust prices by local income.
737. **Annual billing discount** — Lower cost for yearly sync plans.
738. **Refund policy** — Clear, generous terms for paid options.
739. **Billing without tracking** — Use privacy-preserving payment providers.
740. **Invoice generation** — Offer clean invoices for organizations.
741. **Procurement packet** — A security and privacy document for institutional buyers.
742. **Compliance sheets** — Explain data flows for regulated sectors.
743. **SLA for paid support** — Define response times in writing.
744. **Usage-free metering** — Avoid metering since inference is local.
745. **Revenue transparency dashboard** — A public chart of funds and goals.
746. **Exit plan** — Document how users keep working if paid services end.

## Multimodal and creative tools

747. **Local image captioning** — Describe uploaded images with a small vision model.
748. **OCR in the browser** — Read text from images with a WASM OCR engine.
749. **Screenshot explainer** — Paste a screenshot and get its text and a summary.
750. **Handwriting to text** — Transcribe photos of notes locally.
751. **Whisper in the browser** — Transcribe audio files without uploading them.
752. **Live captions** — Show real-time captions for a meeting on the device.
753. **Voice notes to text** — Record a memo and get clean notes.
754. **Podcast summarizer** — Summarize a transcript pasted from a podcast.
755. **Text to speech studio** — Convert replies to downloadable audio.
756. **Local voice assistant** — Wake word and spoken replies, fully offline.
757. **Image generation with a tiny model** — Run a small diffusion model on strong GPUs.
758. **Sketch to description** — Describe a drawing on a canvas.
759. **Drawing canvas** — A simple board whose contents can be explained by the model.
760. **Diagram from text** — Turn descriptions into flowcharts.
761. **Chart from data** — Paste numbers and get a quick chart.
762. **Slide outline maker** — Turn a topic into slide titles and notes.
763. **Slide deck export** — Export an outline to a basic HTML deck.
764. **Poster text suggestions** — Headlines and taglines for flyers.
765. **Logo idea helper** — Describe logo concepts with simple shapes.
766. **Color from photo** — Extract a palette from an uploaded picture.
767. **Font pairing suggestions** — Recommend fonts from a mood description.
768. **Storyboard writer** — Break a story into visual scenes.
769. **Comic panel scripts** — Write dialogue for comic strips.
770. **Song lyric helper** — Draft verses and rhymes on a theme.
771. **Chord progression ideas** — Suggest chords for a mood.
772. **Music theory tutor** — Explain scales, keys and intervals.
773. **Sound effect descriptions** — Describe sounds for games and videos.
774. **Game idea generator** — Concepts, mechanics and level outlines.
775. **Text adventure engine** — Play a simple generated adventure with saved state.
776. **Interactive fiction writer** — Branching stories with choices.
777. **Worldbuilding notebook** — Keep consistent notes for fictional settings.
778. **Character voice samples** — Write lines in distinct voices.
779. **Dialog polishing** — Make conversations in stories sound natural.
780. **Script formatting** — Format screenplays automatically.
781. **Poetry rhyme finder** — Offer rhymes and near-rhymes.
782. **Word association game** — A quick creative warm-up.
783. **Mind map builder** — Grow a visual map from a central idea.
784. **Photo caption writer** — Short captions from a description.
785. **Social post drafts** — Variations of a post for different tones.
786. **Hashtag ideas** — Relevant tags without scraping anything.
787. **Product description writer** — Short copy from a feature list.
788. **Video script outline** — Hooks, beats and calls to action.
789. **Thumbnail text ideas** — Short, punchy overlay text.
790. **Podcast show notes** — Timestamps and highlights from a transcript.
791. **Meme caption ideas** — Light-hearted caption suggestions.
792. **Alt text writer** — Write alt text for images users upload.
793. **Braille-friendly formatting** — Prepare text for braille translation tools.
794. **Sign language resources** — Explain basic signs with links to trusted guides.
795. **Translation of subtitles** — Translate pasted subtitle files.
796. **Subtitle timing helper** — Fix and align subtitle timestamps.

## Safety, trust and quality

797. **Honest limits notice** — Tell users what a 1B model does badly.
798. **Hallucination warning** — Remind users to verify facts and numbers.
799. **Confidence hints** — Flag replies the model seems unsure about.
800. **Source-needed flags** — Mark claims that need a citation.
801. **Fact-check helper** — Turn claims into questions to verify.
802. **Math verification** — Double-check arithmetic with real computation.
803. **Calculator tool** — Use exact calculations instead of model guesses.
804. **Date and time tool** — Provide the real current date to the model.
805. **Unit-safe conversions** — Use code for conversions rather than model memory.
806. **Code execution sandbox** — Run code to check its output before showing it.
807. **Safe mode content rules** — A stricter response mode for shared devices.
808. **Medical disclaimer** — Show a short note on health questions.
809. **Legal disclaimer** — Show a short note on legal questions.
810. **Financial disclaimer** — Show a short note on money questions.
811. **Crisis resources** — Show helpful hotlines when someone expresses distress.
812. **Refusal explanations** — Explain clearly when the model won't help.
813. **Prompt injection awareness** — Warn when pasted text tries to override instructions.
814. **Attachment sandboxing** — Treat file contents as data, not instructions.
815. **Output sanitization review** — Keep sanitizing HTML from model replies.
816. **Link safety preview** — Show where a link goes before opening it.
817. **Image safety** — Never auto-load remote images from replies.
818. **Clipboard permission care** — Ask before reading from the clipboard.
819. **Microphone consent** — Explain exactly when audio is used.
820. **Local storage transparency** — Show what's saved in the browser.
821. **Model card page** — Describe the model, license and known limits.
822. **License notices** — Credit the model and library authors properly.
823. **Model update notes** — Explain what changes when the model is upgraded.
824. **Bias awareness note** — Be open about possible biases in outputs.
825. **Feedback loop for errors** — Let users flag bad answers locally for export.
826. **Evaluation set** — A small test list of prompts to check quality after changes.
827. **Regression prompts** — Save examples that must keep working.
828. **Side-by-side model testing** — Compare candidate models on the same prompts offline.
829. **Human review mode** — Highlight replies a person should double-check.
830. **Child safety review** — Test replies against age-appropriate guidelines.
831. **Harassment guard** — Discourage using AUI to write abusive messages.
832. **Scam awareness** — Warn when a user may be drafting or receiving a scam.
833. **Privacy reminders in prompts** — Nudge users not to paste secrets.
834. **Secret detection** — Warn when text looks like a password or API key.
835. **Auto-redact secrets in exports** — Mask keys in exported conversations.
836. **Deepfake awareness** — Explain limits and responsibilities of media tools.
837. **Attribution reminders** — Suggest crediting AI help where required.
838. **Academic integrity guide** — Explain acceptable use for coursework.
839. **Workplace use guide** — Explain what's safe to paste at work.
840. **Incident response plan** — Steps for handling a security report.
841. **Transparency report** — Yearly summary of reports and fixes.
842. **Third-party dependency list** — Publish every external script AUI loads.
843. **Reproducible builds** — Let anyone verify the deployed files match the source.
844. **Signed releases** — Sign tags so users can verify them.
845. **Bug bounty-lite** — Recognize and thank reporters publicly.
846. **Independent audit** — Invite a security review of the sync code.

## Data, storage and sync

847. **Conflict resolution UI** — Show a clear choice when two devices edited the same chat.
848. **Per-message sync** — Merge changes message by message instead of whole chats.
849. **Operational transforms or CRDTs** — Merge edits from multiple devices without losing data.
850. **Sync status indicator** — Show saved, saving or offline next to the account.
851. **Manual sync button** — Let users force a sync and see the result.
852. **Sync log** — List recent sync attempts and errors.
853. **Retry policy settings** — Tune how often failed saves retry.
854. **Size warnings** — Warn before chats grow past cloud limits.
855. **Attachment storage in cloud** — Optionally store files in a separate bucket.
856. **Storage usage per chat** — Show which chats use the most space.
857. **Prune old attachments** — Remove large files from old chats.
858. **Thumbnail-only history** — Keep small previews of old images.
859. **Chat compaction** — Summarize and shrink very old conversations.
860. **Versioned chats** — Keep earlier versions users can restore.
861. **Soft delete in cloud** — Keep deleted rows for a short recovery period.
862. **Row-level security tests** — Verify users can only access their own rows.
863. **Supabase schema docs** — Explain every table and policy.
864. **Migration runner** — Apply SQL files in order from a script.
865. **Seed and reset scripts** — Create and clear demo data safely.
866. **Backup to a file** — Scheduled local backup reminders.
867. **Backup to user-owned cloud** — Export to the user's own Drive or Dropbox.
868. **Import from other chat apps** — Convert common export formats into AUI chats.
869. **Export to Notion or Obsidian** — Write chats as linked notes.
870. **Search index in IndexedDB** — Fast full-text search across all chats.
871. **Search filters** — Filter by date, mode or whether a chat has attachments.
872. **Saved searches** — Keep frequent searches one click away.
873. **Chat statistics** — Counts of chats, messages and words over time.
874. **Usage heatmap** — A calendar view of activity, kept local.
875. **Export statistics** — Download usage data as CSV.
876. **Memory manager** — View, edit and delete what the assistant remembers.
877. **Memory categories** — Group memories into preferences, facts and projects.
878. **Memory expiry** — Auto-forget items after a chosen time.
879. **Memory import and export** — Move memories between devices.
880. **Memory suggestions** — Ask before saving a new memory.
881. **Pinned memories** — Always include chosen facts in the prompt.
882. **Memory token budget** — Show how much of the context memory uses.
883. **Per-chat memory toggle** — Disable memory for one conversation.
884. **Project spaces** — Group chats, files and memory by project.
885. **Shared project files** — Reuse the same documents across a project's chats.
886. **File library** — A central place for uploaded documents.
887. **File preview** — View text, images and PDFs inside AUI.
888. **Duplicate file detection** — Avoid storing the same file twice.
889. **Content-addressed storage** — Deduplicate by hash across chats.
890. **Deleted file cleanup** — Remove orphaned data automatically.
891. **Storage health check** — Detect and repair inconsistencies.
892. **Quota-exceeded handling** — Fail gracefully when browser storage is full.
893. **Storage migration to IndexedDB** — Move existing localStorage data safely.
894. **Cross-tab synchronization** — Update all open tabs when data changes.
895. **Broadcast channel locks** — Prevent two tabs from generating at once.
896. **Data portability promise** — Commit to open formats forever.

## Mashups and wild ideas

897. **AUI on a USB stick** — A portable folder that runs the model from removable storage.
898. **AUI in a smart speaker** — A Raspberry Pi kit that runs the model with a mic and speaker.
899. **AUI on e-readers** — A reading companion that explains words and passages offline.
900. **Car mode** — Large controls and voice only for passengers.
901. **Smartwatch quick answers** — Tiny prompts and short replies on wearables.
902. **AR glasses overlay** — Show answers on top of what the camera sees.
903. **Museum guide** — Offline audio guide that answers questions about exhibits.
904. **Hiking companion** — Plant, rock and trail questions with no signal.
905. **Offline survival handbook** — Searchable first-aid and safety knowledge.
906. **Shipboard assistant** — Useful at sea with no internet.
907. **Airplane mode study room** — Learn on flights with a ready-cached model.
908. **Classroom robot brain** — Give a small robot a local language model.
909. **Game NPC dialogue** — Let game characters talk using the in-browser engine.
910. **Tabletop RPG companion** — Run encounters and rules lookups at the table.
911. **Escape room hint giver** — Hints that get more direct over time.
912. **Murder mystery host** — Generate clues and suspects for party games.
913. **Karaoke lyric helper** — Suggest lines when a singer forgets words.
914. **Dinner conversation starter** — Fun questions for a table.
915. **Bedtime story machine** — Calm stories with a gentle read-aloud voice.
916. **Dream journal interpreter** — Light, playful reflections on recorded dreams.
917. **Pet name chooser** — Narrow names by personality and breed.
918. **Garden planner** — Suggest plants for a region and season.
919. **Recipe from fridge photo** — List dishes from described leftovers.
920. **Wardrobe stylist** — Outfit ideas from a described closet.
921. **Home repair helper** — Step-by-step help for small fixes.
922. **Car trouble translator** — Explain warning lights and noises.
923. **Plant disease guide** — Describe leaves and get possible causes.
924. **Birdsong notes** — Describe a bird and narrow the species.
925. **Star gazing guide** — Explain what's in tonight's sky from a location and time.
926. **Weather diary** — Keep local notes and patterns offline.
927. **Time capsule chat** — Save a conversation to be opened years later.
928. **Letters to future self** — Write a note that reappears on a chosen date.
929. **Chat with your old notes** — Ask questions of your own journals privately.
930. **Personal knowledge base** — Build a searchable memory of everything you save.
931. **Second brain inbox** — Capture thoughts and sort them later with help.
932. **Daily briefing** — A morning summary of your notes and to-dos.
933. **Habit coach** — Gentle nudges stored only on the device.
934. **Focus buddy** — A body-doubling companion for work sessions.
935. **Rubber duck mode** — The model mostly listens and asks short questions.
936. **Argument settler** — Neutral summaries of both sides of a disagreement.
937. **Negotiation rehearsal** — Practice a hard conversation safely.
938. **Apology drafting** — Help write sincere, specific apologies.
939. **Condolence helper** — Gentle wording for difficult messages.
940. **Toast and speech writer** — Draft short speeches for events.
941. **Wedding vow workshop** — Help structure personal vows.
942. **Eulogy outline** — Support with structure and memories.
943. **Local history storyteller** — Share stories about a town from user-provided notes.
944. **Family recipe archive** — Collect and tidy recipes with their stories.
945. **Oral history interviewer** — Ask follow-up questions to capture elders' stories.

## Opposites and contrarian ideas

946. **Fewer features on purpose** — Keep AUI to chat, memory and export and say no to the rest.
947. **One model only, done well** — Spend effort polishing a single small model's prompts.
948. **No accounts at all** — Remove sign-in entirely and make everything local.
949. **No cloud, ever** — Drop Supabase and rely on file export for backup.
950. **No analytics, not even counters** — Remove the visitor counter completely.
951. **No markdown rendering** — Show plain text for speed and safety.
952. **No history by default** — Start every session clean unless the user saves a chat.
953. **Slower on purpose** — Add a calm typing pace to encourage reading.
954. **Shorter replies by default** — Limit answers to a paragraph unless asked for more.
955. **Questions before answers** — Have the model ask a clarifying question first.
956. **Refuse to write essays** — Coach instead of producing finished homework.
957. **Daily message budget as a feature** — Encourage intentional use with a gentle daily cap.
958. **Silence mode** — No sounds, animations or notifications ever.
959. **Text-only interface** — A terminal-style page with no images.
960. **Command line first** — Make the keyboard the primary interface.
961. **Mobile only** — Design for phones and treat desktop as secondary.
962. **Desktop only** — Optimize for large screens and big context.
963. **Single HTML file** — Ship the whole app as one portable file.
964. **No build step** — Keep everything hand-written and readable.
965. **No dependencies** — Remove every external library over time.
966. **Give the model less context** — Test whether short prompts improve small-model quality.
967. **Bigger model, opt-in** — Offer a heavy model only after explicit consent.
968. **Cloud model as a plugin** — Keep any hosted model strictly optional and separate.
969. **Self-destructing chats** — Delete each chat after a set time automatically.
970. **Anonymous by design** — Never store anything that identifies a person.
971. **Paper export only** — Make printed copies the only way to keep chats.
972. **Ephemeral tabs** — Each tab is a separate private session.
973. **Read-only mode** — Share a conversation that others can read but not continue.
974. **Public chat gallery** — Let users publish chats on purpose for others to learn from.
975. **Everything shareable** — Make every chat a link by default.
976. **Nothing shareable** — Remove all sharing features for maximum privacy.
977. **Collaborative chat** — Two people chat with one model together in real time.
978. **Offline-first collaboration** — Sync shared chats peer to peer with no server.
979. **Model argues with itself** — Show a debate between two personas on a question.
980. **Disagree button** — Ask the model to challenge its own answer.
981. **Red team mode** — Have the model look for flaws in the user's plan.
982. **Devil's advocate presets** — Argue against any chosen position.
983. **Silence the assistant** — A mode where the model replies only when asked directly.
984. **Prompt-only mode** — Hide history and show one prompt and one reply at a time.
985. **Time-boxed sessions** — End a session after a chosen duration with a summary.
986. **Unfinished replies on purpose** — Stop mid-thought so users guide the next part.
987. **Reverse chat** — The model asks questions and the user answers.
988. **Interview mode** — The model interviews the user to build a document.
989. **Teach the model** — The user explains a topic and the model asks questions to learn.
990. **Anti-hallucination mode** — Answer only from provided text and say I don't know otherwise.
991. **Short context challenge** — Reward good answers within very small prompts.
992. **Retro mode** — Pretend to be a 1990s terminal with limited commands.
993. **Low-power mode** — Run the smallest model and plain visuals to save battery.

## Next steps from this project

994. **Fix the github-pages environment rule** — Allow main in the environment's branch policy so deploys stop failing.
995. **Switch the repo default to main** — Make main the default branch so new PRs target it automatically.
996. **Delete stale branches** — Remove merged claude branches after each squash merge.
997. **Auto-delete head branches** — Turn on automatic branch deletion after merge.
998. **Merge queue for squash merges** — Keep main green when several PRs land close together.
999. **Required status check** — Make the Pages build and smoke tests required before merge.
1000. **Branch protection with review bypass for owner** — Protect main while keeping solo merging quick.
1001. **Replace placeholder owner with real login** — Verify the owner address once, then switch AUTO_OWNER_LOGIN off.
1002. **Owner address in one config** — Define the owner and support emails in a single shared file.
1003. **Server-side role check on Pages** — Move role decisions to a function that actually runs.
1004. **Vercel deployment for API routes** — Host beta-status and approvals where server code can run.
1005. **Supabase RLS review** — Check every policy with the email-verified claim in mind.
1006. **Run chat_storage.sql in Supabase** — Create the user_data table so cloud sync starts working.
1007. **Cloud sync smoke test** — Test saving and loading against a real Supabase project.
1008. **Cloud sync conflict test** — Edit one chat on two devices and check the merge.
1009. **Confirm-email decision** — Pick whether confirmation stays off once the owner is verified.
1010. **Owner verification checklist** — A short list of steps to verify and lock the owner account.
1011. **Remove unused API files** — Delete chat.js, image.js and search.js once nothing calls them.
1012. **Remove search and image buttons** — Hide features that only worked with the old API models.
1013. **Remove model-comparison code** — Delete compare mode since only one model exists.
1014. **Remove model names that no longer exist** — Clean old model IDs from aliases and tests.
1015. **Simplify tier logic** — Collapse free, dev and beta tiers that no longer gate models.
1016. **Rethink usage limits** — Daily message limits make little sense for local inference.
1017. **Drop the visitor counter or explain it** — Decide whether the counter table is still wanted.
1018. **Beta lab future** — Decide what the private beta program offers after the model change.
1019. **Dev access meaning** — Redefine dev access or remove it.
1020. **Clean the SQL folder** — Keep only migrations the project still needs.
1021. **Update the readme** — Describe AUI as a free in-browser chat with setup steps.
1022. **Document the Pages workflow** — Explain the path rewriting and environment settings.
1023. **Move sed rewrites to a script** — Test the Pages path rewriting in one place.
1024. **Use relative paths to drop rewrites** — Make links relative so no rewriting is needed.
1025. **Real service worker for Pages** — Make the service worker work under a subpath.
1026. **Offline test in CI** — Check that the app loads with the network blocked.
1027. **Real-model test on a GPU runner** — Run the actual Llama model in a scheduled test.
1028. **Weights integrity check** — Verify downloaded model shards against known hashes.
1029. **Model download UI polish** — Show size, speed and time left with a cancel button.
1030. **First-run welcome** — Explain the one-time download before it begins.
1031. **Retry button for failed loads** — Offer one-click retry with a clearer error.
1032. **Memory settings explanation** — Describe what memory stores and how it's used.
1033. **Memory off by default for privacy** — Decide whether remembering should be opt-in.
1034. **Prompt budget from real tokens** — Replace character estimates with tokenizer counts.
1035. **Better system prompt** — Tune the assistant's instructions for a 1B model.
1036. **Evaluate alternative small models** — Compare Qwen, Phi and Gemma on the same prompts.
1037. **Adopt a larger model for strong devices** — Detect capable GPUs and offer a bigger option.
1038. **Rename leftover T references** — Check styles, docs and alt text for old brand letters.
1039. **Rename the favicon file** — Replace the old T-based filename with an A-based one.
1040. **Search the repo for Talkaton remnants** — Check comments, SQL and docs for old names.
1041. **Fix case-sensitive paths on Linux hosts** — Confirm every file name matches its links exactly.
1042. **Tidy the probe output** — Move idea files into a docs folder instead of the repo root.
1043. **Teach the stop hook about generated files** — Avoid noisy prompts for scratch outputs.
1044. **Write a first release note** — Announce the switch to an on-device model.
