const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TOKEN = process.env.WA_TOKEN;
const PHONE_ID = process.env.PHONE_NUMBER_ID;
const VERIFY = process.env.VERIFY_TOKEN;

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  try {
    const msg = req.body?.entry?.[0]
      ?.changes?.[0]?.value?.messages?.[0];
    if (msg && msg.type === 'text') {
      const from = msg.from;
      const text = msg.text.body.toLowerCase();
      await sendMessage(from, getReply(text));
    }
  } catch (e) { console.error(e); }
  res.sendStatus(200);
});

function getReply(text) {
  if (text.includes('attendance'))
    return '📊 Attendance May 2026:\n✅ Present: 22\n❌ Absent: 1\n📈 94%';
  if (text.includes('result') || text.includes('marks'))
    return '📋 Results:\n📚 Science: 88/100\n📐 Maths: 92/100\n📈 91.2%';
  if (text.includes('homework'))
    return '📚 Homework:\nMaths: Exercise 4.2\nScience: Read Ch.5';
  if (text.includes('timetable'))
    return '📅 Tomorrow:\n1.Maths 2.Science\n3.English 4.Hindi 5.SST';
  if (text.includes('fee'))
    return '💳 Due: Rs.15,000\n📅 By: 15 Jun 2026';
  if (text.includes('notice'))
    return '📢 Sports Day: 20 May\n👥 PTA: 25 May';
  return '🏫 Heritage Model School\nReply:\n1.Attendance\n2.Results\n3.Homework\n4.Timetable\n5.Fee\n6.Notices';
}

async function sendMessage(to, body) {
  await axios.post(
    `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`,
    { messaging_product: 'whatsapp', to,
      type: 'text', text: { body } },
    { headers: { Authorization: `Bearer ${TOKEN}` }}
  );
}

app.listen(process.env.PORT || 3000,
  () => console.log('EduWave Bot running!'));
