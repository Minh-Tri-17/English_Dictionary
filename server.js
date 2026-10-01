const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const TOPICS_FILE = path.join(__dirname, 'topics.json');

// MIME types dictionary for static files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};


// Helper to read topics database
function readTopicsDB() {
  try {
    if (!fs.existsSync(TOPICS_FILE)) {
      fs.writeFileSync(TOPICS_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(TOPICS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading topics database:', err);
    return [];
  }
}

// Helper to write topics database
function writeTopicsDB(data) {
  try {
    fs.writeFileSync(TOPICS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing topics database:', err);
    return false;
  }
}

// Helper to read request body
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        console.log('--- RECEIVED BODY ---');
        console.log(JSON.stringify(body));
        console.log('---------------------');
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        console.error('JSON parse error:', e);
        reject(e);
      }
    });
    req.on('error', err => reject(err));
  });
}

// Main Request Handler
const server = http.createServer(async (req, res) => {
  const urlPath = req.url;
  const method = req.method;

  console.log(`${method} ${urlPath}`);

  // 1. TOPICS API ROUTES
  if (urlPath.startsWith('/api/topics')) {
    res.setHeader('Content-Type', 'application/json');

    // Parse sub-paths: /api/topics, /api/topics/:id, /api/topics/:id/sentences, /api/topics/:id/sentences/:sid, etc.
    const cleanUrl = urlPath.split('?')[0];
    const parts = cleanUrl.split('/').filter(Boolean); // ['api', 'topics', ...]

    // GET /api/topics
    if (method === 'GET' && parts.length === 2) {
      const db = readTopicsDB();
      res.statusCode = 200;
      return res.end(JSON.stringify(db));
    }

    // POST /api/topics
    if (method === 'POST' && parts.length === 2) {
      try {
        const body = await getRequestBody(req);
        if (!body.name) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Topic name is required' }));
        }

        const db = readTopicsDB();
        const newTopic = {
          id: body.id || ('topic_' + Date.now()),
          name: body.name.trim(),
          description: (body.description || '').trim(),
          icon: (body.icon || 'folder').trim(),
          color: (body.color || '#6366f1').trim(),
          sentences: Array.isArray(body.sentences) ? body.sentences : [],
          words: Array.isArray(body.words) ? body.words : [],
          createdAt: new Date().toISOString()
        };

        db.push(newTopic);
        if (writeTopicsDB(db)) {
          res.statusCode = 201;
          return res.end(JSON.stringify(newTopic));
        } else {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Could not save topic to database' }));
        }
      } catch (err) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    }

    // PUT /api/topics/:id
    if (method === 'PUT' && parts.length === 3) {
      const topicId = parts[2];
      try {
        const body = await getRequestBody(req);
        const db = readTopicsDB();
        const idx = db.findIndex(t => t.id === topicId);
        if (idx === -1) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Topic not found' }));
        }

        db[idx] = {
          ...db[idx],
          name: body.name ? body.name.trim() : db[idx].name,
          description: body.description !== undefined ? body.description.trim() : db[idx].description,
          icon: body.icon || db[idx].icon,
          color: body.color || db[idx].color,
          sentences: Array.isArray(body.sentences) ? body.sentences : db[idx].sentences,
          words: Array.isArray(body.words) ? body.words : db[idx].words,
          updatedAt: new Date().toISOString()
        };

        if (writeTopicsDB(db)) {
          res.statusCode = 200;
          return res.end(JSON.stringify(db[idx]));
        } else {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Could not update topic' }));
        }
      } catch (err) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    }

    // DELETE /api/topics/:id
    if (method === 'DELETE' && parts.length === 3) {
      const topicId = parts[2];
      const db = readTopicsDB();
      const filtered = db.filter(t => t.id !== topicId);
      if (filtered.length === db.length) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: 'Topic not found' }));
      }
      if (writeTopicsDB(filtered)) {
        res.statusCode = 200;
        return res.end(JSON.stringify({ success: true, message: 'Topic deleted successfully' }));
      } else {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Could not delete topic' }));
      }
    }

    // POST /api/topics/:id/sentences
    if (method === 'POST' && parts.length === 4 && parts[3] === 'sentences') {
      const topicId = parts[2];
      try {
        const body = await getRequestBody(req);
        if (!body.sentence || !body.translation) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Sentence and translation are required' }));
        }

        const db = readTopicsDB();
        const topic = db.find(t => t.id === topicId);
        if (!topic) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Topic not found' }));
        }

        if (!Array.isArray(topic.sentences)) topic.sentences = [];

        const newSentence = {
          id: body.id || ('s_' + Date.now()),
          sentence: body.sentence.trim(),
          pronunciation: (body.pronunciation || '').trim(),
          translation: body.translation.trim(),
          usageNote: (body.usageNote || body.note || '').trim(),
          linkingNote: (body.linkingNote || body.linking || '').trim(),
          createdAt: new Date().toISOString()
        };

        topic.sentences.unshift(newSentence);
        if (writeTopicsDB(db)) {
          res.statusCode = 201;
          return res.end(JSON.stringify(newSentence));
        } else {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Could not save sentence to topic' }));
        }
      } catch (err) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    }

    // PUT /api/topics/:id/sentences/:sentId
    if (method === 'PUT' && parts.length === 5 && parts[3] === 'sentences') {
      const topicId = parts[2];
      const sentId = parts[4];
      try {
        const body = await getRequestBody(req);
        const db = readTopicsDB();
        const topic = db.find(t => t.id === topicId);
        if (!topic || !Array.isArray(topic.sentences)) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Topic not found' }));
        }

        const idx = topic.sentences.findIndex(s => s.id === sentId);
        if (idx === -1) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Sentence not found in topic' }));
        }

        topic.sentences[idx] = {
          ...topic.sentences[idx],
          sentence: body.sentence !== undefined ? body.sentence.trim() : topic.sentences[idx].sentence,
          pronunciation: body.pronunciation !== undefined ? body.pronunciation.trim() : topic.sentences[idx].pronunciation,
          translation: body.translation !== undefined ? body.translation.trim() : topic.sentences[idx].translation,
          usageNote: body.usageNote !== undefined ? body.usageNote.trim() : topic.sentences[idx].usageNote,
          linkingNote: body.linkingNote !== undefined ? body.linkingNote.trim() : topic.sentences[idx].linkingNote,
          updatedAt: new Date().toISOString()
        };

        if (writeTopicsDB(db)) {
          res.statusCode = 200;
          return res.end(JSON.stringify(topic.sentences[idx]));
        } else {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Could not update sentence in topic' }));
        }
      } catch (err) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    }

    // DELETE /api/topics/:id/sentences/:sentId
    if (method === 'DELETE' && parts.length === 5 && parts[3] === 'sentences') {
      const topicId = parts[2];
      const sentId = parts[4];
      const db = readTopicsDB();
      const topic = db.find(t => t.id === topicId);
      if (!topic || !Array.isArray(topic.sentences)) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: 'Topic not found' }));
      }

      const filtered = topic.sentences.filter(s => s.id !== sentId);
      if (filtered.length === topic.sentences.length) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: 'Sentence not found' }));
      }

      topic.sentences = filtered;
      if (writeTopicsDB(db)) {
        res.statusCode = 200;
        return res.end(JSON.stringify({ success: true, message: 'Sentence deleted' }));
      } else {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Could not delete sentence' }));
      }
    }

    // POST /api/topics/:id/words
    if (method === 'POST' && parts.length === 4 && parts[3] === 'words') {
      const topicId = parts[2];
      try {
        const body = await getRequestBody(req);
        if (!body.word || !body.definition) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Word and definition are required' }));
        }

        const db = readTopicsDB();
        const topic = db.find(t => t.id === topicId);
        if (!topic) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Topic not found' }));
        }

        if (!Array.isArray(topic.words)) topic.words = [];

        const newWord = {
          id: body.id || ('w_' + Date.now()),
          word: body.word.trim(),
          pronunciation: (body.pronunciation || '').trim(),
          definition: body.definition.trim(),
          type: (body.type || 'noun').toLowerCase(),
          note: (body.note || '').trim(),
          createdAt: new Date().toISOString()
        };

        topic.words.unshift(newWord);
        if (writeTopicsDB(db)) {
          res.statusCode = 201;
          return res.end(JSON.stringify(newWord));
        } else {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Could not save word to topic' }));
        }
      } catch (err) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    }

    // PUT /api/topics/:id/words/:wordId
    if (method === 'PUT' && parts.length === 5 && parts[3] === 'words') {
      const topicId = parts[2];
      const wordId = parts[4];
      try {
        const body = await getRequestBody(req);
        const db = readTopicsDB();
        const topic = db.find(t => t.id === topicId);
        if (!topic || !Array.isArray(topic.words)) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Topic not found' }));
        }

        const idx = topic.words.findIndex(w => w.id === wordId);
        if (idx === -1) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Word not found in topic' }));
        }

        topic.words[idx] = {
          ...topic.words[idx],
          word: body.word !== undefined ? body.word.trim() : topic.words[idx].word,
          pronunciation: body.pronunciation !== undefined ? body.pronunciation.trim() : topic.words[idx].pronunciation,
          definition: body.definition !== undefined ? body.definition.trim() : topic.words[idx].definition,
          type: body.type !== undefined ? (body.type || 'noun').toLowerCase() : topic.words[idx].type,
          note: body.note !== undefined ? body.note.trim() : topic.words[idx].note,
          updatedAt: new Date().toISOString()
        };

        if (writeTopicsDB(db)) {
          res.statusCode = 200;
          return res.end(JSON.stringify(topic.words[idx]));
        } else {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Could not update word in topic' }));
        }
      } catch (err) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    }

    // DELETE /api/topics/:id/words/:wordId
    if (method === 'DELETE' && parts.length === 5 && parts[3] === 'words') {
      const topicId = parts[2];
      const wordId = parts[4];
      const db = readTopicsDB();
      const topic = db.find(t => t.id === topicId);
      if (!topic || !Array.isArray(topic.words)) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: 'Topic not found' }));
      }

      const filtered = topic.words.filter(w => w.id !== wordId);
      if (filtered.length === topic.words.length) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: 'Word not found' }));
      }

      topic.words = filtered;
      if (writeTopicsDB(db)) {
        res.statusCode = 200;
        return res.end(JSON.stringify({ success: true, message: 'Word deleted' }));
      } else {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Could not delete word' }));
      }
    }

    res.statusCode = 404;
    return res.end(JSON.stringify({ error: 'Topics endpoint not found' }));
  }

  // 2. STATIC FILES
  const ALLOWED_STATIC_FILES = [
    'index.html',
    'style.css',
    'app.js',
    'topics.json',
    'videos.json',
    'IPA.jpg',
    'ipa.jpg'
  ];

  const relativePath = urlPath === '/' ? 'index.html' : urlPath.substring(1);
  if (!ALLOWED_STATIC_FILES.includes(relativePath)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    return res.end('Access Forbidden');
  }

  const filePath = path.join(PUBLIC_DIR, relativePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Return 404 for missing static files
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html');
      return res.end('<h1>404 Not Found</h1><p>The requested file does not exist.</p>');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);

    const stream = fs.createReadStream(filePath);
    stream.on('error', (streamErr) => {
      console.error('Stream error:', streamErr);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Internal Server Error');
      }
    });
    stream.pipe(res);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is in use. Trying port ${Number(PORT) + 1}...`);
    server.listen(Number(PORT) + 1, () => {
      console.log(`Server is running at http://localhost:${Number(PORT) + 1}`);
    });
  } else {
    console.error('Server error:', err);
  }
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
