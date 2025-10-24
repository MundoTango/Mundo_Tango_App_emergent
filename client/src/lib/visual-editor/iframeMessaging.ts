/**
 * PostMessage Contract for Visual Editor Iframe Communication
 * Enables parent-iframe communication for element selection and style mutations
 * MB.MD Track A - Shared Infrastructure
 */

export interface ElementSelection {
  xpath: string;
  tagName: string;
  id?: string;
  className?: string;
  textContent?: string;
  computedStyles: Record<string, string>;
  boundingBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  attributes: Record<string, string>;
}

export interface StyleMutation {
  xpath: string;
  property: string;
  value: string;
}

export type IframeMessage =
  | { type: 'ELEMENT_SELECTED'; element: ElementSelection }
  | { type: 'ELEMENT_HOVERED'; element: ElementSelection | null }
  | { type: 'ELEMENT_TEXT_CHANGED'; element: ElementSelection; newText: string }
  | { type: 'DELETE_ELEMENT_REQUEST'; element: ElementSelection }
  | { type: 'CONFIRM_DELETE'; xpath: string }
  | { type: 'APPLY_STYLE'; mutation: StyleMutation }
  | { type: 'HIGHLIGHT_ELEMENT'; xpath: string }
  | { type: 'CLEAR_HIGHLIGHT' }
  | { type: 'READY' };

/**
 * Send message to iframe
 */
export function sendToIframe(iframe: HTMLIFrameElement, message: IframeMessage) {
  iframe.contentWindow?.postMessage(message, window.location.origin);
}

/**
 * Listen for messages from iframe
 */
export function listenToIframe(handler: (message: IframeMessage) => void) {
  const listener = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    if (event.data && typeof event.data === 'object' && 'type' in event.data) {
      handler(event.data as IframeMessage);
    }
  };

  window.addEventListener('message', listener);
  return () => window.removeEventListener('message', listener);
}

/**
 * Generate XPath for element
 */
export function getElementXPath(element: Element): string {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }

  const parts: string[] = [];
  let current: Element | null = element;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let index = 0;
    let sibling: Element | null = current;

    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === current.tagName) {
        index++;
      }
      sibling = sibling.previousElementSibling;
    }

    const tagName = current.tagName.toLowerCase();
    const pathIndex = index > 1 ? `[${index}]` : '';
    parts.unshift(`${tagName}${pathIndex}`);

    current = current.parentElement;
  }

  return '/' + parts.join('/');
}

/**
 * Find element by XPath
 */
export function findElementByXPath(xpath: string, doc: Document = document): Element | null {
  const result = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  return result.singleNodeValue as Element | null;
}
