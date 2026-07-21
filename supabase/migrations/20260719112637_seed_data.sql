/*
# Seed categories, courses, lessons

Populates the catalog with 16 programming categories and sample courses with lessons so the
platform has content on first load. Uses ON CONFLICT to avoid duplicates on re-run.
*/

INSERT INTO categories (name, slug, icon) VALUES
  ('HTML', 'html', '🌐'),
  ('CSS', 'css', '🎨'),
  ('JavaScript', 'javascript', '🟨'),
  ('TypeScript', 'typescript', '🔷'),
  ('React', 'react', '⚛️'),
  ('Next.js', 'nextjs', '▲'),
  ('Node.js', 'nodejs', '🟢'),
  ('Express', 'express', '🚂'),
  ('PHP', 'php', '🐘'),
  ('Laravel', 'laravel', '🅿'),
  ('Python', 'python', '🐍'),
  ('Django', 'django', '🎸'),
  ('C++', 'cpp', '➕'),
  ('Java', 'java', '☕'),
  ('SQL', 'sql', '🗄️'),
  ('Git & GitHub', 'git', '🔧')
ON CONFLICT (name) DO NOTHING;

INSERT INTO courses (title, slug, description, instructor, thumbnail_url, cover_url, level, category_name, category_id) VALUES
  ('HTML Fundamentals', 'html-fundamentals', 'Learn the structure of the web. Build your first web page from scratch with semantic HTML5 elements.', 'Saif Amr', 'https://images.pexels.com/photos/270404/pexels-photo-270404.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=1200', 'beginner', 'HTML', (SELECT id FROM categories WHERE slug='html')),
  ('CSS Mastery', 'css-mastery', 'Master modern CSS: Flexbox, Grid, animations, responsive design, and dark mode techniques.', 'Saif Amr', 'https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/5775852/pexels-photo-5775852.jpeg?auto=compress&cs=tinysrgb&w=1200', 'intermediate', 'CSS', (SELECT id FROM categories WHERE slug='css')),
  ('JavaScript Essentials', 'javascript-essentials', 'From variables to async: learn the language that powers the modern web with hands-on examples.', 'Saif Amr', 'https://images.pexels.com/photos/270557/pexels-photo-270557.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/4709357/pexels-photo-4709357.jpeg?auto=compress&cs=tinysrgb&w=1200', 'beginner', 'JavaScript', (SELECT id FROM categories WHERE slug='javascript')),
  ('React From Scratch', 'react-from-scratch', 'Build modern UIs with components, hooks, state, and routing. Ship a real project by the end.', 'Saif Amr', 'https://images.pexels.com/photos/11035385/pexels-photo-11035385.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/4974915/pexels-photo-4974915.jpeg?auto=compress&cs=tinysrgb&w=1200', 'intermediate', 'React', (SELECT id FROM categories WHERE slug='react')),
  ('Python for Everyone', 'python-for-everyone', 'Start coding in Python the simple way — variables, loops, functions, files, and a mini project.', 'Saif Amr', 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/270404/pexels-photo-270404.jpeg?auto=compress&cs=tinysrgb&w=1200', 'beginner', 'Python', (SELECT id FROM categories WHERE slug='python')),
  ('Node.js & Express API', 'node-express-api', 'Build REST APIs with Node, Express, middleware, auth, and file uploads end-to-end.', 'Saif Amr', 'https://images.pexels.com/photos/4974915/pexels-photo-4974915.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=1200', 'advanced', 'Node.js', (SELECT id FROM categories WHERE slug='nodejs'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lessons (course_id, title, description, position, duration_min, notes) VALUES
  ((SELECT id FROM courses WHERE slug='html-fundamentals'), 'Introduction to HTML', 'What HTML is, how the web works, and your first page.', 1, 8, 'HTML = HyperText Markup Language. Elements wrap content in tags like <p>, <h1>, <a>.'),
  ((SELECT id FROM courses WHERE slug='html-fundamentals'), 'Text & Headings', 'Paragraphs, headings, lists, and semantic text elements.', 2, 10, 'Use semantic tags: h1-h6, p, ul, ol, li, strong, em.'),
  ((SELECT id FROM courses WHERE slug='html-fundamentals'), 'Links & Images', 'Create hyperlinks and embed images with alt text for accessibility.', 3, 9, '<a href> for links, <img src alt> for images.'),
  ((SELECT id FROM courses WHERE slug='html-fundamentals'), 'Forms & Inputs', 'Build accessible forms with labels, inputs, and validation.', 4, 12, 'Form elements: form, input, label, textarea, button, select.')
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, position, duration_min, notes) VALUES
  ((SELECT id FROM courses WHERE slug='javascript-essentials'), 'Variables & Types', 'let, const, numbers, strings, booleans, objects.', 1, 10, 'Prefer const by default; use let only when reassigning.'),
  ((SELECT id FROM courses WHERE slug='javascript-essentials'), 'Functions & Scope', 'Function declarations, arrows, parameters, closures.', 2, 12, 'Arrow functions inherit `this` from the enclosing scope.'),
  ((SELECT id FROM courses WHERE slug='javascript-essentials'), 'Arrays & Loops', 'Iterate, map, filter, reduce — the core data toolkit.', 3, 14, 'map/filter/reduce return new arrays; forEach returns nothing.'),
  ((SELECT id FROM courses WHERE slug='javascript-essentials'), 'Async & Promises', 'Promises, async/await, fetch, and error handling.', 4, 16, 'await pauses inside async functions; wrap in try/catch.')
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, position, duration_min, notes) VALUES
  ((SELECT id FROM courses WHERE slug='css-mastery'), 'The Box Model', 'Margin, border, padding, content — and box-sizing.', 1, 9, 'Use box-sizing: border-box globally for predictable sizing.'),
  ((SELECT id FROM courses WHERE slug='css-mastery'), 'Flexbox Layouts', 'Align and distribute items in one dimension with flexbox.', 2, 13, 'justify-content = main axis, align-items = cross axis.'),
  ((SELECT id FROM courses WHERE slug='css-mastery'), 'CSS Grid', 'Two-dimensional layouts made simple with grid.', 3, 14, 'grid-template-columns defines tracks; fr units are flexible.')
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, position, duration_min, notes) VALUES
  ((SELECT id FROM courses WHERE slug='react-from-scratch'), 'Components & Props', 'Build your first React component and pass data with props.', 1, 12, 'Props are read-only; components are functions that return JSX.'),
  ((SELECT id FROM courses WHERE slug='react-from-scratch'), 'State & Events', 'useState, event handlers, and controlled inputs.', 2, 14, 'State updates are async and batched; use the functional form.'),
  ((SELECT id FROM courses WHERE slug='react-from-scratch'), 'Effects & Fetch', 'useEffect for data fetching, cleanup, and dependencies.', 3, 16, 'List every reactive value in the dependency array.')
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, position, duration_min, notes) VALUES
  ((SELECT id FROM courses WHERE slug='python-for-everyone'), 'Hello Python', 'Install Python, run scripts, print your first line.', 1, 8, 'print() adds a newline; use end="" to suppress it.'),
  ((SELECT id FROM courses WHERE slug='python-for-everyone'), 'Data & Loops', 'Lists, dicts, for loops, and comprehensions.', 2, 12, 'List comprehensions: [x*2 for x in nums if x>0].')
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, title, description, position, duration_min, notes) VALUES
  ((SELECT id FROM courses WHERE slug='node-express-api'), 'Node Basics', 'Event loop, modules, npm, and your first server.', 1, 11, 'CommonJS uses require/module.exports; ESM uses import/export.'),
  ((SELECT id FROM courses WHERE slug='node-express-api'), 'Express Routing', 'Routes, middleware, params, and JSON responses.', 2, 14, 'Middleware order matters; call next() to continue.')
ON CONFLICT DO NOTHING;
