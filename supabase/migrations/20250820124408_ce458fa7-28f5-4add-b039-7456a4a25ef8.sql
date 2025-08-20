-- Update the current user's role to admin so they can access the inbox
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = '891d316b-8ab4-440f-8a2a-7ed7c9299898';