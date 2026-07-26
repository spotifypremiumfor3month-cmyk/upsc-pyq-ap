import fs from 'fs';
import path from 'path';

const data = JSON.parse(fs.readFileSync('.agents/outputs/questions_by_subject.json', 'utf-8'));

const outDir = 'artifacts/upsc-pyq/public/data';
fs.mkdirSync(outDir, { recursive: true });

// Write per-subject files
for (const [subject, questions] of Object.entries(data)) {
  const slug = subject.toLowerCase().replace(/\s+/g, '_');
  fs.writeFileSync(path.join(outDir, `${slug}.json`), JSON.stringify(questions));
  console.log(`Wrote ${slug}.json (${questions.length} questions)`);
}

// Write index file
const index = Object.entries(data).map(([subject, questions]) => {
  const slug = subject.toLowerCase().replace(/\s+/g, '_');
  const years = [...new Set(questions.map(q => q.year))].sort();
  return {
    subject,
    slug,
    count: questions.length,
    yearRange: `${years[0]}–${years[years.length - 1]}`,
    years,
  };
});

fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2));
console.log('\nIndex written:', index.map(i => `${i.subject}: ${i.count}`).join(', '));
