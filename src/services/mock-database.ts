// Mock database service for testing without Supabase
import { User, Contact, Message } from '../types';

// In-memory data store for testing
const mockData = {
  users: [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'jim.agent@realestate.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
      name: 'Jim Anderson',
      phone: '+1-555-0101',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  contacts: [
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      external_id: null,
      name: 'Carla Thomas',
      email: 'carla.thomas@email.com',
      phone: '+1-555-0201',
      role: 'buyer' as const,
      status: 'under_contract',
      property_id: '123-main-st',
      property_info: '123 Main St. - 3BR/2BA Colonial, inspection scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440002',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      external_id: null,
      name: 'Mike Johnson',
      email: 'mike.j@email.com',
      phone: '+1-555-0202',
      role: 'seller' as const,
      status: 'active',
      property_id: '456-oak-ave',
      property_info: '456 Oak Ave - 4BR/3BA Ranch, listed at $450K',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  messages: [
    {
      id: '770e8400-e29b-41d4-a716-446655440001',
      contact_id: '660e8400-e29b-41d4-a716-446655440001',
      agent_id: '550e8400-e29b-41d4-a716-446655440001',
      content: 'Hey just checking — is the inspection still on for 3 PM?',
      channel: 'sms' as const,
      direction: 'inbound' as const,
      urgency: 'high' as const,
      status: 'pending',
      created_at: new Date().toISOString()
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440002',
      contact_id: '660e8400-e29b-41d4-a716-446655440002',
      agent_id: '550e8400-e29b-41d4-a716-446655440001',
      content: 'Can we schedule a showing for this weekend?',
      channel: 'email' as const,
      direction: 'inbound' as const,
      urgency: 'medium' as const,
      status: 'pending',
      created_at: new Date().toISOString()
    }
  ]
};

// Mock Supabase-like interface
export const mockSupabase = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: () => {
          if (table === 'users') {
            const user = mockData.users.find((u: any) => u[column] === value);
            return Promise.resolve({ data: user || null, error: user ? null : new Error('User not found') });
          }
          if (table === 'contacts') {
            const contact = mockData.contacts.find((c: any) => c[column] === value);
            return Promise.resolve({ data: contact || null, error: contact ? null : new Error('Contact not found') });
          }
          return Promise.resolve({ data: null, error: new Error('Not found') });
        },
        limit: (n: number) => Promise.resolve({ 
          data: table === 'users' ? mockData.users.slice(0, n) : [], 
          error: null 
        })
      }),
      order: (column: string, options: any) => {
        if (table === 'messages') {
          const messages = mockData.messages.map(msg => ({
            ...msg,
            contacts: mockData.contacts.find(c => c.id === msg.contact_id)
          }));
          return Promise.resolve({ data: messages, error: null });
        }
        return Promise.resolve({ data: [], error: null });
      }
    }),
    insert: (data: any[]) => ({
      select: () => ({
        single: () => {
          const newId = Math.random().toString(36).substr(2, 9);
          const newItem = { ...data[0], id: newId, created_at: new Date().toISOString() };
          
          if (table === 'users') {
            mockData.users.push(newItem);
          } else if (table === 'contacts') {
            mockData.contacts.push(newItem);
          } else if (table === 'messages') {
            mockData.messages.push(newItem);
          }
          
          return Promise.resolve({ data: newItem, error: null });
        }
      })
    })
  })
};

console.log('🧪 Using mock database for testing (no Supabase connection required)');
export { mockData };