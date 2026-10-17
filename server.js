const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'onar123';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function loadDB() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const init = { bookings: [], testimonials: [
        { id: 1, name: 'Simran Kaur, Delhi', text: 'Vimesh ji ne mere bete ka naam correction kiya, 3 mahine me job lag gayi. Bahut accurate guidance! / बहुत सटीक मार्गदर्शन!', rating: 5 },
        { id: 2, name: 'Rajesh Agarwal, Mumbai', text: 'Mobile number change karne ke baad business me growth dikhi. Urja Vastu healing se ghar me shanti aayi.', rating: 5 },
        { id: 3, name: 'Priya Sharma, Jaipur', text: 'Name spelling me sirf 1 letter change kiya aur meri shaadi fix ho gayi. Truly Gold Wisdom!', rating: 5 }
      ]};
      fs.writeFileSync(DATA_FILE, JSON.stringify(init, null, 2));
      return init;
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) { return { bookings: [], testimonials: [] }; }
}
function saveDB(db) { fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2)); }

// ---- Numerology helpers (shared with frontend) ----
function reduce(num) { while (num > 9 && num !== 11 && num !== 22) { num = String(num).split('').reduce((a, d) => a + +d, 0); } return num; }

// API: bookings
app.get('/api/info', (req, res) => {
  res.json({
    business: 'ONAR GOLD WISDOM',
    owner: 'Vimesh Kaur',
    titles: ['Numerologist', 'Urja Vastu Healer'],
    phones: ['+91 78302 51510', '+91 96906 30711'],
    whatsapp: 'https://wa.me/917830251510',
    waNumber: '917830251510'
  });
});

app.post('/api/bookings', (req, res) => {
  const { name, phone, dob, service, message } = req.body;
  if (!name || !phone || !service) return res.status(400).json({ error: 'Naam, phone aur service zaroori hai' });
  const db = loadDB();
  const booking = { id: Date.now(), name, phone, dob: dob || '', service, message: message || '', status: 'new', createdAt: new Date().toISOString() };
  db.bookings.unshift(booking);
  saveDB(db);
  res.json({ success: true, booking });
});

app.get('/api/bookings', (req, res) => {
  if (req.query.key !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  const db = loadDB();
  res.json(db.bookings);
});

app.patch('/api/bookings/:id', (req, res) => {
  if (req.query.key !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  const db = loadDB();
  const b = db.bookings.find(x => x.id == req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  b.status = req.body.status || b.status;
  saveDB(db);
  res.json({ success: true, booking: b });
});

app.delete('/api/bookings/:id', (req, res) => {
  if (req.query.key !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  const db = loadDB();
  db.bookings = db.bookings.filter(x => x.id != req.params.id);
  saveDB(db);
  res.json({ success: true });
});

app.get('/api/testimonials', (req, res) => { res.json(loadDB().testimonials); });

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => console.log(`ONAR GOLD WISDOM running at http://localhost:${PORT} | Admin: http://localhost:${PORT}/admin (password: ${ADMIN_PASSWORD})`));
