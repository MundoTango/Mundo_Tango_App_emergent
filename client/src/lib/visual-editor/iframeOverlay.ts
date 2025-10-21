/**
 * Iframe Overlay Script - Injected into preview for element selection
 * Click-to-select, hover highlights, style application
 * MB.MD Track A1 - Iframe Instrumentation
 */

import { getElementXPath, type ElementSelection, type IframeMessage } from './iframeMessaging';

export function injectOverlayScript() {
  return `
    (function() {
      let selectedElement = null;
      let hoveredElement = null;
      let highlightOverlay = null;

      // Create highlight overlay
      function createHighlight() {
        const div = document.createElement('div');
        div.id = 'visual-editor-highlight';
        div.style.position = 'absolute';
        div.style.border = '2px solid #3b82f6';
        div.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        div.style.pointerEvents = 'none';
        div.style.zIndex = '999999';
        div.style.transition = 'all 0.15s ease';
        document.body.appendChild(div);
        return div;
      }

      highlightOverlay = createHighlight();

      // Update highlight position
      function updateHighlight(element) {
        if (!element) {
          highlightOverlay.style.display = 'none';
          return;
        }

        const rect = element.getBoundingClientRect();
        highlightOverlay.style.display = 'block';
        highlightOverlay.style.top = (rect.top + window.scrollY) + 'px';
        highlightOverlay.style.left = (rect.left + window.scrollX) + 'px';
        highlightOverlay.style.width = rect.width + 'px';
        highlightOverlay.style.height = rect.height + 'px';
      }

      // Get element data
      function getElementData(element) {
        const rect = element.getBoundingClientRect();
        const computed = window.getComputedStyle(element);
        
        const computedStyles = {};
        const stylesToCapture = ['display', 'position', 'width', 'height', 'margin', 'padding', 
          'backgroundColor', 'color', 'fontSize', 'fontWeight', 'border', 'borderRadius'];
        
        stylesToCapture.forEach(prop => {
          computedStyles[prop] = computed.getPropertyValue(prop);
        });

        const attributes = {};
        Array.from(element.attributes).forEach(attr => {
          attributes[attr.name] = attr.value;
        });

        return {
          xpath: getXPath(element),
          tagName: element.tagName.toLowerCase(),
          id: element.id || undefined,
          className: element.className || undefined,
          textContent: element.textContent?.slice(0, 100) || undefined,
          computedStyles,
          boundingBox: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          },
          attributes
        };
      }

      // Generate XPath
      function getXPath(element) {
        if (element.id) {
          return '//*[@id="' + element.id + '"]';
        }

        const parts = [];
        let current = element;

        while (current && current.nodeType === Node.ELEMENT_NODE) {
          let index = 0;
          let sibling = current;

          while (sibling) {
            if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === current.tagName) {
              index++;
            }
            sibling = sibling.previousElementSibling;
          }

          const tagName = current.tagName.toLowerCase();
          const pathIndex = index > 1 ? '[' + index + ']' : '';
          parts.unshift(tagName + pathIndex);

          current = current.parentElement;
        }

        return '/' + parts.join('/');
      }

      // Mouse move - hover highlight
      document.addEventListener('mousemove', (e) => {
        const element = e.target;
        if (element !== hoveredElement && element !== highlightOverlay) {
          hoveredElement = element;
          if (element !== selectedElement) {
            updateHighlight(element);
            window.parent.postMessage({
              type: 'ELEMENT_HOVERED',
              element: getElementData(element)
            }, '*');
          }
        }
      });

      // Click - select element
      document.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          e.stopPropagation();
          
          const element = e.target;
          selectedElement = element;
          
          // Blue highlight for selected
          highlightOverlay.style.border = '3px solid #3b82f6';
          highlightOverlay.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
          updateHighlight(element);

          window.parent.postMessage({
            type: 'ELEMENT_SELECTED',
            element: getElementData(element)
          }, '*');
        }
      }, true);

      // Listen for style mutations from parent
      window.addEventListener('message', (event) => {
        if (event.data.type === 'APPLY_STYLE' && selectedElement) {
          const mutation = event.data.mutation;
          selectedElement.style[mutation.property] = mutation.value;
          updateHighlight(selectedElement);
        } else if (event.data.type === 'CLEAR_HIGHLIGHT') {
          selectedElement = null;
          highlightOverlay.style.display = 'none';
        }
      });

      // Notify parent ready
      window.parent.postMessage({ type: 'READY' }, '*');
    })();
  `;
}
