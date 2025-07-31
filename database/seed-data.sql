-- Sample data for AgentFlow MVP testing

-- Insert sample users (passwords are hashed version of 'password123')
INSERT INTO users (id, email, password, name, phone) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'jim.agent@realestate.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jim Anderson', '+1-555-0101'),
    ('550e8400-e29b-41d4-a716-446655440002', 'sarah.realtor@homes.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah Martinez', '+1-555-0102')
ON CONFLICT (email) DO NOTHING;

-- Insert sample contacts
INSERT INTO contacts (id, user_id, name, email, phone, role, status, property_id, property_info) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Carla Thomas', 'carla.thomas@email.com', '+1-555-0201', 'buyer', 'under_contract', '123-main-st', '123 Main St. - 3BR/2BA Colonial, inspection scheduled'),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Mike Johnson', 'mike.j@email.com', '+1-555-0202', 'seller', 'active', '456-oak-ave', '456 Oak Ave - 4BR/3BA Ranch, listed at $450K'),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Lisa Chen', 'lisa.chen@email.com', '+1-555-0203', 'lead', 'new', null, 'Interested in downtown condos, budget $300-400K')
ON CONFLICT (id) DO NOTHING;

-- Insert sample messages
INSERT INTO messages (contact_id, agent_id, content, channel, direction, urgency, status) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Hey just checking — is the inspection still on for 3 PM?', 'sms', 'inbound', 'high', 'pending'),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Can we schedule a showing for this weekend?', 'email', 'inbound', 'medium', 'pending'),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Still interested in seeing properties. Any new listings?', 'sms', 'inbound', 'low', 'pending')
ON CONFLICT (id) DO NOTHING;

-- Insert sample notification preferences
INSERT INTO notification_preferences (user_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (user_id) DO NOTHING;