export function toast(msg: string, bad = false) {
  window.dispatchEvent(new CustomEvent('bfm-toast', { detail: { msg, bad } }));
}
