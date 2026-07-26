import fs from 'fs';
import path from 'path';

// Subject name map from filename to clean name
const SUBJECT_MAP = {
  'linear_Ancient_History_[1979-2025]_1784953244492': 'Ancient History',
  'linear_General_Science_[1979-2025]_1784953244495': 'General Science',
  'linear_Indian_Economy_[1979-2025]_(1)_1784953244496': 'Indian Economy',
  'linear_Indian_Economy_[1979-2025]_1784953244497': 'Indian Economy',
  'linear_Indian_Geography_[1979-2025]_1784953244498': 'Indian Geography',
  'linear_Indian_Polity_[1979-2025]_1784953244499': 'Indian Polity',
  'linear_Medieval_History_[1979-2025]_1784953244499': 'Medieval History',
  'linear_Modern_History_[1979-2025]_1784953244500': 'Modern History',
  'linear_World_Geography_[1979-2025]_(1)_1784953244501': 'World Geography',
  'linear_World_Geography_[1979-2025]_1784953244501': 'World Geography',
};

const OUTPUT_DIR = '.agents/outputs';

// Parse a single text file into structured questions
function parseTextFile(text, subject) {
  const lines = text.split('\n');
  const questions = [];
  
  let currentYear = null;
  let i = 0;
  
  // Patterns
  const yearPattern = /UPSC\s+PYQs?\s*[-–—]\s*(\d{4})/i;
  const questionPattern = /^Q(\d+)\.\s*(.*)/;
  const optionPattern = /^\(([a-dA-D])\)\s*(.*)/;
  const answerPattern = /^(?:The correct option(?:s)? (?:is|are):?\s*)?Answer\s*[:\-]?\s*(?:\(([a-dA-D])\))?\s*(.*)/i;
  const correctOptionPattern = /^The correct option(?:s)? (?:is|are):?\s*\(([a-dA-D])\)/i;

  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Check for year heading
    const yearMatch = line.match(yearPattern);
    if (yearMatch) {
      currentYear = parseInt(yearMatch[1]);
      i++;
      continue;
    }
    
    // Check for question start
    const qMatch = line.match(questionPattern);
    if (qMatch && currentYear) {
      const qNum = parseInt(qMatch[1]);
      let questionText = qMatch[2].trim();
      i++;
      
      // Gather rest of question text until we hit options or next question
      while (i < lines.length) {
        const nextLine = lines[i].trim();
        if (nextLine.match(optionPattern) || nextLine.match(/^Q\d+\./) || nextLine.match(yearPattern)) break;
        if (nextLine && !nextLine.match(/^Answer\s*[:]/i) && !nextLine.match(/^The correct option/i)) {
          questionText += ' ' + nextLine;
        }
        i++;
      }
      questionText = questionText.trim();
      
      // Gather options
      const options = {};
      while (i < lines.length) {
        const optLine = lines[i].trim();
        if (optLine.match(/^Q\d+\./) || optLine.match(yearPattern)) break;
        if (optLine.match(/^Answer\s*[:]/i) || optLine.match(/^The correct option/i)) break;
        
        const optMatch = optLine.match(optionPattern);
        if (optMatch) {
          const optKey = optMatch[1].toLowerCase();
          let optText = optMatch[2].trim();
          i++;
          // Continue if option text spans multiple lines
          while (i < lines.length) {
            const cont = lines[i].trim();
            if (cont.match(optionPattern) || cont.match(/^Answer\s*[:]/i) || cont.match(/^The correct option/i) || cont.match(/^Q\d+\./) || cont.match(yearPattern)) break;
            if (cont) optText += ' ' + cont;
            i++;
          }
          options[optKey] = optText.trim();
        } else {
          i++;
        }
      }
      
      // Gather answer
      let correctAnswer = null;
      let explanation = '';
      
      while (i < lines.length) {
        const ansLine = lines[i].trim();
        if (ansLine.match(/^Q\d+\./) || ansLine.match(yearPattern)) break;
        
        // Check "The correct option is (x)"
        const correctOptMatch = ansLine.match(correctOptionPattern);
        if (correctOptMatch) {
          correctAnswer = correctOptMatch[1].toLowerCase();
          i++;
          // Gather explanation
          while (i < lines.length) {
            const expLine = lines[i].trim();
            if (expLine.match(/^Q\d+\./) || expLine.match(yearPattern)) break;
            if (expLine) explanation += ' ' + expLine;
            i++;
          }
          break;
        }
        
        // Check "Answer: (x) ..."
        const ansMatch = ansLine.match(answerPattern);
        if (ansMatch) {
          if (ansMatch[1]) {
            correctAnswer = ansMatch[1].toLowerCase();
          } else {
            // Try to extract from answer text like "Answer: (a) Sarnath"
            const innerMatch = (ansMatch[2] || '').match(/^\(([a-dA-D])\)/);
            if (innerMatch) {
              correctAnswer = innerMatch[1].toLowerCase();
            } else {
              // Answer text is like "(a)" or starts with a letter
              const simpleMatch = (ansMatch[2] || '').trim().match(/^([a-dA-D])\b/);
              if (simpleMatch) correctAnswer = simpleMatch[1].toLowerCase();
            }
          }
          i++;
          // Gather explanation
          while (i < lines.length) {
            const expLine = lines[i].trim();
            if (expLine.match(/^Q\d+\./) || expLine.match(yearPattern)) break;
            if (expLine) explanation += ' ' + expLine;
            i++;
          }
          break;
        }
        
        i++;
      }
      
      // Only add if we have valid question with options and answer
      if (questionText && Object.keys(options).length >= 2 && correctAnswer && options[correctAnswer]) {
        questions.push({
          id: `${subject.replace(/\s+/g, '_')}_${currentYear}_Q${qNum}`,
          subject,
          year: currentYear,
          questionNumber: qNum,
          question: questionText,
          options,
          answer: correctAnswer,
          explanation: explanation.trim().substring(0, 1000),
        });
      }
      continue;
    }
    
    i++;
  }
  
  return questions;
}

// Process all text files
const allBySubject = {};

const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.startsWith('linear_') && f.endsWith('.txt'));
console.log('Processing files:', files);

for (const file of files) {
  const baseName = file.replace('.txt', '');
  const subject = SUBJECT_MAP[baseName];
  if (!subject) {
    console.log(`No subject mapping for ${baseName}`);
    continue;
  }
  
  const text = fs.readFileSync(path.join(OUTPUT_DIR, file), 'utf-8');
  const questions = parseTextFile(text, subject);
  console.log(`${subject} (${file}): ${questions.length} questions`);
  
  if (!allBySubject[subject]) allBySubject[subject] = [];
  allBySubject[subject].push(...questions);
}

// Deduplicate by question text within same subject
for (const subject of Object.keys(allBySubject)) {
  const seen = new Set();
  const deduped = [];
  for (const q of allBySubject[subject]) {
    const key = q.question.toLowerCase().substring(0, 80);
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(q);
    }
  }
  console.log(`${subject}: ${allBySubject[subject].length} → ${deduped.length} (after dedup)`);
  allBySubject[subject] = deduped;
}

// Re-number IDs sequentially
for (const subject of Object.keys(allBySubject)) {
  allBySubject[subject].forEach((q, idx) => {
    q.id = `${subject.replace(/\s+/g, '_')}_${idx + 1}`;
  });
}

// Write output
const outputPath = path.join(OUTPUT_DIR, 'questions_by_subject.json');
fs.writeFileSync(outputPath, JSON.stringify(allBySubject, null, 2));
console.log('\nDone! Total questions:');
let total = 0;
for (const [subject, qs] of Object.entries(allBySubject)) {
  console.log(`  ${subject}: ${qs.length}`);
  total += qs.length;
}
console.log(`  TOTAL: ${total}`);
