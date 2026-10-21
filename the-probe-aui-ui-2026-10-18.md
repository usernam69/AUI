# The Probe: AUI UI, theme, and in-browser model (2026-10-18)

## 1. Quick wins for the chat UI
1. **Copy on hover** - Show a copy icon on every message when hovered.
2. **Regenerate button** - One click re-runs the last reply.
3. **Stop label** - Show "Stop generating" text next to the stop icon.
4. **Empty-state greeting** - Say "What can I help with?" like ChatGPT.
5. **Time-based greeting** - "Good morning" or "Good evening" on the landing screen.
6. **Scroll-to-bottom pill** - Make the "Latest" button a round blue arrow.
7. **Auto-title chats** - Name a chat from its first message.
8. **Character warning** - Turn the char count blue then red near the limit.
9. **Tooltip delays** - Show tool tooltips after 400 ms, not instantly.
10. **Focus composer on load** - Put the cursor in the message box on desktop.
11. **Escape clears draft** - Double-Escape empties the composer.
12. **Up arrow edits last** - Up arrow in an empty box loads your last message.
13. **Feedback thumbs** - Thumbs up/down under each reply.
14. **Read aloud icon** - Speaker button per reply.
15. **Reply word count** - Tiny word count under long answers.
16. **Relative timestamps** - "2 min ago" instead of clock time.
17. **Styled date tooltip** - Nicer hover tooltip for full message dates.
18. **Smooth bubble entry** - Fade the user bubble in from the right.
19. **Typing dots in blue** - Recolor the typing indicator.
20. **Paste cleanup** - Strip odd formatting from pasted rich text.
21. **Undo clear chat** - Undo toast instead of a confirm dialog.
22. **Undo delete chat** - 5-second undo after deleting a chat.
23. **Header shadow on scroll** - Show a faint shadow only once scrolled.
24. **Hide hint after use** - Hide "Enter to send" after five sends.
25. **Clearer disclaimer** - "AUI can make mistakes. Check important info."
26. **Message counter ring** - Blue ring that empties as daily messages run out.
27. **Model badge dropdown** - Click the model name to switch model.
28. **Shortcut chip on hover** - Show the shortcut on the New chat row only on hover.
29. **Close popovers on scroll** - Tools popover hides when the page scrolls.
30. **Inline retry** - "Try again" button on failed replies.
31. **Offline send state** - Grey send button with a cloud-off icon when offline.
32. **Rename from top bar** - Click the title to rename the chat.
33. **Copy chat as text** - One click copies the whole conversation.
34. **Favicon dot** - Blue dot on the favicon when a reply finishes in a background tab.
35. **Tab title streaming** - Show "AUI is writing..." in the tab title.
36. **Visible focus rings** - Blue 2px focus rings everywhere.
37. **Better 404** - Restyle the 404 page in the blue theme.
38. **About page restyle** - Bring About up to the new design.
39. **Beta page restyle** - Same theme for the Beta page.
40. **SVG icon set** - Replace unicode glyphs with one consistent icon set.
41. **Press feedback** - Slight scale-down when buttons are pressed.
42. **Chip hover glow** - Suggestion chips glow blue on hover.
43. **Code copy confirmation** - "Copied!" swaps in for two seconds.
44. **External link marker** - Links open in a new tab with a small arrow.
45. **Collapse long user messages** - Fold user messages over 20 lines.
46. **Show more for replies** - Collapse huge replies behind "Show more".
47. **Smart quotes** - Render straight quotes as curly ones in replies.
48. **Ask about selection** - Highlight text in a reply to ask a follow-up about it.
49. **Version in settings** - Show the app version in Settings, not the hint line.
50. **Reset settings** - One button restores default settings.

## 2. ChatGPT-style layout polish
51. **Centered landing composer** - Composer sits mid-screen until the first send.
52. **Composer drops on send** - Animate the composer down to the bottom.
53. **Fixed reading column** - Keep one 768px column like ChatGPT.
54. **Floating top bar** - Transparent top bar over the chat.
55. **Model name as title** - "AUI 1B" with a caret in the top-left.
56. **Share button top-right** - Mirror ChatGPT's share placement.
57. **Account avatar top-right** - Round avatar with a menu.
58. **Two-pane sidebar icon** - Replace the arrow toggle with a panel icon.
59. **Pencil new chat icon** - Pencil-on-square for New chat.
60. **Sidebar section headers** - "Today", "Yesterday", "Previous 7 days".
61. **Sidebar bottom fade** - Gradient above the account row.
62. **Plan under name** - "Guest - Free" under the account name.
63. **Hover ellipsis on chats** - A three-dot menu appears on hover.
64. **Standard chat menu** - Share, rename, archive, delete.
65. **Archive instead of delete** - Archived chats live in Settings.
66. **Avatar-free thread** - Keep the thread clean with no avatars.
67. **Reply action row** - Copy, thumbs, read aloud, regenerate under each reply.
68. **Actions on last reply only** - Older replies show actions on hover.
69. **Plus menu** - "+" opens upload, image and search options.
70. **Tool chip** - The chosen tool shows as a removable blue chip in the composer.
71. **Voice controls by send** - Put the mic next to the send button.
72. **Send becomes stop** - Square stop icon while generating.
73. **ChatGPT corner radius** - Match the composer radius exactly.
74. **Composer max height** - Grows to half the screen, then scrolls.
75. **Disclaimer placement** - Small centered grey line under the composer.
76. **Counter only near limit** - Show remaining messages only when low.
77. **Tabbed settings** - General, Personalization, Data controls.
78. **Settings left nav** - Tab list down the left of the dialog.
79. **Bottom-center toasts** - Match ChatGPT's toast position.
80. **Hidden scrollbars** - Show only on hover.
81. **Always-dark code blocks** - Dark code blocks in light mode too.
82. **Code header bar** - Language on the left, Copy on the right.
83. **Ruled tables** - Clean borders and header shading.
84. **Heading rhythm** - ChatGPT-like spacing around headings.
85. **List spacing** - Tighter bullets with clear item gaps.
86. **Blue quote bar** - Blue left border on blockquotes.
87. **Inline code pill** - Subtle rounded background for inline code.
88. **Centered math** - KaTeX blocks centered with horizontal scroll.
89. **Rounded images** - 12px radius on generated images.
90. **Attachment cards** - File cards above the user bubble.
91. **Searching status** - Shimmering "Searching the web" row.
92. **Thinking shimmer** - Shimmering "Thinking..." while waiting.
93. **Load shimmer with percent** - Same shimmer during the model download.
94. **Edit pencil on bubbles** - Hover your message to edit it.
95. **Branch counter** - Left/right arrows with "1/2" on edited messages.
96. **Temporary chat** - A toggle for chats that are never saved.
97. **Explore page** - Gallery of prompt presets.
98. **Mobile header layout** - Menu on the left, new chat on the right.
99. **Date separators** - Optional day dividers in long chats.
100. **Beta pill** - A "Get Beta" pill in the sidebar.

## 3. Blue theme & visual design
101. **Accent picker** - Blue, purple, green, orange or red in Settings.
102. **Living logo** - Slow gradient shift on the A mark.
103. **Navy depth layers** - Three navy shades for clear depth.
104. **Glass sidebar** - Slight blur over a soft gradient.
105. **Composer glow** - Soft blue glow when focused.
106. **Starfield landing** - Faint dots behind the landing screen.
107. **Ocean theme** - A teal-blue variant.
108. **Midnight theme** - Near-black blue.
109. **Sky light theme** - Very light blue-white.
110. **OLED black** - Pure black with blue accents.
111. **Sepia reading mode** - A warm option for long reading.
112. **Theme preview cards** - Visual swatches in Settings.
113. **Auto theme by time** - Light by day, dark by night.
114. **Flat bubble option** - Choose flat or gradient bubbles.
115. **Bubble color picker** - Pick your own bubble color.
116. **Font choice** - Inter, system, serif or dyslexia-friendly.
117. **Font weight slider** - Lighter or bolder text.
118. **Line height setting** - Comfortable or tight.
119. **Content width setting** - Narrow, normal or wide.
120. **Icon style swap** - Outline or filled icons.
121. **Blue caret** - Accent-colored cursor in the composer.
122. **Tuned selection color** - Adjust highlight opacity for readability.
123. **Accent scrollbar** - Blue scrollbar thumb on hover.
124. **Animated send** - The arrow flies up on send.
125. **First message sparkle** - A tiny celebration on your first message ever.
126. **Landing illustration** - A friendly robot on the landing page.
127. **Seasonal touches** - Snow in December, leaves in autumn.
128. **Logo refresh** - A modern A monogram.
129. **Blue favicon** - Match the favicon to the accent.
130. **Navy manifest colors** - Update PWA theme colors.
131. **Blue home-screen icon** - Refresh the Apple touch icon.
132. **New share image** - A blue Open Graph image.
133. **Radius scale** - 8, 12, 16, 28 used consistently.
134. **Shadow scale** - Three tidy shadow levels.
135. **Motion tokens** - Standard animation durations.
136. **Navy code theme** - A highlight theme tinted to match.
137. **Light code theme** - GitHub light colors in light mode.
138. **Contrast audit** - Check every text color passes WCAG AA.
139. **Hover tokens** - One hover color per surface.
140. **Dead CSS cleanup** - Delete rules the theme now overrides.
141. **Theme in the token layer** - Move overrides into proper CSS layers.
142. **Split stylesheet** - theme, layout and components files.
143. **Color reference page** - A page listing every design token.
144. **Status colors** - Blue info, green success, amber warning, red error.
145. **Theme-aware art** - Different empty-state art for light and dark.
146. **Loading skeletons** - Navy skeleton bars while chats load.
147. **Dialog blur** - Blur the page behind modals.
148. **Softer dialogs** - 20px dialog corners.
149. **Top progress bar** - Thin blue bar during the model download.
150. **Model-ready confetti** - A small, one-time celebration.

## 4. Sidebar & chat history
151. **Date grouping** - Today, Yesterday, 7 days, 30 days, older.
152. **Pinned chats** - A pinned section at the top.
153. **Folders** - Group chats into folders.
154. **Reorder pins** - Drag pinned chats into order.
155. **Chat colors** - A color tag per chat.
156. **Chat emoji** - Pick an emoji icon for a chat.
157. **Fuzzy search** - Typos still find chats.
158. **Full-text search** - Search message text, not just titles.
159. **Search highlights** - Highlight matches in results.
160. **Jump to match** - Open the chat scrolled to the matching message.
161. **Recent searches** - Remember the last five searches.
162. **Bulk select** - Select many chats to delete or export.
163. **Archive view** - A separate archived list.
164. **Auto-archive** - Optionally archive chats older than 90 days.
165. **Chat count** - Show the total number of chats.
166. **Icon rail** - Icons only when the sidebar is collapsed.
167. **Resizable sidebar** - Drag the edge to resize.
168. **Remembered width** - Keep the sidebar width between visits.
169. **Arrow-key navigation** - Move between chats with the keyboard.
170. **New tab from menu** - "Open in new tab" in the chat menu.
171. **Duplicate chat** - Copy a chat to explore a different direction.
172. **Merge chats** - Combine two conversations.
173. **Hover preview** - Show the first line of a chat on hover.
174. **Unread dot** - Mark chats with replies you haven't seen.
175. **Starred messages** - Star messages and list them in the sidebar.
176. **Sort options** - By recent, created or name.
177. **Smooth loading** - Polish the batch loading of long chat lists.
178. **Empty sidebar state** - A friendly "No chats yet".
179. **Compact footer links** - Fold Home, Beta and About into one menu.
180. **Account popover** - Settings, help and log out in one menu.
181. **Memory badge** - Blue count badge on Memory.
182. **Swipe to open** - Swipe from the left edge on phones.
183. **Auto-close on pick** - Close the mobile sidebar after choosing a chat.
184. **Better titles** - Ask the model to improve a chat's title.
185. **Clean truncation** - Tidy ellipsis on long titles.
186. **Export one chat** - Markdown, JSON or PDF.
187. **Import ChatGPT history** - Read a ChatGPT conversations.json export.
188. **Cross-device sync** - Optional Supabase sync for logged-in users.
189. **Sync conflict merge** - Merge when two devices edit one chat.
190. **Trash bin** - Keep deleted chats for 30 days.
191. **Chat stats** - Messages, words and model per chat.
192. **Tag filter** - Filter the list by tag.
193. **Smart folders** - Auto-group chats about code.
194. **Chat templates** - Start a new chat from a saved one.
195. **Minimal first visit** - Hide the sidebar until there's a chat.
196. **Right-click menu** - The chat menu on right-click.
197. **Undo rename** - Ctrl+Z after renaming.
198. **Shortcut hints** - Show keyboard shortcuts in the sidebar.
199. **Chat lock** - Hide a chat behind a PIN.
200. **Storage meter** - Show how much browser space chats use.

## 5. Composer & input
201. **Slash commands** - Type "/" for quick actions like /image or /search.
202. **Prompt library** - Save and reuse favorite prompts.
203. **@ mentions for files** - Type "@" to reference an attached file.
204. **Draft per chat** - Keep an unsent draft for each chat separately.
205. **Draft restore toast** - "Draft restored" when you return.
206. **Markdown preview** - Toggle to preview what you typed.
207. **Code paste detection** - Wrap pasted code in a fenced block automatically.
208. **Large paste as file** - Long pastes turn into an attachment card.
209. **Spell check toggle** - Browser spellcheck on or off.
210. **Auto-grow smoothness** - Animate height changes.
211. **Placeholder rotation** - Rotate example prompts in the placeholder.
212. **Voice waveform** - Show a live waveform while dictating.
213. **Voice auto-send** - Send automatically after a pause.
214. **Push-to-talk key** - Hold a key to dictate.
215. **Emoji picker** - A small emoji button.
216. **Prompt improver** - One click rewrites your prompt more clearly.
217. **Token estimate** - Show roughly how much of the model's window you're using.
218. **Context meter** - A bar that fills as the chat nears the model's limit.
219. **Queue messages** - Type the next message while a reply streams.
220. **Send later** - Queue a message until the model finishes loading.
221. **Multi-line hint** - Show Shift+Enter tip the first time you press Enter twice.
222. **Drag-drop glow** - Blue dashed border when dragging files.
223. **Paste images** - Paste screenshots straight into the composer.
224. **Attachment previews** - Thumbnails for images before sending.
225. **Remove attachment animation** - Smooth removal of attachment chips.
226. **Attachment size warning** - Warn before attaching huge files.
227. **Composer focus shortcut** - Press "/" anywhere to focus the box.
228. **Clear button** - An x to clear the composer.
229. **Word count toggle** - Show words instead of characters.
230. **RTL support** - Detect right-to-left text and flip direction.
231. **Hebrew-friendly input** - Correct alignment for mixed Hebrew/English.
232. **Autocomplete** - Suggest how to finish your prompt.
233. **Follow-up suggestions** - Three suggested follow-ups after each reply.
234. **Quick reply chips** - "Shorter", "Longer", "Simpler" buttons.
235. **Tone chips** - "Formal", "Casual", "Funny" one-tap rewrites.
236. **Translate chip** - Translate the last reply.
237. **Explain like I'm five chip** - Simplify the last answer.
238. **Continue button** - Continue a reply that hit the length limit.
239. **Mobile send key** - Make the keyboard show "Send".
240. **Composer toolbar overflow** - Fold extra tools into a "..." on small screens.
241. **Tool tooltips with shortcuts** - Show the shortcut in each tooltip.
242. **Search toggle chip** - Make web search a visible on/off chip.
243. **Image mode chip** - Visible chip when generating an image.
244. **Recent prompts dropdown** - Arrow to recall recent prompts.
245. **Typing sound** - Optional soft keypress sounds.
246. **Composer themes** - Bubble vs flat composer style.
247. **Composer position** - Choose bottom or centered.
248. **Keyboard-safe area** - Keep the composer above the mobile keyboard.
249. **Haptics on send** - A small vibration on phones.
250. **Character limit friendly** - Explain the limit instead of a hard stop.

## 6. Message rendering & markdown
251. **Streaming cursor** - A blinking blue block at the end of streaming text.
252. **Smooth word streaming** - Reveal words evenly rather than in bursts.
253. **Syntax highlight while streaming** - Highlight code as it arrives.
254. **Line numbers toggle** - Line numbers in code blocks.
255. **Wrap toggle** - Wrap long code lines on demand.
256. **Download code** - Save a code block as a file.
257. **Run HTML/JS** - Preview HTML in a sandboxed frame.
258. **Copy as Markdown** - Copy a reply with formatting.
259. **Copy as plain text** - Copy without Markdown.
260. **Table to CSV** - Download a table as CSV.
261. **Sortable tables** - Click headers to sort.
262. **Mermaid diagrams** - Render mermaid code blocks as diagrams.
263. **Charts from data** - Render simple chart blocks.
264. **Collapsible sections** - Fold long headings.
265. **Table of contents** - For very long replies.
266. **Footnotes** - Render footnote syntax.
267. **Task lists** - Clickable checkboxes in replies.
268. **Callout boxes** - Note/Warning blocks with color.
269. **Emoji shortcodes** - Render :smile: as an emoji.
270. **Math copy as LaTeX** - Copy equations as source.
271. **Image lightbox** - Click images to view full size.
272. **Image download names** - Name files from the prompt.
273. **Link safety** - Warn before opening odd links.
274. **Long URL shortening** - Show domain only for long links.
275. **Reading time** - "2 min read" on long replies.
276. **Highlight key sentence** - Bold the main answer line.
277. **TL;DR toggle** - Show a summary on top of long replies.
278. **Inline definitions** - Hover a term to see a short definition.
279. **Quote reply** - Quote part of a reply into the composer.
280. **Message permalink** - Copy a link to one message.
281. **Diff view** - Show code changes between two replies.
282. **Compare replies side by side** - Better compare-mode layout.
283. **Model label chip** - Blue chip naming the model in compare mode.
284. **Streaming speed display** - Tokens per second under the reply.
285. **Generation time** - "Answered in 4.2 s".
286. **Error styling** - Clear red-bordered error card with retry.
287. **Partial reply badge** - Mark replies that were stopped early.
288. **Markdown sanitizing tests** - Make sure no HTML injection slips through.
289. **Lazy-render old messages** - Render offscreen messages on demand.
290. **Virtual scrolling** - Handle 1000-message chats smoothly.
291. **Code language guess** - Detect language for unlabeled blocks.
292. **Copy button on hover only** - Cleaner code blocks.
293. **Sticky code header** - Keep the copy button visible while scrolling long code.
294. **Print styles** - Clean printouts of chats.
295. **Export reply as image** - Share a reply as a PNG card.
296. **Text-to-speech highlighting** - Highlight words as they're read aloud.
297. **Bidirectional text** - Correct rendering of mixed RTL text.
298. **Big number formatting** - Locale-aware numbers.
299. **Date formatting** - Locale-aware dates in timestamps.
300. **Reduced motion streaming** - No animations when reduced motion is on.

## 7. SLM speed & performance
301. **Web Worker engine** - Run WebLLM in a worker so the page never stutters.
302. **Shared engine across tabs** - Use a SharedWorker so tabs share one model.
303. **Service worker engine** - Keep the model alive between page loads.
304. **Prefill caching** - Reuse the system prompt's KV cache between turns.
305. **Shorter system prompt** - Fewer tokens to process before each reply.
306. **Smaller history budget** - Trim old turns harder for faster first token.
307. **Adaptive max tokens** - Short questions get a lower token cap.
308. **Qwen 0.5B option** - An even smaller, faster model.
309. **SmolLM option** - A tiny model for weak devices.
310. **Phi-3.5 mini option** - Better quality for strong GPUs.
311. **Speed benchmark** - Measure tokens/sec on first load and pick a model.
312. **Fast/Smart toggle** - Let users choose 1B or 3B.
313. **Background download** - Download the model when the tab is idle.
314. **Download resume** - Show that partial downloads continue.
315. **Download in chunks with progress** - Per-file progress list.
316. **Storage persistence** - Request persistent storage so the model isn't evicted.
317. **Cache check on load** - Already done; show "Model ready" badge.
318. **Warm on hover** - Start loading when hovering the composer.
319. **Desktop-only typing warmup** - Avoid surprise downloads on phones.
320. **Data saver detection** - Skip auto-download when Save-Data is on.
321. **Connection-aware download** - Wait for Wi-Fi on mobile.
322. **Unload when idle** - Free GPU memory after 10 minutes idle.
323. **Reload fast** - Keep weights in cache for instant reload.
324. **Lazy import engine** - Load the 6 MB engine only when needed.
325. **Compress engine file** - Serve the vendor file minified.
326. **Preload hint** - modulepreload for the engine on the chat page.
327. **Stream batching** - Paint every animation frame, not every token.
328. **Markdown render throttling** - Cheaper rendering during streaming.
329. **Incremental markdown** - Only re-render the last block.
330. **Skip highlight while streaming** - Highlight code once finished.
331. **Faster first paint** - Inline critical CSS.
332. **Smaller CSS** - Remove unused rules to cut size.
333. **Split app.js** - Load rarely used features lazily.
334. **Defer KaTeX** - Load math styles only when math appears.
335. **Defer highlight.js** - Load only when code appears.
336. **Font loading** - Use system fonts to skip font downloads.
337. **Image lazy loading** - Lazy-load images in old chats.
338. **IndexedDB for chats** - Faster than localStorage for big histories.
339. **Debounced persistence** - Save less often while streaming.
340. **Performance panel** - Hidden dev panel with timings.
341. **Speculative decoding** - Pair a tiny draft model with the main one.
342. **Quantization choice** - q4 vs q3 builds for speed.
343. **Context window tuning** - Smaller window for faster prefill.
344. **GPU adapter preference** - Ask for the high-performance GPU.
345. **WebGPU feature detection message** - Clear tips when WebGPU is missing.
346. **WASM fallback** - CPU fallback for browsers without WebGPU.
347. **Time-to-first-token display** - Show how long the first word took.
348. **Prompt length warning** - Warn when a giant paste will be slow.
349. **Attachment excerpting** - Smarter RAG to send fewer tokens.
350. **Benchmark page** - A page comparing models on your device.

## 8. SLM answer quality & prompting
351. **Few-shot examples** - Add two short example exchanges to the system prompt.
352. **Persona tuning** - Make "smart, funny, slightly unhinged" show in replies.
353. **Answer length control** - Short, medium, long setting.
354. **Self-check pass** - Ask the model to double-check math answers.
355. **Calculator tool** - Do arithmetic in JavaScript, not the model.
356. **Date injection** - Tell the model today's date.
357. **Time zone injection** - Tell the model the user's local time.
358. **Unit converter tool** - Exact conversions done in code.
359. **Wikipedia lookup** - Fetch summaries from the Wikipedia API (CORS-friendly).
360. **Dictionary tool** - Definitions from a free dictionary API.
361. **Weather tool** - Open-Meteo for weather questions.
362. **Code runner** - Run JavaScript answers in a sandbox to verify them.
363. **Refusal tuning** - Fewer needless refusals from the small model.
364. **Repetition penalty** - Reduce loops in long replies.
365. **Temperature per task** - Lower for code, higher for stories.
366. **Stop sequences** - End replies cleanly.
367. **Better titles prompt** - Short, specific chat titles.
368. **Follow-up generator** - Suggest next questions.
369. **Summarize long chats** - Compress old turns into a summary.
370. **Rolling memory** - Keep a running summary as context.
371. **Language matching** - Reply in the user's language.
372. **Hebrew support check** - Test answers in Hebrew.
373. **Code formatting rules** - Always label code languages.
374. **Honest uncertainty** - Prefer "I'm not sure" to guessing.
375. **Small-model disclaimer** - Gentle note on factual questions.
376. **Fact cards** - Cite the tool source when a tool answered.
377. **Model switching hint** - Suggest the bigger model for hard questions.
378. **Answer rating loop** - Thumbs feed a local "what worked" list.
379. **Prompt A/B tests** - Compare two system prompts locally.
380. **Eval set** - A list of 50 test questions to score models.
381. **Hallucination tests** - Track wrong-fact rate across versions.
382. **Grammar checker mode** - Fix grammar of pasted text.
383. **Summarizer mode** - Summarize pasted articles.
384. **Email writer** - Templates for emails.
385. **Homework helper** - Guided hints instead of answers.
386. **Code explainer** - Explain pasted code line by line.
387. **Regex helper** - Build and test regexes.
388. **SQL helper** - Write and explain SQL.
389. **Story mode** - Collaborative storytelling.
390. **Quiz mode** - The model quizzes you.
391. **Flashcards** - Turn a reply into flashcards.
392. **Brainstorm mode** - Lists of ideas, fast.
393. **Debate mode** - The model argues the other side.
394. **Recipe mode** - Structured recipes with scaling.
395. **Travel planner** - Day-by-day itineraries.
396. **Workout planner** - Simple routines.
397. **Study timer** - Pomodoro inside the chat.
398. **Character chat** - Talk to a fictional persona.
399. **Custom instructions** - "What should AUI know about you?"
400. **Response style presets** - Saved custom instructions (instead of removed modes).

## 9. Offline, PWA & GitHub Pages hosting
401. **Install prompt** - "Install AUI" button for the PWA.
402. **Offline-first chat** - Fully works offline once the model is cached.
403. **Offline indicator** - Clear but subtle offline state.
404. **Update toast** - "New version available - reload".
405. **Auto cache-busting** - Build step stamps versions instead of manual edits.
406. **Single version constant** - One place to bump asset versions.
407. **Custom domain** - Point a domain at GitHub Pages.
408. **HTTPS enforcement** - Make sure Pages forces HTTPS.
409. **Pages from main** - Allow main in the environment rules and simplify.
410. **Preview deployments** - Deploy branches to a preview path.
411. **Deploy status badge** - README badge for the Pages workflow.
412. **Link checker in CI** - Catch broken /AUI/ paths.
413. **Lighthouse CI** - Track performance scores per deploy.
414. **Remove /api calls** - Hide web search and image buttons that need a server.
415. **Client-side search** - Use a CORS-friendly search API from the browser.
416. **Client-side image generation** - Run a tiny diffusion model in WebGPU.
417. **Feature flags** - Turn server-only features off on Pages.
418. **Graceful API errors** - Explain why a feature isn't available.
419. **Edge function option** - Cloudflare Worker for search, if wanted later.
420. **Root redirect** - Make / open the chat directly.
421. **Clean URLs** - /AUI/chat without index.html.
422. **404 redirect trick** - SPA-style deep links on Pages.
423. **Sitemap** - Help search engines find pages.
424. **robots.txt** - Control indexing.
425. **Manifest scope fix** - Scope the PWA to /AUI/.
426. **Icons for all sizes** - Complete PWA icon set.
427. **Splash screens** - iOS splash images.
428. **Share target** - Share text from other apps into AUI.
429. **File handler** - Open files with AUI from the OS.
430. **Protocol handler** - web+aui:// links.
431. **Background sync** - Retry Supabase saves when back online.
432. **Periodic update check** - Check for new versions daily.
433. **Cache size management** - Clean old asset caches.
434. **Model cache controls** - "Delete downloaded model" in Settings.
435. **Storage estimate** - Show how much space the model uses.
436. **Offline docs** - Help page available offline.
437. **Precache the model list** - Know models without network.
438. **Release notes page** - What changed in each version.
439. **Version footer link** - Click the version to see release notes.
440. **Status page** - Simple uptime page for Supabase features.
441. **CDN fallback check** - Test the jsDelivr fallback works.
442. **Integrity hashes** - SRI on CDN scripts.
443. **Workflow caching** - Faster Pages builds.
444. **Workflow test gate** - Deploy only if tests pass.
445. **Branch cleanup** - Retire the claude/blissful-hopper branch once main can deploy.
446. **Rollback button** - Re-run an older deploy quickly.
447. **Environment docs** - README section on deployment.
448. **Local dev server** - One command to run the site at /AUI/ locally.
449. **Path rewrite tests** - Test the sed rewrites in the workflow.
450. **Base path constant** - Stop relying on sed for /AUI/ links.

## 10. Accessibility
451. **Screen reader announcements** - Announce when a reply finishes.
452. **Live region tuning** - Avoid reading every streamed token.
453. **Keyboard-only flow** - Every feature usable without a mouse.
454. **Focus trap in dialogs** - Keep focus inside open dialogs.
455. **Return focus** - Restore focus after closing dialogs.
456. **Skip links** - Skip to chat list, messages and composer.
457. **ARIA labels audit** - Label every icon button.
458. **Landmarks** - Proper nav, main and complementary roles.
459. **Heading structure** - Logical headings in replies.
460. **Contrast checks** - Automated contrast tests.
461. **Reduced motion** - Respect it everywhere.
462. **Large text mode** - 150% text option.
463. **Dyslexia font** - OpenDyslexic option.
464. **Color-blind safe accents** - Don't rely on color alone.
465. **Focus visible always** - Clear rings on all controls.
466. **Touch target sizes** - 44px minimum.
467. **Captions for voice** - Show text while voice plays.
468. **Speech rate presets** - Slow, normal, fast.
469. **Voice selection** - Choose the reading voice.
470. **Keyboard shortcut customization** - Rebind shortcuts.
471. **Read selection aloud** - Read only highlighted text.
472. **High contrast polish** - Test every screen in high contrast.
473. **Forced colors support** - Windows high contrast mode.
474. **Zoom to 400%** - Layout survives heavy zoom.
475. **Alt text for generated images** - Use the prompt as alt text.
476. **Describe images** - Generated alt text for uploads.
477. **Error messages announced** - Errors read by screen readers.
478. **Form labels** - Visible labels on every input.
479. **Accessible toggles** - Proper switch semantics.
480. **Accessible tooltips** - Keyboard-reachable tooltips.
481. **Simple language mode** - Model writes at an easy reading level.
482. **Line focus mode** - Dim everything but the current paragraph.
483. **Reading ruler** - A horizontal guide line.
484. **Keyboard help overlay** - Already exists; make it discoverable.
485. **Screen reader testing** - NVDA and VoiceOver passes.
486. **Accessibility statement** - A page describing support.
487. **Timeout warnings** - None, or warn before anything expires.
488. **No autoplay sound** - Sounds only when enabled.
489. **Accessible code blocks** - Announce language and line count.
490. **Table semantics** - Proper header cells in tables.
491. **Math accessibility** - KaTeX MathML output.
492. **Language attributes** - Mark Hebrew passages with lang.
493. **Cognitive load** - Fewer buttons visible at once.
494. **Consistent placement** - Actions always in the same spot.
495. **Undo everywhere** - Forgiving destructive actions.
496. **Clear progress** - Text progress, not only bars.
497. **Pause streaming** - Pause and resume the stream.
498. **Accessible charts** - Data tables behind charts.
499. **Accessible color picker** - Named color options.
500. **A11y CI check** - axe-core run in tests.

## 11. Mobile experience
501. **Bottom sheet menus** - Tool and chat menus slide up from the bottom.
502. **Pull to refresh off** - Prevent accidental reloads mid-reply.
503. **Swipe to reply** - Swipe a message to quote it.
504. **Long-press actions** - Long-press a message for copy/share.
505. **Native share** - Use the Web Share API for replies.
506. **Keyboard-aware layout** - Composer stays above the keyboard.
507. **Safe-area padding** - Respect the iPhone notch and home bar.
508. **One-hand mode** - Key buttons reachable by thumb.
509. **Mobile model warning** - Explain the download size before starting.
510. **Wi-Fi only download** - Option to wait for Wi-Fi.
511. **Battery saver** - Pause the model when battery is low.
512. **Thermal-friendly mode** - Slower generation to keep phones cool.
513. **Compact mobile header** - Smaller top bar.
514. **Hide visitor stats on mobile** - Already hidden; keep it lean.
515. **Haptic feedback** - Light vibration on actions.
516. **Mobile font size** - Slightly larger default text.
517. **Landscape layout** - Use width wisely in landscape.
518. **Tablet split view** - Sidebar always visible on tablets.
519. **iPad keyboard shortcuts** - Hardware keyboard support.
520. **Android back button** - Closes dialogs and sidebar.
521. **Status bar color** - Match navy on Android.
522. **Home screen shortcuts** - "New chat" app shortcut.
523. **Mobile voice-first** - Big mic button option.
524. **Tap to copy code** - Easy copy on small screens.
525. **Horizontal code scroll hint** - Fade edge on overflowing code.
526. **Mobile tables** - Scrollable tables with sticky first column.
527. **Image pinch zoom** - Zoom generated images.
528. **Mobile attachment picker** - Camera, photos, files.
529. **Camera capture** - Take a photo straight into chat.
530. **Mobile drafts** - Keep drafts if the app is backgrounded.
531. **Resume after background** - Recover a stream after switching apps.
532. **Low-memory detection** - Pick the smallest model on low-RAM phones.
533. **iOS WebGPU messaging** - Explain Safari settings if needed.
534. **Mobile onboarding** - Three quick tips on first launch.
535. **Gesture to new chat** - Swipe down on header for new chat.
536. **Sticky scroll button** - Big round scroll-down button.
537. **Thumb-friendly send** - Larger send button on phones.
538. **Mobile settings layout** - Full-screen settings sheet.
539. **Reduce animations on mobile** - Save battery.
540. **Mobile dark default** - Follow system theme.
541. **Offline mobile mode** - Works on a plane once cached.
542. **Text selection fix** - Easy text selection in replies.
543. **Avoid zoom on focus** - 16px inputs stop iOS zoom.
544. **Scroll performance** - Smooth scrolling in long chats.
545. **Mobile memory panel** - Simpler memory view.
546. **Notifications on mobile** - Notify when a reply finishes.
547. **Mobile share card** - Pretty image cards for sharing.
548. **PWA badge count** - App icon badge for unread replies.
549. **Mobile QR handoff** - Scan to continue a chat on phone.
550. **Mobile testing matrix** - Test on iPhone, Pixel and a budget Android.

## 12. Settings & personalization
551. **Settings search** - Find a setting by typing.
552. **Your name** - AUI greets you by name.
553. **Nickname for AUI** - Rename your assistant.
554. **Avatar for AUI** - Pick its icon.
555. **Default model setting** - Choose the model per device.
556. **Reply length default** - Short or detailed by default.
557. **Emoji level** - None, some, lots.
558. **Humor level slider** - From serious to unhinged.
559. **Formality slider** - Casual to formal.
560. **Language setting** - UI language choice.
561. **Hebrew UI** - Full Hebrew translation with RTL layout.
562. **Date format setting** - 12h or 24h.
563. **Send key setting** - Already exists; add Cmd+Enter option.
564. **Sound pack** - Different finish chimes.
565. **Notification preferences** - Per-event toggles.
566. **Auto-scroll sensitivity** - How quickly scroll pauses.
567. **Streaming speed** - Instant or smooth reveal.
568. **Code theme setting** - Choose a highlight theme.
569. **Show token speed** - Toggle the tokens/sec readout.
570. **Show model badge** - Toggle the top-bar label.
571. **Compact sidebar** - Smaller chat rows.
572. **Profiles** - Separate settings per person on one device.
573. **Import/export settings** - Move settings between browsers.
574. **Sync settings** - Store in Supabase for logged-in users.
575. **Keyboard layout** - Shortcut sets for Mac and Windows.
576. **Startup screen** - Last chat or new chat on open.
577. **Welcome back summary** - Show where you left off.
578. **Privacy defaults** - Memory off by default option.
579. **Data controls tab** - Export, delete, storage in one place.
580. **Danger zone** - Clearly separated destructive actions.
581. **Settings change toast** - Confirm saved settings.
582. **Instant apply** - No Save button needed.
583. **Preview while changing** - Live preview of theme changes.
584. **Settings onboarding** - First-run wizard for key choices.
585. **Accessibility tab** - All a11y options together.
586. **Experimental tab** - Try new features early.
587. **Beta features toggle** - Opt into experiments.
588. **About tab** - Version, credits, licenses.
589. **Model tab** - Download, delete, benchmark models.
590. **Storage tab** - What uses space.
591. **Keyboard tab** - All shortcuts listed.
592. **Voice tab** - Voice input and output settings.
593. **Memory tab** - Manage memories inline.
594. **Appearance tab** - Theme, font, density, width.
595. **Reset per tab** - Reset one section only.
596. **Settings URL** - Deep link to a settings tab.
597. **Saved prompt styles** - Replacement for the removed modes.
598. **Per-chat settings** - Override model or style per chat.
599. **Chat-level instructions** - Notes the model sees in one chat only.
600. **Quiet hours** - No sounds at night.

## 13. Memory & context
601. **Memory editing** - Edit saved memories directly.
602. **Memory categories** - Personal, work, preferences.
603. **Memory suggestions** - "Should I remember that?" prompt.
604. **Explicit remember command** - "Remember that I..." saves instantly.
605. **Forget command** - "Forget that" removes a memory.
606. **Memory search** - Find a memory by text.
607. **Memory export** - Download memories.
608. **Memory import** - Bring memories from other assistants.
609. **Memory usage indicator** - Show when a memory was used in a reply.
610. **Memory limits display** - Show 100-memory cap clearly.
611. **Memory dedupe** - Merge duplicate memories.
612. **Memory expiry** - Optional auto-forget after a time.
613. **Memory privacy mode** - Pause memory temporarily.
614. **Memory per chat** - Chat-scoped notes.
615. **Memory summary** - "Here's what I know about you".
616. **Smarter memory selection** - Pick relevant memories, not just the last three.
617. **Embedding search** - Small embedding model for memory lookup.
618. **Context visualizer** - See exactly what the model receives.
619. **Pin a message to context** - Always include a key message.
620. **Exclude a message** - Leave a message out of context.
621. **Context reset** - Start fresh without a new chat.
622. **Context overflow warning** - Tell when old turns are dropped.
623. **Auto-summarize dropped turns** - Keep their gist.
624. **Document memory** - Remember attached files across chats.
625. **Knowledge base** - Upload docs the model can always search.
626. **Local RAG index** - IndexedDB vector store.
627. **Cite memory sources** - Show which file an answer used.
628. **Memory onboarding** - Explain memory on first use.
629. **Memory sync** - Across devices for logged-in users.
630. **Memory conflict detection** - Flag contradictions.
631. **Memory timeline** - When each memory was added.
632. **Memory confidence** - Mark uncertain memories.
633. **Memory review reminder** - Monthly review prompt.
634. **Memory for preferences only** - A lighter memory option.
635. **Name memory** - Always remember the user's name.
636. **Style memory** - Learn preferred answer style.
637. **Project memory** - Group memories by project.
638. **Memory shortcuts** - Keyboard shortcut to open memory.
639. **Memory in sidebar** - Quick peek panel.
640. **Memory badges in replies** - Small icon when memory was used.
641. **Bulk delete memories** - Select many to delete.
642. **Memory undo** - Undo a deletion.
643. **Memory compression** - Shrink memories to save tokens.
644. **Memory health check** - Find stale memories.
645. **Memory size per item** - Character limits shown.
646. **Memory templates** - "My job", "My goals" prompts.
647. **Memory from profile** - Use profile name and settings.
648. **Memory opt-in per chat** - Choose per conversation.
649. **Memory transparency log** - What was saved and when.
650. **Memory tests** - Unit tests for memory selection.

## 14. Files, images & attachments
651. **PDF reader in browser** - Extract PDF text locally.
652. **DOCX reader** - Read Word files locally.
653. **Spreadsheet summary** - Summarize CSV/XLSX columns.
654. **Chart from spreadsheet** - Plot uploaded data.
655. **Folder tree view** - Show attached folder structure.
656. **Code project Q&A** - Ask about an attached repo.
657. **File size limits shown** - Before upload, not after.
658. **Upload progress** - For big files.
659. **Attachment search** - Find text in attached files.
660. **Attachment reuse** - Attach a file from a previous chat.
661. **Image captioning** - Small vision model for image descriptions.
662. **OCR** - Read text from images with Tesseract.js.
663. **Screenshot explain** - Paste a screenshot and ask about it.
664. **Image crop before send** - Simple crop tool.
665. **Image compression** - Shrink images before storing.
666. **HEIC support** - Convert iPhone photos.
667. **Audio transcription** - Whisper in the browser.
668. **Video frames** - Pull key frames from a video.
669. **Drag from chat to desktop** - Drag generated images out.
670. **Image gallery** - All images from your chats in one place.
671. **Image variations** - "Make another like this".
672. **Image editing prompts** - Describe changes to an image.
673. **Background removal** - In-browser model.
674. **Image upscaling** - In-browser upscaler.
675. **Meme maker** - Add captions to images.
676. **Sticker maker** - Turn images into stickers.
677. **Attachment privacy note** - "Files stay on your device".
678. **Attachment token cost** - Show how much context a file uses.
679. **Excerpt preview** - Show which parts of a file were sent.
680. **Multiple file compare** - Compare two documents.
681. **Diff two files** - Show differences.
682. **JSON viewer** - Pretty tree for JSON files.
683. **CSV table view** - Interactive table for CSVs.
684. **Markdown file preview** - Render attached markdown.
685. **Code file syntax view** - Highlighted preview.
686. **Notebook reader** - Read .ipynb cells.
687. **Zip upload** - Read zip contents.
688. **URL attach** - Paste a URL to read its text (via CORS proxy).
689. **YouTube transcript** - Summarize videos where possible.
690. **Attachment chips color** - Color by file type.
691. **File type icons** - Recognizable icons.
692. **Attachment remove undo** - Undo removing a chip.
693. **Max files warning** - Friendly limit messages.
694. **Persist attachments** - Keep them with the chat in IndexedDB.
695. **Attachment export** - Include files in chat export.
696. **Image to text prompt** - Describe an image as a prompt.
697. **Diagram reader** - Explain flowcharts.
698. **Handwriting OCR** - Read notes.
699. **Math from photo** - Read equations from images.
700. **Receipt splitter** - Split a bill from a receipt photo.

## 15. Beta Lab & accounts
701. **Beta badge on profile** - Show Beta status clearly.
702. **Beta expiry countdown** - Days left of access.
703. **Beta feature list** - What Beta unlocks, in-app.
704. **Beta feedback button** - Quick feedback form.
705. **Beta changelog** - What's new for beta users.
706. **Waitlist position** - Show place in line.
707. **Invite codes** - Beta users invite friends.
708. **Beta request status emails** - Notify on approval.
709. **Admin dashboard polish** - Blue theme for admin.
710. **Bulk approvals** - Approve many requests at once.
711. **Approval notes** - Admin notes per request.
712. **Usage stats per user** - For admins.
713. **Magic link login** - Passwordless sign-in.
714. **Google sign-in** - OAuth via Supabase.
715. **GitHub sign-in** - For developers.
716. **Account deletion** - Self-serve delete.
717. **Data export** - Download all account data.
718. **Profile banner** - Personal touch.
719. **Username uniqueness** - Check availability live.
720. **Password strength meter** - During sign-up.
721. **Email verification banner** - Remind unverified users.
722. **Session list** - See and revoke devices.
723. **Two-factor auth** - Optional 2FA.
724. **Guest to account migration** - Keep chats when signing up.
725. **Tier comparison table** - Guest vs free vs beta.
726. **Daily limit explainer** - Why limits exist.
727. **Limit reset countdown** - Time until messages refill.
728. **Unlimited local model** - No limits for the on-device model.
729. **Owner badge** - Special badge for the owner account.
730. **Beta Lab theme** - A unique accent for beta users.
731. **Beta experiments toggle** - Choose which experiments to try.
732. **Beta bug reporter** - Attach chat context to bug reports.
733. **Beta Discord link** - Community for testers.
734. **Beta survey** - Short monthly survey.
735. **Beta leaderboard** - Most helpful testers.
736. **Account avatar crop** - Crop profile photos.
737. **Account color** - Pick an avatar color.
738. **Account stats** - Messages sent, chats created.
739. **Account achievements** - Fun milestones.
740. **Login rate limiting** - Protect against brute force.
741. **Clear auth errors** - Friendly messages for each failure.
742. **Remember me** - Stay signed in toggle.
743. **Sign-out everywhere** - Revoke all sessions.
744. **Supabase RLS review** - Double-check row security.
745. **Account recovery flow polish** - Smoother reset.
746. **Profile privacy** - Control what's stored.
747. **Beta access audit log** - Who approved what.
748. **Expired beta handling** - Gentle downgrade message.
749. **Re-request beta** - Easy renewal.
750. **Beta onboarding tour** - Show new powers.

## 16. Privacy & security
751. **Privacy page** - Plain-language privacy policy.
752. **On-device badge** - "Runs on your device" label.
753. **Network activity panel** - Show every request made.
754. **No-tracking promise** - Remove any analytics, or make it opt-in.
755. **Visitor counter opt-out** - Respect Do Not Track.
756. **CSP header via meta** - Content-Security-Policy on Pages.
757. **Frame protection** - frame-ancestors via meta where possible.
758. **SRI hashes** - Lock CDN files.
759. **Sanitizer tests** - Fuzz markdown rendering.
760. **Link rel noopener** - On all external links.
761. **Secret scan** - CI check for keys in code.
762. **Owner email out of code** - Move role emails to the database.
763. **Supabase key scope** - Confirm the publishable key is limited.
764. **Encrypted local chats** - Optional passphrase encryption.
765. **Auto-lock** - Lock after inactivity.
766. **Clear on close** - Option to wipe chats when closing.
767. **Incognito chat** - Never saved, never synced.
768. **Export encryption** - Password-protect exports.
769. **Dependency audit** - Check vendored WebLLM version.
770. **Vendor update process** - How to update web-llm safely.
771. **Prompt injection warnings** - When files contain instructions.
772. **File content isolation** - Mark file text as data in prompts.
773. **Safe HTML preview** - Sandboxed iframes only.
774. **Clipboard permissions** - Ask before reading clipboard.
775. **Microphone indicator** - Clear when listening.
776. **Notification permission timing** - Ask only when needed.
777. **Storage permission explain** - Why persistent storage is requested.
778. **Security.txt** - Contact for vulnerability reports.
779. **Bug bounty page** - Thank-you list for reporters.
780. **Account lockout** - After repeated failed logins.
781. **Rate limit Supabase calls** - Prevent abuse.
782. **Abuse reporting** - Report bad content.
783. **Content filter option** - Family-safe filter setting.
784. **Kids mode** - Extra safe defaults.
785. **Data retention settings** - Auto-delete old chats.
786. **Privacy dashboard** - All privacy controls in one place.
787. **Third-party list** - Which CDNs are used.
788. **Self-host fonts** - Avoid third-party requests.
789. **Self-host KaTeX/highlight** - Fewer external calls.
790. **Offline-only mode** - Block all network after model load.
791. **Telemetry-free badge** - Promise in footer.
792. **Delete model data** - Remove all cached weights.
793. **Shared device warning** - Remind to log out.
794. **Privacy-preserving counter** - Count visitors without identifiers.
795. **Secure headers check** - Run a headers scanner.
796. **Signed releases** - Tag releases with notes.
797. **Supabase backups** - Regular backups for accounts.
798. **Access review** - Periodically review admin access.
799. **Threat model doc** - List main risks.
800. **Security tests in CI** - Basic XSS regression tests.

## 17. Personality: smart, funny, slightly unhinged
801. **Unhinged toggle** - A fun personality switch without bringing back modes.
802. **Easter egg commands** - Hidden slash commands.
803. **Konami code** - Unlocks a secret theme.
804. **Random fun fact** - On the landing screen.
805. **Daily joke** - A joke of the day chip.
806. **Witty loading lines** - "Teaching the model to think..." while loading.
807. **Funny error messages** - Light humor on failures.
808. **Mood ring logo** - Logo color shifts with chat tone.
809. **AUI sticker pack** - Downloadable stickers.
810. **Roast mode** - Gentle roasts on request.
811. **Pun generator** - Puns about anything.
812. **Fortune cookie** - Random fortunes.
813. **Rubber duck** - A duck that listens to your bugs.
814. **Plot twist button** - Add a twist to stories.
815. **Explain it badly** - Intentionally silly explanations.
816. **Wrong answers only** - Like the /smarter skill, in the app.
817. **Haiku replies** - Answer in haiku.
818. **Pirate speak** - Arr.
819. **Shakespeare mode** - Old English replies.
820. **Emoji-only reply** - For fun.
821. **Dice roller** - Quick random tools.
822. **Coin flip** - Decide for you.
823. **Would you rather** - Game prompts.
824. **Twenty questions** - The model guesses your object.
825. **Riddle of the day** - With hints.
826. **Trivia quiz** - Multiple choice.
827. **Story dice** - Random story prompts.
828. **Character creator** - Generate fictional characters.
829. **Name generator** - Names for pets, projects, bands.
830. **Compliment button** - Instant encouragement.
831. **Motivation mode** - Coach-style replies.
832. **Chaos button** - One random surprise.
833. **AUI mascot** - A small animated character.
834. **Mascot reactions** - Mascot reacts to messages.
835. **Achievement toasts** - "First code block!"
836. **Streaks** - Days in a row chatting.
837. **Secret themes** - Unlock themes by using features.
838. **April Fools mode** - Annual joke UI.
839. **Holiday greetings** - Special landing text.
840. **Birthday surprise** - If you tell AUI your birthday.
841. **Sound effects pack** - Optional silly sounds.
842. **Typewriter mode** - Retro typing effect.
843. **Terminal theme** - Green-on-black hacker look.
844. **Retro 90s theme** - Comic Sans, for fun.
845. **Vaporwave theme** - Pink and teal.
846. **Matrix rain** - Easter egg background.
847. **Fake "thinking" quotes** - Show silly inner thoughts while loading.
848. **AUI diary** - The model writes a daily diary.
849. **Self-aware jokes** - Jokes about being a 1B model.
850. **Personality presets** - Calm, hype, sarcastic, wise.

## 18. Growth & marketing
851. **Landing page** - Explain "private AI in your browser".
852. **Demo GIF** - Show AUI in action on the landing page.
853. **Comparison page** - AUI vs cloud chatbots.
854. **"No account needed" message** - Highlight easy start.
855. **"Works offline" message** - Unique selling point.
856. **Share chat links** - Public read-only links (via Supabase).
857. **Social share cards** - Pretty OG images per shared chat.
858. **Product Hunt launch** - Plan a launch day.
859. **Reddit posts** - Share in WebGPU and local-LLM communities.
860. **Hacker News Show HN** - Post the in-browser angle.
861. **Blog** - Posts on building AUI.
862. **Changelog posts** - Regular updates.
863. **Newsletter** - Monthly news.
864. **Referral rewards** - Extra limits for invites.
865. **Testimonials** - Quotes from users.
866. **Usage counter** - "X chats run privately today".
867. **SEO titles** - Better page titles and descriptions.
868. **Keywords** - "free private AI chat in browser".
869. **YouTube walkthrough** - Short tutorial.
870. **TikTok clips** - Funny AUI moments.
871. **Embed widget** - Put AUI on other sites.
872. **Bookmarklet** - Ask AUI about any page.
873. **Browser extension** - AUI in a side panel.
874. **Desktop app wrapper** - Tauri or Electron build.
875. **School outreach** - Private AI for students.
876. **Teacher guide** - How to use AUI in class.
877. **Open source the code** - Build trust and contributors.
878. **Contributor guide** - CONTRIBUTING.md.
879. **GitHub stars badge** - Social proof.
880. **Showcase page** - Cool things people made.
881. **Prompt contests** - Monthly challenges.
882. **Community prompts** - Shared prompt library.
883. **Localization** - Hebrew and Spanish UIs to grow reach.
884. **Press kit** - Logos and screenshots.
885. **Analytics-free metrics** - Count stars and shares instead.
886. **Feedback widget** - Quick "How's AUI?" prompt.
887. **NPS survey** - Occasional rating.
888. **User interviews** - Talk to five users.
889. **Roadmap page** - Public roadmap with voting.
890. **Feature voting** - Let users pick next features.
891. **Waitlist for big features** - Build anticipation.
892. **Mascot marketing** - Use the mascot everywhere.
893. **Brand voice guide** - Smart, funny, slightly unhinged.
894. **Tagline tests** - Try new taglines.
895. **Hero video** - 10-second loop.
896. **App store via PWA** - List in Microsoft Store via PWABuilder.
897. **Google Play TWA** - Android listing.
898. **Partnerships** - With coding bootcamps.
899. **Hackathon sponsor** - Small prizes for AUI hacks.
900. **Case studies** - How people use AUI.

## 19. Developer quality & testing
901. **Visual regression tests** - Screenshot tests for the theme.
902. **Playwright end-to-end** - Send a message, see a reply (mocked model).
903. **Mock SLM** - Fake engine for fast UI tests.
904. **CSS lint** - Catch duplicate and dead rules.
905. **ESLint** - Basic lint rules.
906. **Prettier** - Consistent formatting.
907. **Type checking with JSDoc** - Light type safety.
908. **Module boundaries doc** - Document which file owns which feature.
909. **State module** - One place for app state.
910. **Event bus** - Decouple features.
911. **Settings schema** - Validate settings on load.
912. **Migration system** - Upgrade stored data between versions.
913. **Error boundary** - Catch init failures gracefully.
914. **Error reporting opt-in** - Send crash reports with consent.
915. **Performance budget** - Fail CI if bundle grows too much.
916. **Bundle size report** - Track JS and CSS sizes.
917. **Dependency pinning** - Pin all CDN versions.
918. **Automated version bump** - Build script updates ?v= values.
919. **Release script** - One command to release.
920. **Pre-commit hook** - Run tests before commits.
921. **Test coverage** - Track what's tested.
922. **Accessibility tests** - axe in Playwright.
923. **Cross-browser CI** - Chrome, Firefox, Safari.
924. **WebGPU CI runner** - Real model smoke test.
925. **Storybook-style gallery** - Every component on one page.
926. **Design QA checklist** - Before each release.
927. **Bug template** - GitHub issue templates.
928. **Feature template** - Structured feature requests.
929. **Docs folder** - Architecture notes.
930. **Code comments audit** - Explain tricky parts.
931. **Dead code removal** - Remove unused mode code fully.
932. **Remove /api client code** - Since Vercel is gone.
933. **Config file** - Central config for URLs and limits.
934. **Environment detection** - Know when on Pages vs local.
935. **Local test server** - Serve at /AUI/ locally.
936. **Hot reload** - Faster local development.
937. **Feature flags module** - Toggle experiments cleanly.
938. **Logging levels** - Quiet in production.
939. **Debug panel** - Hidden panel with state.
940. **Supabase local dev** - Run Supabase locally.
941. **SQL migrations folder** - Ordered migrations.
942. **Schema docs** - Document tables.
943. **Seed data** - Test accounts.
944. **Fuzz tests** - Random input to the markdown renderer.
945. **Load tests** - Huge chats in tests.
946. **Memory leak checks** - Long sessions in tests.
947. **Service worker tests** - Update flow tests.
948. **Offline tests** - Simulate network loss.
949. **Theme tests** - Every theme renders.
950. **BUGS.md log** - Track fixed bugs by date.

## 20. Wild ideas, mashups & opposites
951. **Two AUIs debate** - Two local models argue, you judge.
952. **AUI council** - Three personas vote on an answer.
953. **Peer-to-peer chat sharing** - WebRTC share without servers.
954. **Multiplayer chat** - Friends join one conversation.
955. **AUI plays chess** - Chess board in chat.
956. **Code canvas** - Side-by-side editor like ChatGPT Canvas.
957. **Document canvas** - Co-write documents with AUI.
958. **Whiteboard** - Draw and ask about drawings.
959. **Voice-only mode** - Full hands-free conversation.
960. **AUI phone call** - Talk to AUI like a call.
961. **AR mode** - Point your camera and ask.
962. **Smartwatch companion** - Quick questions from the wrist.
963. **Car mode** - Big buttons and voice.
964. **TV mode** - Lean-back big text.
965. **Kids version** - Cartoon UI and safe model.
966. **Elder-friendly mode** - Extra large and simple.
967. **AUI for terminals** - CLI version using the same model.
968. **VS Code extension** - AUI inside the editor.
969. **Opposite: no chat** - A single-question oracle page.
970. **Opposite: no AI** - Answers from a curated FAQ only.
971. **Opposite: slow mode** - Thoughtful replies that take longer.
972. **Opposite: tiny screen** - A 200px widget version.
973. **Opposite: light-only brutalist** - Plain black text on white.
974. **Mashup: AUI + Notion** - Notes with an AI sidebar.
975. **Mashup: AUI + Duolingo** - Language practice with streaks.
976. **Mashup: AUI + Spotify** - Mood playlists from chat tone.
977. **Mashup: AUI + calendar** - Plan your day locally.
978. **Mashup: AUI + todo list** - Turn replies into tasks.
979. **Mashup: AUI + flashcards** - Spaced repetition.
980. **Mashup: AUI + journal** - Private daily journal with reflections.
981. **Mashup: AUI + game** - Text adventure engine.
982. **Mashup: AUI + IDE** - Run code it writes.
983. **Train your own mini model** - Fine-tune LoRA in the browser.
984. **Model marketplace** - Pick community models.
985. **Plugin system** - Third-party tools in the browser.
986. **Agent mode** - Multi-step tasks with tools.
987. **Scheduled prompts** - Daily briefing generated locally.
988. **Time capsule** - Messages to your future self.
989. **Dream journal** - Interpret dreams for fun.
990. **AUI radio** - Read the news aloud (with a news API).
991. **Generative UI** - Model builds small widgets in replies.
992. **Emotion detection** - Adjust tone if you seem stressed.
993. **Focus music** - Built-in lo-fi player.
994. **Pomodoro + AI** - Study sessions with check-ins.
995. **Offline encyclopedia** - Ship a compressed Wikipedia subset.
996. **Local search engine** - Index your files privately.
997. **Federated memory** - Share memories between your devices P2P.
998. **AUI OS** - A full desktop-like web shell.
999. **Holographic AUI** - 3D mascot with WebGL.
1000. **AUI writes AUI** - The model suggests its own UI improvements.

---

## Build log
Ideas marked here were built. "Skipped" means the idea contradicts another, needs an outside account or service, or needs a person (interviews, launches).

### Batch 1 - top 10
Built: 67 (thumbs feedback added to the existing action row), 141, 151, 284 (plus 347 first-word time), 301, 308, 312, 319, 320, 344, 400, 414.
Skipped: 409 (needs the GitHub environment setting changed by the repo owner).

### Batch 2 - category 1 (quick wins)
Built: 4, 5, 6, 8, 9, 10, 11, 12, 16, 17, 18, 19, 21, 23, 24, 25, 26, 27, 28, 29, 32, 33, 34, 35, 36, 37, 38, 39 (pages share the new theme), 40, 41, 42, 44, 45, 46, 47, 48, 49, 50.
Already in AUI: 1, 2, 3, 7, 13, 14, 15, 20, 22, 30, 31, 43.

### Batch 3 - category 2 (ChatGPT-style layout)
Built: 52, 54, 56, 57, 61, 64, 65, 68, 71, 74, 76, 77, 78, 79, 80, 83, 84, 85, 86, 87, 88, 89, 92, 93, 95, 96, 97, 98, 99, 100.
Already in AUI: 51, 53, 55, 58, 59, 60, 62, 63, 66, 67, 69, 70, 72, 73, 75, 81, 82, 90, 94.
Not applicable: 91 (web search is off on GitHub Pages).

### Batch 4 - category 3 (blue theme & visual design)
Built: 101, 102, 104, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116 (Atkinson Hyperlegible as the readable font), 117, 118, 119, 120, 121, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 136, 138, 140, 143, 144, 145, 148, 149, 150.
Already in AUI: 103, 105, 122, 133, 134, 135, 139, 141, 147.
Skipped: 137 (conflicts with 81, always-dark code blocks), 142 (splitting the stylesheet adds requests and slows loading), 146 (chats load instantly from the browser, so there is no wait to cover).

### Batch 5 - category 4 (sidebar & chat history)
Built: 153, 154, 155, 156, 157, 159, 160, 161, 162, 164, 165, 166, 167, 168, 169, 171, 172, 173, 174, 175, 176, 179, 181, 182, 184, 186, 187, 190, 191, 192, 193, 194, 196, 197, 199 (a PIN screen; chats stay unencrypted in the browser), 200.
Already in AUI: 151, 152, 158, 163, 170, 177, 178, 180, 183, 185, 188, 189, 198.
Skipped: 195 (hiding the sidebar on a first visit conflicts with 166's always-available rail and makes chats harder to find).

### Batch 6 - category 5 (composer & input)
Built: 201, 202 (/save plus templates), 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 221 (rotating placeholder hint), 222, 225, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 239, 241, 244, 245, 246, 249, 250.
Already in AUI: 220, 223, 224, 226, 238, 248.
Not applicable: 240 (only a few tools remain), 242, 243 (web search and image generation are off on GitHub Pages).
Skipped: 247 (conflicts with 51 and 52: the composer starts centered and drops down on send).

### Batch 7 - category 6 (message rendering & Markdown)
Built: 251, 253, 254, 256, 257, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 273, 274, 276, 277, 278, 281, 285, 288 (checked in a headless browser: injected script and onerror payloads do not run), 291, 292, 293, 295, 296.
Already in AUI: 255, 258, 272, 275, 279, 280, 283, 284, 286, 287, 289, 294, 297, 298, 299, 300.
Skipped: 252 (holding back text the model already wrote makes replies feel slower), 282 (side-by-side needs two models in GPU memory at once, too much for most devices), 290 (off-screen messages already skip rendering; full virtual scrolling would break find-in-page and message links).

### Batch 8 - category 7 (model speed & performance)
Built: 304, 305, 306, 307, 309, 310, 311, 313, 315, 316, 317, 318, 321, 322, 324, 329, 332, 334, 337, 340, 348, 350.
Already in AUI: 301, 308, 312, 314, 319, 320, 323, 325 (GitHub Pages gzips the engine: 6 MB down to 2 MB), 327, 328, 330 (unfinished code blocks aren't highlighted, see 253), 335, 336, 339, 343, 344, 345, 347, 349.
Skipped: 302 and 303 (browsers stop idle service workers after about 30 seconds, and the engine can't share one model across tabs), 326 (preloading the engine for every visitor undoes 324), 331 (the stylesheet is one cached file; inlining would resend it on every page), 333 (splitting the 6,000-line app risks breaking features for little gain once it's cached), 338 (moving saved chats to IndexedDB needs a careful migration to avoid losing data; best as its own project), 341 (the engine doesn't support speculative decoding), 342 (only 4-bit builds exist for these models), 346 (a CPU fallback needs a second engine and model download and would manage only 1 to 3 words a second).

### Batch 9 - category 8 (answer quality & tools)
Built: 352, 353, 354 (math goes through the calculator), 355, 356, 357, 358, 359, 360, 361 (359 to 361 are behind an "Online lookups" switch, off by default), 363, 364, 365, 369, 370, 371, 373, 375, 376, 377, 378 (ratings shown in Model stats), 380, 381, 382 to 396 and 398 (as one-click prompt presets in Explore, since modes were removed), 397 (/timer).
Already in AUI: 362 (the Run button from 257), 366 (the engine stops at end-of-turn tokens), 367 (184), 368 (233's follow-up chips), 374, 399, 400.
Skipped: 351 (example conversations lengthen every prompt and undo 305's speedup), 372 (needs testing the model on a real WebGPU device), 379 (one person's ratings are too few to compare prompts).

### Batch 10 - category 9 (offline, installable app & GitHub Pages)
Built: 401, 402 (formatting libraries are now cached for offline use), 404, 405, 406, 411, 412, 413, 423, 426, 427, 428, 429, 430, 432, 433, 434, 436, 438, 439, 440, 442, 444, 446, 447, 448.
Bug fixed along the way: the service worker deleted every other cache on each update, including the downloaded model, so every site update forced a full model re-download. It now only removes its own old caches (covered by a new test).
Already in AUI: 403, 408, 414, 415 (Wikipedia lookups, 359), 417, 418, 420, 421, 422, 425, 431, 435, 437, 441, 443 (the build has nothing to cache), 449.
Skipped: 407 (needs a domain and DNS access), 409 and 445 (need the GitHub environment setting changed by the repo owner), 410 (Pages hosts one site per repo, so branch previews would replace the live site), 416 (in-browser image models are 1 to 2 GB and very slow), 419 (would bring back a server), 424 (robots.txt only works at the domain root, outside this repo), 450 (the workflow's link rewriting is tested and now link-checked; a second mechanism adds risk).

### Batch 11 - category 10 (accessibility)
Built: 451, 456, 457 (axe scan: 5 issues fixed, now 0 violations), 460, 462, 463 (Lexend), 464, 466, 469, 470, 471, 472, 473, 474 (no sideways scrolling at 320 px), 477, 480, 481, 482, 483, 486, 489, 492, 493, 495, 497, 498.
Already in AUI: 452, 453, 454, 455, 458, 459, 461, 465, 467, 468, 475, 478, 479, 484, 487, 488, 490, 491, 494, 496, 499.
Skipped: 476 (needs an image model the browser doesn't have), 485 (needs manual NVDA and VoiceOver testing), 500 (moved to a later batch with the CI work).
Bug fixed: batch 8 broke the Markdown module (a literal line break inside a string), so replies showed as plain text. The syntax test missed it because "node --check" passes typeless ES modules; the test now checks modules properly.

### Batch 12 - category 11 (mobile)
Built: 501 (bottom sheets for message actions and the tools menu), 502, 503 (swipe a message right to quote it), 504 (press and hold a message), 505, 508, 509, 510, 511, 512, 513, 515, 516, 518 (tablets in landscape keep the chat list visible), 520 (Back closes the top sheet, dialog or sidebar), 523, 525, 526, 527, 529, 531, 532, 533, 534, 535 (pull the top bar down for a new chat), 537, 538, 539, 542 ("Select text" sheet), 548, 549 (QR code that carries the chat; nothing is uploaded). Also the accessibility statement page (486), which batch 11 listed but had not written.
Already in AUI: 506, 507, 514, 517, 519, 521, 522, 524, 528, 530, 536, 540, 541, 543, 544, 545, 546, 547.
Skipped: 550 (needs real iPhone, Pixel and budget Android devices; the gestures, sheets, Back button and tablet layout are checked in Chromium's phone and tablet emulation instead).

### Batch 13 - category 12 (settings & personalization)
Built: 551 (settings search), 552, 553, 554, 557, 558, 559, 560, 561 (Hebrew with right-to-left layout for the sidebar, composer and settings tabs; deeper dialogs are still English), 562, 564, 565 (notifications tab with per-event switches), 566, 567, 568, 569, 570, 571, 572 (settings profiles), 573, 576, 577, 580, 581, 584 (first-run setup), 586 and 587 (Labs tab), 588, 589, 591, 592, 593, 595 (reset one tab), 596 (links like chat/#settings/voice), 597 (built-in and saved styles), 598 (per-chat model), 599 (per-chat notes), 600 (quiet hours).
Already in AUI: 555 (the model speed is stored per browser), 556, 563 (turn off "Enter sends" for Ctrl/⌘ + Enter), 574 (signed-in sync already includes settings), 575 (shortcut labels already switch between ⌘ and Ctrl), 578, 579, 582, 583, 585, 590, 594.
Skipped: none.
Fixed along the way: the selected settings tab failed contrast in light mode (4.07:1), and replies written in English were laid out right to left in the Hebrew layout.

### Batch 14 - category 13 (memory & context)
Built: 601, 602, 603, 604 ("Remember that I…" or "remember: …"), 605 ("forget that", "forget my job"), 606, 607, 608 (AUI files, or plain text with one memory per line), 609, 610, 611, 612, 615, 616 (memories are picked per message by word overlap, with preferences always included), 618 (/context shows exactly what the model reads), 619, 620, 621 (/reset), 622, 624, 625, 626 (knowledge files in IndexedDB with a keyword index), 627, 628, 630, 632, 633, 634 (by default only confirmed facts are saved, not every exchange), 636, 637, 638 (Ctrl/⌘ + Shift + M), 639, 640, 641, 642, 643, 644, 645, 646, 648, 649, 650 (unit tests for memory selection and the remember/forget commands).
Already in AUI: 613 (the Memory switch), 614 (per-chat notes from 599), 623, 629, 631, 635 and 647 (the name from 552).
Skipped: 617 (an embedding model would be a second download of 100 MB or more and compete with the chat model for GPU memory; keyword scoring is used instead).
Also changed: memories now travel with each message instead of the system prompt, so the prompt stays identical and the engine keeps reusing its cached work.
Bug fixed along the way: merging memories from a signed-in account removed duplicates by the old snippet field, which would have kept only one of the new facts.

### Batch 15 - category 14 (files, images & attachments)
Built: 651 (PDF text with pdf.js), 653 (exact column summaries for CSV and spreadsheets), 654, 655, 657, 659, 660 (recent files kept in IndexedDB), 661 (image captions with a small vision model), 662 and 663 (OCR with Tesseract), 664, 666 (HEIC to JPEG), 667 (Whisper tiny, on the CPU), 668 (key frames from videos), 669, 670, 673, 674 (pictures up to 320 px; bigger ones run out of memory in the browser), 675, 676, 677, 678, 679, 680, 681, 682, 683, 684, 685, 686, 687 (zip files open like folders), 690, 692, 694, 695, 696, 697 (diagrams: their text and a short caption; AUI can't follow arrows), 698 (OCR; handwriting accuracy is low), 699 (printed equations through OCR), 700 (receipt splitter).
Already in AUI: 652, 656, 658, 665, 691, 693.
Skipped: 671 and 672 (image generation needs the image server, which isn't part of the GitHub Pages site), 688 (reading any web page needs a CORS proxy service), 689 (YouTube transcripts need a server or proxy).
Checked in Chromium with real files: PDF text, CSV table and chart, JSON tree, notebook, zip tree, file diff, OCR on a receipt, captions, background removal, upscaling and an audio transcript.

### Batch 16 - category 15 (Beta Lab & accounts)
Built: 702 (days left), 704 and 732 (feedback and bug reports with optional chat context, sent through your email app or a GitHub issue), 706, 707, 710 (bulk approve or decline in the admin dashboard), 713 (email sign-in link), 714 and 715 (Google and GitHub buttons), 716, 717, 718, 719, 720, 721, 723 (two-factor with an authenticator app), 725, 728 (no daily message cap: replies come from the on-device model), 730, 736, 737, 738, 739 (10 achievements), 740, 741, 742, 743, 744, 745 (strength meter and plain-language errors in the reset flow too), 746 (choose whether chats and memories sync), 748, 749, 750.
Needs the owner: 706, 707, 716, 719 and the 744 fixes need supabase/account_extras.sql run once in the Supabase SQL Editor. 714 and 715 need the Google and GitHub providers turned on in Supabase; until then the buttons explain that.
Already in AUI: 701, 703, 705, 709, 711, 724, 729, 731, 747.
Skipped: 708 (emails need a server or an email service), 712 (needs usage collected on a server; each account's chats are private), 722 (Supabase has no browser API to list sessions), 726 and 727 (no daily limit is left to explain or count down after 728), 733 (needs a Discord server), 734 (needs somewhere to collect the answers), 735 (needs data about testers that AUI doesn't collect).
Bug fixed along the way: the chat and the Beta page asked /api/beta-status, a Vercel function that no longer exists, so Beta status never loaded on GitHub Pages. Both now read the account's own approved requests from Supabase directly.
Security review (744): the user_data update policy had no "with check", so a signed-in user could move their row onto another account's id; staff powers relied only on the email claim in the token. account_extras.sql fixes both.

### Batch 17 - category 16 (privacy & security)
Built: Content Security Policy on the chat, Beta and home pages with no inline scripts or handlers (756); markdown, highlighting, math and fonts vendored with a README for updating them (770, 789); passphrase vault with AES-GCM and PBKDF2, auto-lock and clear-on-close; retention; network panel; prompt-injection labelling of file text (772); privacy.html, security.html, .well-known/security.txt and SECURITY.md with a threat model (799) and a quarterly access review (798); CI checks for committed secrets, links that open new tabs without noopener, and a newer WebLLM (760, 761, 769); a browser check that renders 20 XSS payloads (759, 800); a live-site check (795).
Decision: the XSS check no longer fails on a bare `<form>`. The sanitizer still lets forms through (a change to forbid them was declined); the CSP's `form-action 'self'` stops a form posting elsewhere, and a `javascript:` action or any handler still fails the check.
Still open: 500 (accessibility check in CI) needs a browser with the page served in CI; it is left out of the deploy job to keep deploys fast.

### Batch 18 - home page, desktop app, Google sign-in, plans and skills (asked for directly)
Home page: `/` is now a landing page (hero, privacy, skills, plans, desktop app, footer) with real screenshots of the app, light and dark, no inline script or style, entrances that stay visible without script. Sign-in, invite and recovery links that still land on `/` are passed to the chat.
Google sign-in: already enabled in this project's Supabase (the auth settings list `google: true`; GitHub is off, so its button was removed). The auth dialog now leads with a Google button, `/chat/?auth=google` starts it directly, and the home page links to it.
Plans (Free, Plus, Pro): a demo checkout that takes no money. The card number, expiry and security code are checked in the browser (network prefix, length, Luhn checksum, not expired, 3 or 4 digit code); only the brand and last four digits are kept, in settings. Plans change the number of custom skills (3, 15, unlimited) and nothing about the model.
Skills: 12 built in plus custom ones. On for one chat or always on, switched from a dialog, a chip row above the message box or `/name` in the composer. Import and export as SKILL.md. Instructions join the system prompt within a size budget. Found and fixed along the way: a chat's own skills were dropped when the app reloaded.
Desktop app: `desktop/` is an Electron shell around the website (no Node access for the page, links open in the browser, offline page, window size remembered, Google sign-in works because the user agent drops "Electron"). Checked in a real Electron window. `.github/workflows/desktop.yml` builds Windows, macOS and Linux installers when a `desktop-v*` tag is pushed.
Needs the owner: push the tag `desktop-v1.0.0` to build the installers (the home page's download button points at the latest release). Installers are unsigned, so Windows SmartScreen and macOS Gatekeeper warn on first launch. Not verified here: the installer builds themselves, and Google sign-in inside the desktop window.

### Batch 19 - Homework Helper (online skill, asked for directly)
Homework Helper is a built-in skill ported from the owner's own Homework Helper skill: it asks age, grade and subject first, answers only from what the student says, guides essays through Open, Converse and Analyze without writing the graded piece, and guides math to a solo review problem. It is the one online skill: while it is on for a chat, replies come from OpenRouter with the owner's key, not from the on-device model.
The key is typed into a dialog (Skills, Homework Helper, Add your key) and saved only in this browser under its own storage name: not in the synced settings, not in the data download, not in the encrypted vault. Online chats skip the calculator, lookups, knowledge notes and memories, so nothing is sent that the student didn't type in the chat, and the on-device model is never loaded (no model download, no on-device titles). Offline-only mode blocks it. The privacy page lists openrouter.ai.
Needs the owner: an OpenRouter key (openrouter.ai/keys) with a spending limit. Not verified here: a real OpenRouter reply (the checks used a mock server).

### Batch 20 - OpenRouter key for the whole app (asked for directly)
The OpenRouter key is now the engine for every reply, not only the Homework Helper. Default engine is the key; Settings, Model, AI engine switches to the small model on the device. With the key engine on, nothing on-device is loaded (no model download, no warm-up, no preload button, no WebGPU warning), titles stay first-message titles, and tl;dr and the prompt improver go through the key. Without a key the first send opens the key dialog, which also offers the on-device model. Homework Helper still forces the key.
Copy corrected so no page claims chats never leave the device: home page, privacy, security, help, the footer badge and the settings blurb. Found by tracing requests: typing in the message box warmed the on-device model even with the key engine on; fixed.
Desktop app: it is the website in a window, so it uses the same engine; the key is entered once in the app (its storage is separate from the browser's).

### Batch 21 - guests need no key (asked for directly)
The default engine is now decided by whether a key exists: no key means the on-device model (no dialog, no prompt, works at once); adding a key in Settings, Model, or the key dialog switches the whole app to OpenRouter; removing it switches back. Settings, Model, AI engine can force either. Homework Helper still needs a key and asks for it. Home, privacy, security and help copy changed back to match: private on-device by default, OpenRouter only with the visitor's own key.
Declined by the owner: a server-side proxy holding the owner's key (the only safe way to give guests an online model without their own key). A key placed in the site's files would be public and was not done.

### Batch 22 - free models (owner is out of OpenRouter credits)
The default model is now `openrouter/free`, OpenRouter's router over its free models (listed live on openrouter.ai/api/v1/models), so a key with no credits still answers. If a paid model returns 402 (out of credits), AUI retries once on the free router and tells the user. Free models have daily limits that OpenRouter sets.
