import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Calculator, PenLine, Cross } from 'lucide-react';

// ─── Question bank by grade band ─────────────────────────────────────────────

const READING_QUESTIONS = {
  'K-2': [
    { id: 'r1', q: 'Which word rhymes with "cat"?', opts: ['Dog', 'Hat', 'Sun', 'Cup'], answer: 'Hat' },
    { id: 'r2', q: 'What is the first letter of the word "apple"?', opts: ['B', 'P', 'A', 'E'], answer: 'A' },
    { id: 'r3', q: 'Read this sentence: "The dog ran fast." What did the dog do?', opts: ['Slept', 'Ate', 'Ran', 'Swam'], answer: 'Ran' },
    { id: 'r4', q: 'Which word means the opposite of "big"?', opts: ['Large', 'Tall', 'Small', 'Wide'], answer: 'Small' },
    { id: 'r5', q: 'How many syllables are in the word "butterfly"?', opts: ['1', '2', '3', '4'], answer: '3' },
  ],
  '3-5': [
    { id: 'r1', q: 'What is the main idea of a paragraph?', opts: ['The last sentence', 'The most important point', 'A supporting detail', 'The title'], answer: 'The most important point' },
    { id: 'r2', q: '"The old ship creaked like ancient bones." This is an example of:', opts: ['Fact', 'Simile', 'Definition', 'Summary'], answer: 'Simile' },
    { id: 'r3', q: 'If a story takes place "at the crack of dawn," when does it happen?', opts: ['Late at night', 'Early morning', 'Noon', 'Dusk'], answer: 'Early morning' },
    { id: 'r4', q: 'What does the word "exhausted" most likely mean?', opts: ['Excited', 'Very tired', 'Hungry', 'Confused'], answer: 'Very tired' },
    { id: 'r5', q: 'Which sentence is a fact rather than an opinion?', opts: ['"Cats are the best pets."', '"Dogs are more fun than cats."', '"A cat has four legs."', '"Everyone loves animals."'], answer: '"A cat has four legs."' },
  ],
  '6-8': [
    { id: 'r1', q: 'Which literary device is used in: "The wind whispered secrets to the trees"?', opts: ['Simile', 'Personification', 'Hyperbole', 'Alliteration'], answer: 'Personification' },
    { id: 'r2', q: 'What is the purpose of a thesis statement?', opts: ['To conclude an essay', 'To state the main argument', 'To list evidence', 'To introduce a quote'], answer: 'To state the main argument' },
    { id: 'r3', q: 'An author\'s "tone" refers to:', opts: ['The volume of writing', 'The attitude toward the subject', 'The length of the piece', 'The setting of the story'], answer: 'The attitude toward the subject' },
    { id: 'r4', q: 'What does "infer" mean in reading?', opts: ['Copy exactly', 'Look up in a dictionary', 'Draw a conclusion from clues', 'Summarize the text'], answer: 'Draw a conclusion from clues' },
    { id: 'r5', q: 'Which transition word signals contrast?', opts: ['Furthermore', 'Therefore', 'However', 'Similarly'], answer: 'However' },
  ],
  '9-12': [
    { id: 'r1', q: 'In literary analysis, "theme" refers to:', opts: ['The setting of the story', 'The central message or insight', 'The main character\'s name', 'The genre of the work'], answer: 'The central message or insight' },
    { id: 'r2', q: 'Which rhetorical appeal relies on credibility and trustworthiness?', opts: ['Pathos', 'Logos', 'Ethos', 'Kairos'], answer: 'Ethos' },
    { id: 'r3', q: '"Dramatic irony" occurs when:', opts: ['A character says something funny', 'The audience knows more than the character', 'Two characters disagree', 'The setting changes unexpectedly'], answer: 'The audience knows more than the character' },
    { id: 'r4', q: 'What is the function of a counterargument in persuasive writing?', opts: ['To agree with the reader', 'To acknowledge and refute opposing views', 'To introduce new topics', 'To end the essay'], answer: 'To acknowledge and refute opposing views' },
    { id: 'r5', q: 'Which of the following is an example of a primary source?', opts: ['A textbook chapter', 'A journal article analyzing a poem', 'A diary entry from the Civil War', 'A biography'], answer: 'A diary entry from the Civil War' },
  ],
};

const MATH_QUESTIONS = {
  'K-2': [
    { id: 'm1', q: 'What is 3 + 4?', opts: ['6', '7', '8', '5'], answer: '7' },
    { id: 'm2', q: 'Which number comes after 9?', opts: ['8', '11', '10', '7'], answer: '10' },
    { id: 'm3', q: 'How many sides does a triangle have?', opts: ['2', '4', '3', '5'], answer: '3' },
    { id: 'm4', q: 'What is 8 - 3?', opts: ['4', '6', '5', '3'], answer: '5' },
    { id: 'm5', q: 'Count the group: 🐱🐱🐱🐱🐱 — How many cats?', opts: ['4', '6', '5', '3'], answer: '5' },
  ],
  '3-5': [
    { id: 'm1', q: 'What is 7 × 8?', opts: ['54', '56', '48', '64'], answer: '56' },
    { id: 'm2', q: 'What is 1/2 + 1/4?', opts: ['2/6', '3/4', '2/4', '1/3'], answer: '3/4' },
    { id: 'm3', q: 'Round 347 to the nearest hundred.', opts: ['300', '400', '350', '340'], answer: '300' },
    { id: 'm4', q: 'What is the area of a rectangle with length 6 and width 4?', opts: ['10', '20', '24', '18'], answer: '24' },
    { id: 'm5', q: 'What is 504 ÷ 6?', opts: ['84', '86', '80', '90'], answer: '84' },
  ],
  '6-8': [
    { id: 'm1', q: 'Solve for x: 3x + 5 = 20', opts: ['x = 3', 'x = 5', 'x = 4', 'x = 6'], answer: 'x = 5' },
    { id: 'm2', q: 'What is 30% of 150?', opts: ['30', '45', '50', '35'], answer: '45' },
    { id: 'm3', q: 'What is the slope of the line y = 2x + 3?', opts: ['3', '2', '5', '1'], answer: '2' },
    { id: 'm4', q: 'Simplify: 4(2x - 3)', opts: ['8x - 3', '6x - 7', '8x - 12', '2x - 12'], answer: '8x - 12' },
    { id: 'm5', q: 'What is the volume of a cube with side length 3?', opts: ['9', '27', '18', '12'], answer: '27' },
  ],
  '9-12': [
    { id: 'm1', q: 'What are the solutions to x² - 5x + 6 = 0?', opts: ['x = 2, x = 3', 'x = -2, x = -3', 'x = 1, x = 6', 'x = -1, x = 6'], answer: 'x = 2, x = 3' },
    { id: 'm2', q: 'What is sin(90°)?', opts: ['0', '0.5', '1', '√2/2'], answer: '1' },
    { id: 'm3', q: 'The slope of a line perpendicular to y = 3x + 1 is:', opts: ['3', '-3', '1/3', '-1/3'], answer: '-1/3' },
    { id: 'm4', q: 'Evaluate: log₂(8)', opts: ['2', '4', '3', '8'], answer: '3' },
    { id: 'm5', q: 'If f(x) = x² + 2x, what is f(3)?', opts: ['9', '15', '11', '12'], answer: '15' },
  ],
};

const BIBLICAL_QUESTIONS = {
  'K-2': [
    { id: 'b1', q: 'Who built a big boat to save the animals?', opts: ['Moses', 'Noah', 'David', 'Abraham'], answer: 'Noah' },
    { id: 'b2', q: 'Who is Jesus?', opts: ['A king of Israel', 'The Son of God', 'A prophet only', 'A Roman soldier'], answer: 'The Son of God' },
    { id: 'b3', q: 'What is prayer?', opts: ['Reading a book', 'Talking to God', 'Singing a song', 'Going to church'], answer: 'Talking to God' },
    { id: 'b4', q: 'God created the world in how many days?', opts: ['5', '10', '6', '7'], answer: '6' },
    { id: 'b5', q: 'Who was swallowed by a big fish?', opts: ['Jonah', 'Job', 'Elijah', 'Isaiah'], answer: 'Jonah' },
  ],
  '3-5': [
    { id: 'b1', q: 'Which book of the Bible comes first?', opts: ['Exodus', 'Genesis', 'Psalms', 'Matthew'], answer: 'Genesis' },
    { id: 'b2', q: 'What were the two greatest commandments Jesus named?', opts: ['Honor parents and don\'t steal', 'Love God and love your neighbor', 'Pray and fast', 'Obey rulers and give tithes'], answer: 'Love God and love your neighbor' },
    { id: 'b3', q: 'Who were the first two humans God created?', opts: ['Cain and Abel', 'Noah and Eve', 'Adam and Eve', 'Abraham and Sarah'], answer: 'Adam and Eve' },
    { id: 'b4', q: 'What is the Psalms known for?', opts: ['Laws of Moses', 'Songs and prayers', 'Stories of kings', 'Letters to churches'], answer: 'Songs and prayers' },
    { id: 'b5', q: 'What did Jesus use to feed 5,000 people?', opts: ['Manna from heaven', 'Fish and bread', 'Fruit from a tree', 'Water turned to juice'], answer: 'Fish and bread' },
  ],
  '6-8': [
    { id: 'b1', q: 'What is the central message of the Gospel?', opts: ['Follow the law perfectly', 'Salvation through faith in Jesus Christ', 'Be a good person', 'Join a church'], answer: 'Salvation through faith in Jesus Christ' },
    { id: 'b2', q: 'Which letter did Paul write to address justification by faith?', opts: ['Hebrews', 'James', 'Romans', 'Revelation'], answer: 'Romans' },
    { id: 'b3', q: 'What does "sanctification" mean?', opts: ['Being saved', 'The process of becoming holy', 'Water baptism', 'Church membership'], answer: 'The process of becoming holy' },
    { id: 'b4', q: 'Which Old Testament book contains the Ten Commandments?', opts: ['Leviticus', 'Genesis', 'Exodus', 'Deuteronomy'], answer: 'Exodus' },
    { id: 'b5', q: 'What is the "Great Commission"?', opts: ['Give to the poor', 'Make disciples of all nations', 'Build the Temple', 'Keep the Sabbath'], answer: 'Make disciples of all nations' },
  ],
  '9-12': [
    { id: 'b1', q: 'What is the theological term for God\'s all-knowing nature?', opts: ['Omnipotent', 'Omnipresent', 'Omniscient', 'Immutable'], answer: 'Omniscient' },
    { id: 'b2', q: 'What does "propitiation" mean in Christian theology?', opts: ['Eternal punishment', 'Satisfying God\'s wrath through Christ\'s sacrifice', 'Receiving the Holy Spirit', 'Water baptism'], answer: 'Satisfying God\'s wrath through Christ\'s sacrifice' },
    { id: 'b3', q: 'Which council in 325 AD affirmed Christ\'s divinity?', opts: ['Council of Trent', 'Council of Nicea', 'Council of Jerusalem', 'Council of Ephesus'], answer: 'Council of Nicea' },
    { id: 'b4', q: 'The doctrine of "Total Depravity" teaches that:', opts: ['Humans are as bad as they could possibly be', 'Sin affects every part of human nature', 'People cannot be saved', 'Salvation requires perfect obedience'], answer: 'Sin affects every part of human nature' },
    { id: 'b5', q: 'What is "apologetics"?', opts: ['Saying sorry for sins', 'The rational defense of the Christian faith', 'Studying the end times', 'Writing prayers'], answer: 'The rational defense of the Christian faith' },
  ],
};

const WRITING_PROMPTS = {
  'K-2': { prompt: 'Draw a picture in your mind and write 2–3 sentences about something you are thankful to God for.', minWords: 10 },
  '3-5': { prompt: 'Write one paragraph about a time you helped someone. How did it make you feel, and what does it show about your character?', minWords: 40 },
  '6-8': { prompt: 'Write 2–3 paragraphs about a challenge you have faced. What did it teach you about perseverance and faith?', minWords: 80 },
  '9-12': { prompt: 'Write 3–4 paragraphs arguing whether a person\'s character matters more than their talent or skills. Use specific examples and biblical principles to support your position.', minWords: 150 },
};

// ─── Scoring helpers ──────────────────────────────────────────────────────────
function scoreSubject(correct, total) {
  const pct = (correct / total) * 100;
  if (pct >= 91) return { level: 'Advanced',    color: '#2D6A4F', bg: '#d1fae5' };
  if (pct >= 76) return { level: 'Proficient',  color: '#1B3A5C', bg: '#dbeafe' };
  if (pct >= 51) return { level: 'Developing',  color: '#C5972B', bg: '#fef3c7' };
  return            { level: 'Beginning',   color: '#991b1b', bg: '#fee2e2' };
}

function getGradeBand(age) {
  if (age <= 7)  return 'K-2';
  if (age <= 11) return '3-5';
  if (age <= 14) return '6-8';
  return '9-12';
}

// ─── MC Question component ────────────────────────────────────────────────────
function MCQuestion({ number, question, options, selected, onSelect }) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <p className="text-sm font-semibold text-gray-800 mb-3">{number}. {question}</p>
      <div className="space-y-2">
        {options.map(opt => (
          <div key={opt}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
              ${selected === opt ? 'border-[#1B3A5C] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            onClick={() => onSelect(opt)}>
            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center
              ${selected === opt ? 'border-[#1B3A5C]' : 'border-gray-300'}`}>
              {selected === opt && <div className="w-2 h-2 rounded-full bg-[#1B3A5C]" />}
            </div>
            <span className="text-sm">{opt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Subject icons ────────────────────────────────────────────────────────────
const SUBJECT_CONFIG = [
  { key: 'reading',  label: 'Reading / Language Arts', icon: BookOpen,   color: '#1B3A5C' },
  { key: 'math',     label: 'Mathematics',             icon: Calculator,  color: '#2D6A4F' },
  { key: 'writing',  label: 'Writing',                 icon: PenLine,     color: '#C5972B' },
  { key: 'biblical', label: 'Biblical Knowledge',      icon: Cross,       color: '#6B3FA0' },
];

// ─── Main PlacementTest component ────────────────────────────────────────────
export default function PlacementTest({ data, onComplete, onBack }) {
  const age = data.age || 10;
  const band = getGradeBand(age);

  const readingQs  = READING_QUESTIONS[band];
  const mathQs     = MATH_QUESTIONS[band];
  const biblicalQs = BIBLICAL_QUESTIONS[band];
  const writingCfg = WRITING_PROMPTS[band];

  const [subject, setSubject] = useState(0); // 0=reading, 1=math, 2=writing, 3=biblical
  const [answers, setAnswers] = useState({ reading: {}, math: {}, writing: '', biblical: {} });
  const [errors, setErrors] = useState({});

  const totalSubjects = 4;
  const progress = ((subject) / totalSubjects) * 100;

  const setAnswer = (subKey, qId, value) => {
    setAnswers(prev => ({ ...prev, [subKey]: typeof prev[subKey] === 'string' ? value : { ...prev[subKey], [qId]: value } }));
    setErrors(prev => ({ ...prev, [subKey]: '' }));
  };

  const validateSubject = () => {
    if (subject === 0) {
      const missing = readingQs.filter(q => !answers.reading[q.id]);
      if (missing.length > 0) { setErrors({ reading: 'Please answer all questions before continuing.' }); return false; }
    }
    if (subject === 1) {
      const missing = mathQs.filter(q => !answers.math[q.id]);
      if (missing.length > 0) { setErrors({ math: 'Please answer all questions before continuing.' }); return false; }
    }
    if (subject === 2) {
      const wordCount = answers.writing.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount < writingCfg.minWords) {
        setErrors({ writing: `Please write at least ${writingCfg.minWords} words. (Current: ${wordCount})` });
        return false;
      }
    }
    if (subject === 3) {
      const missing = biblicalQs.filter(q => !answers.biblical[q.id]);
      if (missing.length > 0) { setErrors({ biblical: 'Please answer all questions before continuing.' }); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateSubject()) return;
    if (subject < 3) {
      setSubject(subject + 1);
      window.scrollTo(0, 0);
    } else {
      // Score everything
      const readingCorrect  = readingQs.filter(q => answers.reading[q.id] === q.answer).length;
      const mathCorrect     = mathQs.filter(q => answers.math[q.id] === q.answer).length;
      const biblicalCorrect = biblicalQs.filter(q => answers.biblical[q.id] === q.answer).length;

      const scores = {
        reading:  { correct: readingCorrect,  total: readingQs.length,  ...scoreSubject(readingCorrect, readingQs.length) },
        math:     { correct: mathCorrect,      total: mathQs.length,      ...scoreSubject(mathCorrect, mathQs.length) },
        writing:  { response: answers.writing, total: 20, level: 'To be reviewed', color: '#C5972B', bg: '#fef3c7' },
        biblical: { correct: biblicalCorrect,  total: biblicalQs.length,  ...scoreSubject(biblicalCorrect, biblicalQs.length) },
        grade_band: band,
        test_completed_at: new Date().toISOString(),
      };

      onComplete({ placement_scores: scores, placement_answers: answers });
    }
  };

  const cfg = SUBJECT_CONFIG[subject];
  const Icon = cfg.icon;

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="rounded-t-xl pb-4" style={{ background: 'linear-gradient(135deg, #1B3A5C, #2a5485)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#C5972B' }}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Placement Test — {cfg.label}</CardTitle>
              <p className="text-blue-200 text-sm mt-0.5">
                Subject {subject + 1} of 4 · Grade band: {band} · Age {age}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={progress + 25} className="h-1.5 bg-blue-900" />
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Subject tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {SUBJECT_CONFIG.map((s, i) => {
            const SIcon = s.icon;
            return (
              <div key={s.key}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
                  ${i === subject ? 'text-white shadow' : i < subject ? 'text-green-700 bg-green-50 border border-green-200' : 'text-gray-400 bg-gray-100'}`}
                style={i === subject ? { backgroundColor: s.color } : {}}>
                <SIcon className="w-3.5 h-3.5" />
                {s.label}
                {i < subject && ' ✓'}
              </div>
            );
          })}
        </div>

        {/* Intro note */}
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
          <strong>Note for parents:</strong> This test helps RLCA understand your child's current level — not to judge or exclude.
          Results are used for placement planning only. K–2 parents may read questions aloud.
        </div>

        {/* Reading */}
        {subject === 0 && (
          <div className="space-y-4">
            {readingQs.map((q, i) => (
              <MCQuestion key={q.id} number={i + 1} question={q.q} options={q.opts}
                selected={answers.reading[q.id]} onSelect={v => setAnswer('reading', q.id, v)} />
            ))}
            {errors.reading && <p className="text-red-500 text-sm">{errors.reading}</p>}
          </div>
        )}

        {/* Math */}
        {subject === 1 && (
          <div className="space-y-4">
            {mathQs.map((q, i) => (
              <MCQuestion key={q.id} number={i + 1} question={q.q} options={q.opts}
                selected={answers.math[q.id]} onSelect={v => setAnswer('math', q.id, v)} />
            ))}
            {errors.math && <p className="text-red-500 text-sm">{errors.math}</p>}
          </div>
        )}

        {/* Writing */}
        {subject === 2 && (
          <div className="space-y-4">
            <div className="p-5 rounded-xl border-2 border-[#C5972B] bg-amber-50">
              <p className="text-sm font-semibold text-gray-800 mb-1">Writing Prompt:</p>
              <p className="text-gray-700 leading-relaxed">{writingCfg.prompt}</p>
              <p className="text-xs text-gray-500 mt-2">Minimum: {writingCfg.minWords} words</p>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-semibold text-gray-700">Your child's response:</Label>
              <Textarea
                value={answers.writing}
                onChange={e => setAnswer('writing', null, e.target.value)}
                placeholder="Type your response here..."
                rows={8}
                className={errors.writing ? 'border-red-400' : ''}
              />
              <p className="text-xs text-gray-400 mt-1">
                Word count: {answers.writing.trim().split(/\s+/).filter(Boolean).length}
              </p>
              {errors.writing && <p className="text-red-500 text-sm mt-1">{errors.writing}</p>}
            </div>
          </div>
        )}

        {/* Biblical */}
        {subject === 3 && (
          <div className="space-y-4">
            {biblicalQs.map((q, i) => (
              <MCQuestion key={q.id} number={i + 1} question={q.q} options={q.opts}
                selected={answers.biblical[q.id]} onSelect={v => setAnswer('biblical', q.id, v)} />
            ))}
            {errors.biblical && <p className="text-red-500 text-sm">{errors.biblical}</p>}
          </div>
        )}

        <div className="flex justify-between mt-8 pt-4 border-t">
          <Button type="button" variant="outline" onClick={subject === 0 ? onBack : () => setSubject(subject - 1)}>
            Back
          </Button>
          <Button onClick={handleNext} style={{ background: 'linear-gradient(135deg, #1B3A5C, #2a5485)' }} className="text-white px-8">
            {subject < 3 ? 'Next Subject →' : 'See My Results →'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
