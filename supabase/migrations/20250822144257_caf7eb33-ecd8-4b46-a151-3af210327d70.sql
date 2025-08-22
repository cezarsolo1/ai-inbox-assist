-- Insert example tickets to demonstrate the Kanban board functionality
INSERT INTO public.tickets (title, description, category, priority, status, property_address, tenant_id, created_at, updated_at) VALUES

-- Open tickets
('Leaky Faucet in Kitchen', 'The kitchen faucet has been dripping constantly for the past week. Water is pooling on the counter.', 'plumbing', 'medium', 'open', '123 Main Street, Apt 4B', NULL, now() - interval '2 days', now() - interval '2 days'),

('Broken AC Unit', 'Air conditioning unit stopped working yesterday. Very hot in the apartment.', 'hvac', 'high', 'open', '456 Oak Avenue, Unit 12', NULL, now() - interval '1 day', now() - interval '1 day'),

('Squeaky Door Hinges', 'Front door hinges are very squeaky and need lubrication.', 'maintenance', 'low', 'open', '789 Pine Street, Apt 3A', NULL, now() - interval '3 days', now() - interval '3 days'),

-- In Progress tickets
('Dishwasher Not Draining', 'Dishwasher is not draining properly. Water remains at the bottom after each cycle.', 'appliances', 'medium', 'in_progress', '321 Elm Street, Unit 8', NULL, now() - interval '5 days', now() - interval '1 day'),

('Painting Hallway Walls', 'Scheduled maintenance to repaint the hallway walls due to scuff marks.', 'maintenance', 'low', 'in_progress', '654 Birch Lane, Building A', NULL, now() - interval '4 days', now() - interval '2 days'),

-- Pending tickets
('Window Won''t Close Properly', 'Bedroom window is stuck and won''t close completely. Security concern.', 'general', 'high', 'pending', '987 Cedar Road, Apt 15C', NULL, now() - interval '6 days', now() - interval '1 day'),

('Garbage Disposal Jammed', 'Kitchen garbage disposal is making strange noises and appears to be jammed.', 'appliances', 'medium', 'pending', '147 Maple Drive, Unit 6', NULL, now() - interval '3 days', now() - interval '1 day'),

-- Resolved tickets
('Clogged Bathroom Drain', 'Bathroom sink drain was completely blocked. Plumber cleared the blockage successfully.', 'plumbing', 'medium', 'resolved', '258 Willow Street, Apt 9B', NULL, now() - interval '8 days', now() - interval '1 day'),

('Replace Light Bulbs', 'All common area light bulbs in hallway have been replaced with LED bulbs.', 'electrical', 'low', 'resolved', '369 Spruce Avenue, Building B', NULL, now() - interval '7 days', now() - interval '2 days'),

('Fix Loose Cabinet Door', 'Kitchen cabinet door hinge was loose and has been tightened and secured.', 'maintenance', 'low', 'resolved', '741 Ash Street, Unit 11', NULL, now() - interval '10 days', now() - interval '3 days'),

-- Closed tickets
('Internet Connectivity Issues', 'Tenant reported slow internet. Issue was with router configuration, now resolved and closed.', 'general', 'medium', 'closed', '852 Poplar Lane, Apt 7A', NULL, now() - interval '15 days', now() - interval '5 days'),

('Noisy Upstairs Neighbors', 'Complaint about noise from upstairs unit. Issue discussed with both parties and resolved.', 'general', 'low', 'closed', '963 Hickory Court, Unit 3', NULL, now() - interval '12 days', now() - interval '7 days');