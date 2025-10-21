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
        div.style.border = '2px solid rgba(147, 51, 234, 0.5)'; // Purple for hover
        div.style.backgroundColor = 'rgba(147, 51, 234, 0.05)';
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

      // Cmd+Click (Mac) or Ctrl+Click (Windows) - select element
      document.addEventListener('click', (e) => {
        // Only select if Cmd (Mac) or Ctrl (Windows) is pressed
        if (!e.metaKey && !e.ctrlKey) {
          return; // Let click pass through normally
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        const element = e.target;
        selectedElement = element;
        
        // Purple highlight for selected (solid border)
        highlightOverlay.style.border = '3px solid rgb(147, 51, 234)';
        highlightOverlay.style.backgroundColor = 'rgba(147, 51, 234, 0.1)';
        updateHighlight(element);

        window.parent.postMessage({
          type: 'ELEMENT_SELECTED',
          element: getElementData(element)
        }, '*');
      }, true);

      // Double-click - inline text editing
      document.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const element = e.target;
        if (element.contentEditable === 'true') return; // Already editing
        
        // Make element editable
        element.contentEditable = 'true';
        element.focus();
        
        // Select all text
        const range = document.createRange();
        range.selectNodeContents(element);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        
        // Stop editing on blur or Enter
        const stopEditing = () => {
          element.contentEditable = 'false';
          element.removeEventListener('blur', stopEditing);
          element.removeEventListener('keydown', handleEnter);
          
          // Notify parent of content change
          window.parent.postMessage({
            type: 'ELEMENT_TEXT_CHANGED',
            element: getElementData(element),
            newText: element.textContent
          }, '*');
        };
        
        const handleEnter = (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            element.blur();
          }
        };
        
        element.addEventListener('blur', stopEditing, { once: true });
        element.addEventListener('keydown', handleEnter);
      }, true);

      // Delete key - remove element
      document.addEventListener('keydown', (e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
          // Don't delete if actively editing text
          if (selectedElement.contentEditable === 'true') return;
          
          e.preventDefault();
          
          // Ask parent for confirmation
          window.parent.postMessage({
            type: 'DELETE_ELEMENT_REQUEST',
            element: getElementData(selectedElement)
          }, '*');
        }
      });

      // Listen for messages from parent
      window.addEventListener('message', (event) => {
        if (event.data.type === 'APPLY_STYLE' && selectedElement) {
          const mutation = event.data.mutation;
          selectedElement.style[mutation.property] = mutation.value;
          updateHighlight(selectedElement);
        } else if (event.data.type === 'CLEAR_HIGHLIGHT') {
          selectedElement = null;
          highlightOverlay.style.display = 'none';
        } else if (event.data.type === 'CONFIRM_DELETE') {
          // Find and remove element
          const xpath = event.data.xpath;
          const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
          const elementToDelete = result.singleNodeValue;
          if (elementToDelete && elementToDelete.parentNode) {
            elementToDelete.parentNode.removeChild(elementToDelete);
            selectedElement = null;
            highlightOverlay.style.display = 'none';
          }
        }
      });

      // Notify parent ready
      window.parent.postMessage({ type: 'READY' }, '*');
    })();
  `;
}
