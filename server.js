const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const DB_FILE = path.join(__dirname, 'dictionary.json');
const SENTENCES_FILE = path.join(__dirname, 'sentences.json');

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

// Helper to read database
function readDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading database:', err);
    return [];
  }
}

// Helper to write database
function writeDatabase(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing database:', err);
    return false;
  }
}

// Helper to read sentences database
function readSentencesDB() {
  try {
    if (!fs.existsSync(SENTENCES_FILE)) {
      fs.writeFileSync(SENTENCES_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(SENTENCES_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading sentences database:', err);
    return [];
  }
}

// Helper to write sentences database
function writeSentencesDB(data) {
  try {
    fs.writeFileSync(SENTENCES_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing sentences database:', err);
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

  // 1. API ROUTES
  if (urlPath.startsWith('/api/words')) {
    res.setHeader('Content-Type', 'application/json');

    // GET /api/words
    if (method === 'GET' && urlPath === '/api/words') {
      const db = readDatabase();
      res.statusCode = 200;
      return res.end(JSON.stringify(db));
    }

    // POST /api/words
    if (method === 'POST' && urlPath === '/api/words') {
      try {
        const body = await getRequestBody(req);
        if (!body.word || !body.definition) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Word and definition are required' }));
        }

        const db = readDatabase();
        const newWord = {
          id: Date.now().toString(),
          word: body.word.trim(),
          type: (body.type || 'noun').toLowerCase(),
          pronunciation: (body.pronunciation || '').trim(),
          definition: body.definition.trim(),
          example: (body.example || '').trim(),
          createdAt: new Date().toISOString()
        };

        db.unshift(newWord); // Add new word at the top
        if (writeDatabase(db)) {
          res.statusCode = 201;
          return res.end(JSON.stringify(newWord));
        } else {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Could not save word to database' }));
        }
      } catch (err) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    }

    // PUT /api/words/:id
    if (method === 'PUT' && urlPath.startsWith('/api/words/')) {
      const id = urlPath.split('/').pop();
      try {
        const body = await getRequestBody(req);
        if (!body.word || !body.definition) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Word and definition are required' }));
        }

        const db = readDatabase();
        const wordIndex = db.findIndex(item => item.id === id);

        if (wordIndex === -1) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Word not found' }));
        }

        db[wordIndex] = {
          ...db[wordIndex],
          word: body.word.trim(),
          type: (body.type || 'noun').toLowerCase(),
          pronunciation: (body.pronunciation || '').trim(),
          definition: body.definition.trim(),
          example: (body.example || '').trim(),
          updatedAt: new Date().toISOString()
        };

        if (writeDatabase(db)) {
          res.statusCode = 200;
          return res.end(JSON.stringify(db[wordIndex]));
        } else {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Could not update word database' }));
        }
      } catch (err) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    }

    // DELETE /api/words/:id
    if (method === 'DELETE' && urlPath.startsWith('/api/words/')) {
      const id = urlPath.split('/').pop();
      const db = readDatabase();
      const filteredDb = db.filter(item => item.id !== id);

      if (db.length === filteredDb.length) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: 'Word not found' }));
      }

      if (writeDatabase(filteredDb)) {
        res.statusCode = 200;
        return res.end(JSON.stringify({ success: true, message: 'Word deleted successfully' }));
      } else {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Could not update database after deletion' }));
      }
    }

    res.statusCode = 404;
    return res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }

  // 1b. SENTENCES API ROUTES
  if (urlPath.startsWith('/api/sentences')) {
    res.setHeader('Content-Type', 'application/json');

    // GET /api/sentences
    if (method === 'GET' && urlPath === '/api/sentences') {
      const db = readSentencesDB();
      res.statusCode = 200;
      return res.end(JSON.stringify(db));
    }

    // POST /api/sentences
    if (method === 'POST' && urlPath === '/api/sentences') {
      try {
        const body = await getRequestBody(req);
        if (!body.sentence || !body.translation) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Sentence and translation are required' }));
        }

        const db = readSentencesDB();
        const newItem = {
          id: Date.now().toString(),
          sentence: body.sentence.trim(),
          translation: body.translation.trim(),
          pronunciation: (body.pronunciation || '').trim(),
          category: (body.category || 'general').trim(),
          note: (body.note || '').trim(),
          createdAt: new Date().toISOString()
        };

        db.unshift(newItem);
        if (writeSentencesDB(db)) {
          res.statusCode = 201;
          return res.end(JSON.stringify(newItem));
        } else {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Could not save sentence to database' }));
        }
      } catch (err) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    }

    // PUT /api/sentences/:id
    if (method === 'PUT' && urlPath.startsWith('/api/sentences/')) {
      const id = urlPath.split('/').pop();
      try {
        const body = await getRequestBody(req);
        if (!body.sentence || !body.translation) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Sentence and translation are required' }));
        }

        const db = readSentencesDB();
        const idx = db.findIndex(item => item.id === id);

        if (idx === -1) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Sentence not found' }));
        }

        db[idx] = {
          ...db[idx],
          sentence: body.sentence.trim(),
          translation: body.translation.trim(),
          pronunciation: (body.pronunciation || '').trim(),
          category: (body.category || 'general').trim(),
          note: (body.note || '').trim(),
          updatedAt: new Date().toISOString()
        };

        if (writeSentencesDB(db)) {
          res.statusCode = 200;
          return res.end(JSON.stringify(db[idx]));
        } else {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Could not update sentences database' }));
        }
      } catch (err) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    }

    // DELETE /api/sentences/:id
    if (method === 'DELETE' && urlPath.startsWith('/api/sentences/')) {
      const id = urlPath.split('/').pop();
      const db = readSentencesDB();
      const filteredDb = db.filter(item => item.id !== id);

      if (db.length === filteredDb.length) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: 'Sentence not found' }));
      }

      if (writeSentencesDB(filteredDb)) {
        res.statusCode = 200;
        return res.end(JSON.stringify({ success: true, message: 'Sentence deleted successfully' }));
      } else {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Could not update database after deletion' }));
      }
    }

    res.statusCode = 404;
    return res.end(JSON.stringify({ error: 'Sentences endpoint not found' }));
  }

  // 2. STATIC FILES
  const ALLOWED_STATIC_FILES = [
    'index.html',
    'style.css',
    'app.js',
    'dictionary.json',
    'sentences.json'
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

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
