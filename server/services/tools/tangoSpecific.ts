export const TANGO_SPECIFIC_TOOLS = [
  {
    name: 'create_tango_event',
    description: 'Create a tango event with date, location, and music style',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Event title' },
        date: { type: 'string', description: 'Event date (ISO format)' },
        location: { type: 'string', description: 'Event location' },
        musicStyle: { type: 'string', description: 'Music style (traditional, nuevo, milonga, vals)' },
        price: { type: 'number', description: 'Entry price' },
        description: { type: 'string', description: 'Event description' }
      },
      required: ['title', 'date', 'location']
    }
  },
  {
    name: 'join_tango_group',
    description: 'Join a tango community or practice group',
    parameters: {
      type: 'object',
      properties: {
        groupId: { type: 'string', description: 'Group ID' },
        membershipType: { type: 'string', description: 'Type: member, leader, follower', default: 'member' }
      },
      required: ['groupId']
    }
  },
  {
    name: 'create_tango_memory',
    description: 'Share a tango memory/photo from an event',
    parameters: {
      type: 'object',
      properties: {
        eventId: { type: 'string', description: 'Related event ID' },
        caption: { type: 'string', description: 'Memory caption' },
        music: { type: 'string', description: 'Song that was playing' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags' }
      },
      required: ['caption']
    }
  },
  {
    name: 'send_tango_message',
    description: 'Send message to another tango dancer',
    parameters: {
      type: 'object',
      properties: {
        recipientId: { type: 'string', description: 'Recipient user ID' },
        message: { type: 'string', description: 'Message content' },
        inviteToEvent: { type: 'string', description: 'Optional event ID to invite to' }
      },
      required: ['recipientId', 'message']
    }
  }
];

export async function executeTangoTool(name: string, args: any, userId: string): Promise<any> {
  switch (name) {
    case 'create_tango_event':
      return {
        success: true,
        eventId: `evt_${Date.now()}`,
        message: 'Event created successfully',
        data: args
      };
    
    case 'join_tango_group':
      return {
        success: true,
        message: `Joined group ${args.groupId} as ${args.membershipType}`
      };
    
    case 'create_tango_memory':
      return {
        success: true,
        memoryId: `mem_${Date.now()}`,
        message: 'Memory shared successfully',
        data: args
      };
    
    case 'send_tango_message':
      return {
        success: true,
        messageId: `msg_${Date.now()}`,
        message: 'Message sent successfully'
      };
    
    default:
      throw new Error(`Unknown tango tool: ${name}`);
  }
}
