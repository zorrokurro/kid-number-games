const html = fs.readFileSync('games/bingolisten.html', 'utf8');
const re = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
let m, ok = true;
while ((m = re.exec(html))) { try { new Function(m[1]); } catch (e) { ok = false; console.log(e.message); } }
console.log('syntax:', ok, '| announce used:', html.includes('announce();'), '| old wording gone:', !html.includes('！找找看！'));
