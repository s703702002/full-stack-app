import { useState, SubmitEvent } from 'react';
import Button from './Button';

interface PostFormProps {
  onSubmit: (content: string) => Promise<void> | void;
}

export default function PostForm({ onSubmit }: PostFormProps) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await onSubmit(content);

    setContent('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8"
    >
      <textarea
        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
        rows={3}
        placeholder="說點什麼吧..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="text-right mt-3">
        <Button type="submit" disabled={!content.trim()}>
          發布留言
        </Button>
      </div>
    </form>
  );
}
