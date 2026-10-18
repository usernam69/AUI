export function isMessageSubmitKey(event, { enterToSend = true } = {}) {
  if (event.key !== "Enter" || event.isComposing) return false;
  if (enterToSend) return !event.shiftKey;
  return event.ctrlKey || event.metaKey;
}
