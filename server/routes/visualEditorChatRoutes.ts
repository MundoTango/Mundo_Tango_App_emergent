/**
 * VISUAL EDITOR CHAT API ROUTES
 * MB.MD TRACK: Visual Editor Context-Aware Chat
 * 
 * Provides AI chat functionality with full context awareness:
 * - Selected element information from Inspector
 * - Current page being edited
 * - Recent edit history
 * 
 * DEBUG LOGGING: All requests/responses logged for testing
 */

import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Request schema with context (accepts both old and new formats)
const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  context: z.object({
    page: z.string().optional(),
    url: z.string().optional(),
    // NEW FORMAT: From visual editor (element data)
    selectedElement: z.object({
      tag: z.string().optional(),
      className: z.string().optional(),
      id: z.string().optional(),
      xpath: z.string().optional(),
      textContent: z.string().optional(),
    }).optional(),
    // OLD FORMAT: From component registry (keep for backward compat)
    selectedComponent: z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
    }).optional(),
    recentEdits: z.array(z.any()).optional(),
  }).optional(),
});

/**
 * POST /api/visual-editor/simple-chat
 * Context-aware chat endpoint for Visual Editor
 */
router.post('/simple-chat', async (req, res) => {
  const timestamp = new Date().toISOString();
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 [MR BLUE VISUAL CHAT] New Request');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`⏰ Timestamp: ${timestamp}`);
  console.log(`📝 Request Body:`, JSON.stringify(req.body, null, 2));
  
  try {
    // Validate request
    const data = chatRequestSchema.parse(req.body);
    
    console.log(`\n✅ Validation Passed`);
    console.log(`💬 User Message: "${data.message}"`);
    console.log(`\n📦 Context Received:`);
    console.log(`   Page: ${data.context?.page || 'N/A'}`);
    console.log(`   URL: ${data.context?.url || 'N/A'}`);
    console.log(`   Selected Element:`, data.context?.selectedElement || 'None');
    console.log(`   Selected Component:`, data.context?.selectedComponent || 'None');
    console.log(`   Recent Edits: ${data.context?.recentEdits?.length || 0}`);
    
    // Extract context
    const { message, context } = data;
    const selectedComponent = context?.selectedComponent;
    const selectedElement = context?.selectedElement;
    
    // Use element data if available (new format), fallback to component (old format)
    const elementInfo = selectedElement || selectedComponent;
    
    // Generate context-aware response
    let response = '';
    
    // PRIORITY 1: Direct element queries
    const messageLower = message.toLowerCase().trim();
    
    if (messageLower.includes('what element') || messageLower.includes('which element')) {
      console.log(`\n🎯 DETECTED: Element identification query`);
      
      if (elementInfo) {
        const elementName = (elementInfo as any).name || (elementInfo as any).textContent || (elementInfo as any).tag || 'Unknown element';
        response = `**${elementName}**`;
        console.log(`✅ RESPONSE: Returning element name: ${elementName}`);
      } else {
        response = `No element is currently selected. Click on any element in the preview to select it.`;
        console.log(`⚠️ RESPONSE: No element selected`);
      }
    }
    // PRIORITY 2: Tell me about this element
    else if (messageLower.includes('tell me about') || messageLower.includes('about this element')) {
      console.log(`\n🎯 DETECTED: Element details query`);
      
      if (elementInfo) {
        const el = elementInfo as any;
        const elementName = el.name || el.textContent || el.tag || 'Unknown';
        const elementType = el.type || el.tag || 'element';
        const elementId = el.id || 'No ID';
        
        response = `I can see you've selected **${elementName}**.

**Element Details:**
- **Type:** ${elementType}
- **ID:** ${elementId}
${el.className ? `- **Classes:** ${el.className}` : ''}
${el.xpath ? `- **Path:** ${el.xpath}` : ''}
- **Page:** ${context?.page || 'Unknown'}

What would you like to do with this element? I can help you:
- Change its styling
- Modify its content
- Update its behavior
- Delete it`;
        console.log(`✅ RESPONSE: Providing detailed element info`);
      } else {
        response = `No element is currently selected. Click on an element in the preview pane to select it, then ask me about it.`;
        console.log(`⚠️ RESPONSE: No element to describe`);
      }
    }
    // PRIORITY 3: General help
    else if (messageLower.includes('what can') || messageLower.includes('help')) {
      console.log(`\n🎯 DETECTED: General help query`);
      
      response = `I'm Mr Blue, your Visual Editor AI assistant! Here's what I can help you with:

**Element Selection:**
- Ask "what element am I on?" to see the selected element
- Ask "tell me about this element" for detailed information

**Editing:**
- Request style changes (colors, spacing, fonts)
- Modify content and text
- Generate new components

**Current Context:**
- Page: ${context?.page || 'Unknown'}
${elementInfo ? `- Selected: **${(elementInfo as any).name || (elementInfo as any).textContent || (elementInfo as any).tag}**` : '- No element selected'}
${context?.recentEdits?.length ? `- ${context.recentEdits.length} recent edits` : ''}

Click on any element to select it, then ask me what you'd like to change!`;
      console.log(`✅ RESPONSE: Providing help information`);
    }
    // PRIORITY 4: Default conversational response
    else {
      console.log(`\n🎯 DETECTED: General query`);
      
      if (elementInfo) {
        const elementName = (elementInfo as any).name || (elementInfo as any).textContent || (elementInfo as any).tag || 'this element';
        response = `I understand you want to work with **${elementName}**. 

Could you be more specific about what you'd like to do? For example:
- "Make this button blue"
- "Add padding to this element"
- "Change the text size"
- "Tell me about this element"`;
        console.log(`✅ RESPONSE: Prompting for specifics with context`);
      } else {
        response = `I'm ready to help! Select an element by clicking on it in the preview pane, or ask me general questions about editing this page.

You can try:
- "What can I edit on this page?"
- "Suggest improvements"
- Or click an element and ask "what element am I on?"`;
        console.log(`✅ RESPONSE: Prompting for element selection`);
      }
    }
    
    console.log(`\n📤 Sending Response:`);
    console.log(`   Length: ${response.length} characters`);
    console.log(`   First 100 chars: ${response.substring(0, 100)}...`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.json({
      success: true,
      response,
      context: {
        selectedElementInfo: elementInfo,
        selectedComponentName: selectedComponent?.name,
        page: context?.page,
        timestamp,
      }
    });
    
  } catch (error) {
    console.error(`\n❌ ERROR in Visual Chat:`, error);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request format',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
