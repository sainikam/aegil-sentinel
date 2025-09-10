require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aegis_sentinel';
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const PORT = process.env.PORT || 4000;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Mongo connected'))
  .catch(err => console.error('Mongo error', err));

// ================== SCHEMAS ==================
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  role: { type: String, default: 'user' }
});

const incidentSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  status: { type: String, default: 'reported' },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  severity: { type: String, default: 'low' }
});

const unitSchema = new mongoose.Schema({
  name: String,
  location: String,
  status: { type: String, default: 'active' }
});

const User = mongoose.model('User', userSchema);
const Incident = mongoose.model('Incident', incidentSchema);
const Unit = mongoose.model('Unit', unitSchema);

// ================== AUTH MIDDLEWARE ==================
function authMiddleware(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ message: 'No token' });

  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// ================== AUTH ROUTES ==================
app.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Missing fields' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email exists' });

  const passwordHash = await bcrypt.hash(password, 8);
  const userCount = await User.countDocuments();
  const role = userCount === 0 ? 'admin' : 'user';

  const user = new User({ name, email, passwordHash, role });
  await user.save();

  const token = jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

// ================== INCIDENT ROUTES ==================
app.get('/incidents', authMiddleware, async (req, res) => {
  const incidents = await Incident.find()
    .populate('reporter', 'name email role')
    .sort({ createdAt: -1 });
  res.json(incidents);
});

app.post('/incidents', authMiddleware, async (req, res) => {
  const { title, description, location } = req.body;
  if (!title || !description)
    return res.status(400).json({ message: 'Missing fields' });

  const inc = new Incident({
    title,
    description,
    location,
    reporter: req.user.id
  });
  await inc.save();

  const pop = await Incident.findById(inc._id).populate(
    'reporter',
    'name email role'
  );

  io.emit('incident:created', pop);
  res.json(pop);
});

app.patch('/incidents/:id', authMiddleware, async (req, res) => {
  const { status } = req.body;
  const inc = await Incident.findById(req.params.id);
  if (!inc) return res.status(404).json({ message: 'Not found' });

  inc.status = status || inc.status;
  await inc.save();

  const pop = await Incident.findById(inc._id).populate('reporter', 'name');
  io.emit('incident:updated', pop);

  res.json(pop);
});

app.delete('/incidents/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden' });

  await Incident.findByIdAndDelete(req.params.id);
  io.emit('incident:deleted', { id: req.params.id });

  res.json({ ok: true });
});

// ================== UNIT ROUTES ==================
app.get('/units', authMiddleware, async (req, res) => {
  const units = await Unit.find().sort({ name: 1 });
  res.json(units);
});

app.post('/units', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden' });

  const { name, location, status } = req.body;
  if (!name) return res.status(400).json({ message: 'Missing fields' });

  const u = new Unit({ name, location, status });
  await u.save();

  res.json(u);
});

app.delete('/units/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden' });

  await Unit.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// ================== AI SIMULATE ==================
const upload = multer({ dest: 'uploads/' });
app.post('/ai/simulate', authMiddleware, upload.single('image'), async (req, res) => {
  let title = 'AI Detection';
  let description = req.body.caption || 'Automated detection triggered by AI';
  let location =
    req.body.location ||
    (req.body.latitude && req.body.longitude
      ? `${req.body.latitude},${req.body.longitude}`
      : '');
  let severity = req.body.severity || 'medium';

  const inc = new Incident({
    title,
    description,
    location,
    severity,
    reporter: req.user.id
  });
  await inc.save();

  const pop = await Incident.findById(inc._id).populate(
    'reporter',
    'name email role'
  );
  io.emit('incident:created', pop);

  res.json(pop);
});

// ================== ANALYTICS ==================
app.get('/analytics', authMiddleware, async (req, res) => {
  const last7 = await Incident.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });

  const top = await Incident.aggregate([
    { $group: { _id: '$location', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);

  res.json({ last7, topSector: top[0] ? top[0]._id : 'N/A' });
});

// ================== HEALTH ==================
app.get('/health', (req, res) => res.json({ ok: true }));

// ================== START SERVER ==================
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
