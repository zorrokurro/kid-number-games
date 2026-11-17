const fs = require('fs');
const path = require('path');
const files = ['index.html'].concat(fs.readdirSync('games').filter(f => f.endsWith('.html')).map(f => 'games/' + f));
const set = new Set();
const emojiRe = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{2190}-\u{21FF}\u{2934}\u{2935}]/gu;
for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  // 只抓放在字串裡的 emoji（引號內的整段字串），逐字拆
  const strs = c.match(/(['"])(?:\\.|(?!\1).)*\1/gs) || [];
  for (const s of strs) {
    const m = s.match(emojiRe);
    if (m) m.forEach(ch => set.add(ch));
  }
}
// 合成 ZWJ 序列：重新用完整序列掃一遍
const seqRe = /(?:\p{Extended_Pictographic}(?:[\u{FE0F}\u{200D}\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}])*)/gu;
const seqs = new Set();
for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  const strs = c.match(/(['"])(?:\\.|(?!\1).)*\1/gs) || [];
  for (const s of strs) {
    const m = s.match(seqRe);
    if (m) m.forEach(x => x.length > 1 || set.has(x) ? seqs.add(x) : null);
  }
}
const out = [...seqs].filter(s => [...s].some(x => emojiRe.test(x) || /\p{Extended_Pictographic}/u.test(x)));
fs.writeFileSync('.emoji-list.json', JSON.stringify({ singles: [...set], seqs: [...seqs] }, null, 1));
console.log('files:', files.length, 'singles:', set.size, 'seqs:', seqs.size);
