/* api_handler_fixed.js
   ES Module refactor and fixes for original api_handler.js
   - Uses safe DOM helpers, safe fetch wrapper, and avoids implicit globals
   - Replaces GET-with-body with POST or query params
   - Avoids innerHTML for untrusted content; uses textContent or sanitized building
   - Adds retry-limited verifyPayment
   - Uses dataset indexes for cart items to avoid mismatch
   - Provides exported default initAllEndpoints()

   NOTE: This file preserves original function names and external constants
   like MAIN_SERVER and JSON_HEAD, but expects them to be imported or defined
   in the environment that imports this module.
*/

// ----- Configuration & utilities -----
// Expect MAIN_SERVER, JSON_HEAD, and utility functions to be provided globally
// or imported by the application. If not present, fallbacks are used where safe.
 import { MAIN_SERVER } from './index.js'
 import { JSON_HEAD } from './index.js'

const DEFAULT_RETRY_LIMIT = 6;


// Safe query helpers
export function q(selector, parent = document) {
  return parent.querySelector(selector);
}
export function qa(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

export function safeText(parent, selector, text) {
  const el = q(selector, parent);
  if (el) el.textContent = text == null ? '' : String(text);
}

export function safeSetHTML(el, html) {
  // Only use when html is produced by trusted templates. Otherwise, prefer
  // building nodes or setting textContent.
  if (!el) return;
  el.innerHTML = html;
}

export function createEl(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  for (const c of children) {
    if (typeof c === 'string') el.appendChild(document.createTextNode(c));
    else if (c instanceof Node) el.appendChild(c);
  }
  return el;
}

// Safe JSON localStorage
export function safeGetJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn('safeGetJSON parse failed', key, err);
    return fallback;
  }
}
export function safeSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('safeSetJSON failed', key, err);
  }
}

// Build WebSocket URL reliably
export function makeWsUrl(baseUrl) {
  if (!baseUrl) throw new Error('makeWsUrl: baseUrl required');
  if (baseUrl.startsWith('https://')) return 'wss://' + baseUrl.slice(8);
  if (baseUrl.startsWith('http://')) return 'ws://' + baseUrl.slice(7);
  // If user passed a ws/wss url, return as-is
  if (baseUrl.startsWith('ws://') || baseUrl.startsWith('wss://')) return baseUrl;
  throw new Error('MAIN_SERVER must include http(s) or ws(s) protocol');
}

// Small helper to check fetch responses
async function parseJsonSafe(resp) {
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    // Return the raw text under a property to preserve message
    return { __raw: text, __status: resp.status };
  }
}

// Fetch wrapper: respects credentials and throws on non-2xx
export async function safeFetch(url, opts = {}) {
  const cfg = Object.assign({ credentials: 'include' }, opts);
  const resp = await fetch(url, cfg)
  if (!resp.ok) {
    const body = await parseJsonSafe(resp);
    const err = new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    err.status = resp.status;
    err.body = body;
    throw err.message;
  }
  return resp;
}

// POST JSON helper
export async function postJson(url, data = {}, headers = JSON_HEAD) {
  const resp = await safeFetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return resp.json();
}

// GET with query params helper
export function buildUrlWithParams(url, params = {}) {
  const u = new URL(url, window.location.origin);
  Object.keys(params).forEach(k => {
    if (params[k] != null) u.searchParams.set(k, String(params[k]));
  });
  return u.toString();
}

// Safe runner that isolates failures
export function safeRun(fn, name) {
  try {
    if (typeof fn === 'function') return fn();
    console.warn('safeRun: not a function', name);
  } catch (err) {
    console.error('safeRun error', name || fn?.name || 'anonymous', err);
  }
}

// ----- Application logic (refactored) -----
// Important: keep functions exported if other modules import them

// Load explore posts (example usage)
export async function loadExplorePosts({ page = 1, size = 20 } = {}) {
  const url = buildUrlWithParams(`${MAIN_SERVER}/explore_posts`, { page, size });
  const resp = await safeFetch(url, { method: 'GET' });
  return resp.json();
}

// Fetch products (POST and REST GET)
export async function getProducts() {
  return postJson(`${MAIN_SERVER}/get_products`, {});
}
export async function getProductsRest() {
  const resp = await safeFetch(`${MAIN_SERVER}/products`, { method: 'GET' });
  return resp.json();
}

// Post a new order (mimics old post-orders)
export async function postOrder(orderData) {
  return postJson(`${MAIN_SERVER}/orders`, orderData);
}

// Get orders (mimics old get_orders)
export async function getOrders() {
  return postJson(`${MAIN_SERVER}/get_orders`, { id: localStorage.getItem('sokoni_identity') });
}

// Cart handling: stored in localStorage under 'sokoni_cart'
export function getCart() {
  return safeGetJSON('sokoni_cart', []);
}
export function setCart(cart) {
  safeSetJSON('sokoni_cart', cart || []);
}

export function applyCartData(containerSelector = '#cartList') {
  const cart = getCart();
  const container = q(containerSelector);
  if (!container) return;
  container.innerHTML = '';
  const frag = document.createDocumentFragment();
  cart.forEach((item, idx) => {
    const row = createEl('div', { class: 'cart-item', dataset: { index: idx } }, []);
    // Build safe DOM nodes instead of using innerHTML
    row.appendChild(createEl('span', { class: 'product-name' }, [item.product?.title || 'Unnamed']));
    row.appendChild(createEl('span', { class: 'product-qty' }, [String(item.amount || 0)]));
    // per-item actions
    const removeBtn = createEl('button', { class: 'remove', type: 'button' }, ['Remove']);
    removeBtn.addEventListener('click', () => {
      const current = getCart();
      current.splice(idx, 1);
      setCart(current);
      applyCartData(containerSelector);
    });
    row.appendChild(removeBtn);
    frag.appendChild(row);
  });
  container.appendChild(frag);
  updateTotal(containerSelector);
}

export function updateTotal(containerSelector = '#cartList', totalSelector = '#cartTotal') {
  const cart = getCart();
  const activeItems = qa('.selectToggle.active', q(containerSelector) || document);
  let total = 0;
  activeItems.forEach(btn => {
    const idx = Number(btn.dataset.index);
    const item = cart[idx];
    if (!item) return;
    const price = Number(item.product?.price || 0);
    total += price * (Number(item.amount) || 0);
  });
  const totalEl = q(totalSelector);
  if (totalEl) totalEl.textContent = formatMoneySafely(total);
}

export function formatMoneySafely(value) {
  try {
    const num = Number(value || 0);
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(num);
  } catch (err) {
    return String(value);
  }
}

// Payment verification with retry limit
export async function verifyPayment(data, btn = null, cartData = null, retries = DEFAULT_RETRY_LIMIT) {
  if (!data || !data.order) throw new Error('verifyPayment: missing order data');
  const url = `https://api.clickpesa.com/third-parties/payments/${encodeURIComponent(data.order)}`;
  try {
    const resp = await safeFetch(url, { method: 'GET', headers: { Authorization: data.token } });
    const arr = await resp.json();
    const status = arr?.[0]?.status || arr?.status || null;
    if (status === 'PROCESSING') {
      if (retries <= 0) {
        console.warn('verifyPayment: retries exhausted');
        if (btn) btn.classList?.remove('load');
        return { status: 'FAILED', reason: 'timeout' };
      }
      // schedule next check with delay
      await new Promise(r => setTimeout(r, 15000));
      return verifyPayment(data, btn, cartData, retries - 1);
    }
    // handle success vs failure
    if (status === 'SUCCESS' || status === 'COMPLETED' || status === 'PAID') {
      if (cartData) setCart([]); // clear cart on success
      if (btn) btn.classList?.remove('load');
      return { status: 'SUCCESS', payload: arr };
    }
    if (btn) btn.classList?.remove('load');
    return { status: 'FAILED', payload: arr };
  } catch (err) {
    console.error('verifyPayment error', err);
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 15000));
      return verifyPayment(data, btn, cartData, retries - 1);
    }
    if (btn) btn.classList?.remove('load');
    return { status: 'ERROR', error: err };
  }
}

// Example: safe render messages into a chat container
export function renderMessage(chatContainerSelector, msg) {
  const container = q(chatContainerSelector);
  if (!container) return;
  const p = createEl('p', { class: msg?.from_self ? 'sent' : 'rec' }, []);
  p.dataset.time = msg?.time || '';
  // Use textContent to avoid XSS
  p.textContent = msg?.msg_content || '';
  container.appendChild(p);
  container.scrollTop = container.scrollHeight;
}

// WebSocket online status handling (example)
export function handleOnlineStatus(wsPath = '/online_status') {
  try {
    const wsBase = makeWsUrl(MAIN_SERVER);
    const wsUrl = wsBase.replace(/\/$/, '') + wsPath;
    const socket = new WebSocket(wsUrl);
    socket.addEventListener('open', () => console.info('WS open', wsUrl));
    socket.addEventListener('message', (ev) => {
      try {
        const data = JSON.parse(ev.data);
        // dispatch or handle online updates
        // safeRun(() => updateUserPresence(data));
      } catch (err) {
        console.warn('WS message parse failed', err);
      }
    });
    socket.addEventListener('close', () => console.info('WS closed'));
    socket.addEventListener('error', (e) => console.error('WS error', e));
    return socket;
  } catch (err) {
    console.error('handleOnlineStatus failed', err);
  }
}

// applyRole, profilePicChanges, displayConversations and other initializers
// should be imported from their modules. If they are defined globally, we call them safely.

export function applyRoleSafe() {
  safeRun(() => typeof applyRole === 'function' && applyRole(), 'applyRole');
}
export function profilePicChangesSafe() {
  safeRun(() => typeof profilePicChanges === 'function' && profilePicChanges(), 'profilePicChanges');
}
export function displayConversationsSafe() {
  safeRun(() => typeof displayConversations === 'function' && displayConversations(), 'displayConversations');
}

// initGetStories, initAddStory, loadExplorePosts etc may live in other modules.
export function initGetStoriesSafe() {
  safeRun(() => typeof initGetStories === 'function' && initGetStories(), 'initGetStories');
}
export function initAddStorySafe() {
  safeRun(() => typeof initAddStory === 'function' && initAddStory(), 'initAddStory');
}

// Main initializer (default export)
export default function initAllEndpoints() {
  // prevent duplicate initialization
  if (globalThis._endpointsInitialized) return;
  globalThis._endpointsInitialized = true;

  // Choose DOMContentLoaded for faster startup
  const onReady = () => {
    // Each initializer is run safely; one failure won't stop others
    initGetStoriesSafe();
    initAddStorySafe();
    safeRun(() => loadExplorePosts({ page: 1 }), 'loadExplorePosts');
    safeRun(() => applyCartData('#cartList'), 'applyCartData');
    profilePicChangesSafe();
    applyRoleSafe();
    displayConversationsSafe();
    safeRun(() => handleOnlineStatus(), 'handleOnlineStatus');
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', onReady, { once: true });
  } else {
    // already parsed
    setTimeout(onReady, 0);
  }
}

// Named exports for testing or manual invocation
export {  };

/* End of api_handler_fixed.js */
