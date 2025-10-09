import React, { useState } from 'react';
import axios from 'axios';
export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const upload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    const res = await axios.post('/api/ingest', form);
    alert(JSON.stringify(res.data, null, 2));
  };
  const ask = async () => {
    const res = await axios.post('/api/query', { question });
    setAnswer(res.data.answer);
  };
  return (
    <div style={{ fontFamily: 'system-ui', padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1>NotebookLM-Style Research Assistant</h1>
      <section style={{ marginBottom: 24 }}>
        <h3>Upload Source</h3>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={upload} style={{ marginLeft: 8 }}>Ingest</button>
      </section>
      <section style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <h3>Ask a Question</h3>
        <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about your sources..." style={{ width: '100%', padding: 8 }} />
        <button onClick={ask} style={{ marginTop: 8 }}>Ask</button>
        {answer && (<div style={{ background: '#f9f9f9', padding: 12, marginTop: 12, borderRadius: 6 }}><strong>Answer</strong><p>{answer}</p></div>)}
      </section>
    </div>
  );
}