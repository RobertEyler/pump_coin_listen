import fs from 'fs';

function parseCookiesFromFile(filePath: string): Record<string, string> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const cookies: Record<string, string> = {};
  content.split(';').forEach((pair) => {
    const [key, value] = pair.trim().split('=');
    if (key && value) {
      cookies[key] = value;
    }
  });
  return cookies;
}

const cookies = parseCookiesFromFile('cookies.txt');
console.log(JSON.stringify(cookies, null, 2));