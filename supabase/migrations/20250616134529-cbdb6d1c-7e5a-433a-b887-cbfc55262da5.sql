
-- Insert the kick-off livestream
INSERT INTO public.events (title, event_type, event_date, description) VALUES
('Lovable Shipped - Kick-off Livestream', 'Livestream', '2025-06-15 17:00:00+00', 'Join us for the official kick-off of Lovable Shipped! Learn what to expect from this comprehensive video series and get ready to master modern web development.');

-- Insert weekly lectures (Mondays at 10:00 AM PT = 17:00 UTC)
INSERT INTO public.events (title, event_type, event_date, description) VALUES
('Introduction to Modern Web Development', 'Lecture', '2025-06-16 17:00:00+00', 'Get started with the fundamentals of modern web development. Learn about the tools, frameworks, and best practices that will guide your journey.'),
('React Fundamentals and Components', 'Lecture', '2025-06-23 17:00:00+00', 'Deep dive into React fundamentals, component architecture, and modern React patterns. Build your first interactive components.'),
('State Management and Data Flow', 'Lecture', '2025-06-30 17:00:00+00', 'Master state management in React applications. Learn about useState, useEffect, and advanced state patterns.'),
('TypeScript for React Development', 'Lecture', '2025-07-07 17:00:00+00', 'Enhance your React applications with TypeScript. Learn type safety, interfaces, and how to build more robust applications.'),
('Styling and UI Components', 'Lecture', '2025-07-14 17:00:00+00', 'Explore modern styling approaches including Tailwind CSS, component libraries, and responsive design principles.'),
('Advanced React Patterns and Performance', 'Lecture', '2025-07-21 17:00:00+00', 'Learn advanced React patterns, performance optimization techniques, and best practices for scalable applications.');

-- Insert weekly fireside chats (Thursdays at 10:00 AM PT = 17:00 UTC)
INSERT INTO public.events (title, event_type, event_date, description) VALUES
('Developer Journey: From Beginner to Professional', 'Fireside Chat', '2025-06-19 17:00:00+00', 'An intimate conversation about the developer journey, career growth, and what it takes to succeed in modern web development.'),
('Building in Public: Lessons Learned', 'Fireside Chat', '2025-06-26 17:00:00+00', 'Join us for insights on building projects in public, sharing your work, and engaging with the developer community.'),
('The Future of Web Development', 'Fireside Chat', '2025-07-03 17:00:00+00', 'Explore emerging trends, new technologies, and where web development is heading in the next few years.'),
('Scaling Applications: Real-world Challenges', 'Fireside Chat', '2025-07-10 17:00:00+00', 'Discussion on scaling web applications, performance considerations, and handling real-world production challenges.'),
('AI in Development: Tools and Techniques', 'Fireside Chat', '2025-07-17 17:00:00+00', 'Explore how AI is transforming development workflows, tools that enhance productivity, and the future of AI-assisted coding.'),
('Community and Open Source Contribution', 'Fireside Chat', '2025-07-24 17:00:00+00', 'Learn about contributing to open source projects, building a developer community, and giving back to the ecosystem.');
