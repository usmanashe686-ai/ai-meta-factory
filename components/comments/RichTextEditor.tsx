import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import suggestion from './suggestion';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  AtSign,
  Send
} from 'lucide-react';

interface RichTextEditorProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  showMentions?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  onSubmit,
  placeholder = 'Add a comment...',
  autoFocus = true,
  showMentions = true
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      showMentions && Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion,
      }),
    ].filter(Boolean),
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[80px] p-3',
      },
    },
  });

  const handleSubmit = useCallback(async () => {
    if (!editor || !editor.getText().trim()) return;
    
    setIsSubmitting(true);
    const content = editor.getHTML();
    
    try {
      await onSubmit(content);
      editor.commands.clearContent();
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [editor, onSubmit]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && event.ctrlKey && editor?.getText().trim()) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [editor, handleSubmit]
  );

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('code') ? 'bg-gray-200' : ''}`}
          title="Code"
        >
          <Code className="w-4 h-4" />
        </button>
        
        {showMentions && (
          <button
            type="button"
            onClick={() => editor.chain().focus().insertContent('@').run()}
            className="p-2 rounded hover:bg-gray-200"
            title="Mention someone"
          >
            <AtSign className="w-4 h-4" />
          </button>
        )}
        
        <div className="flex-1" />
        
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !editor.getText().trim()}
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
            isSubmitting || !editor.getText().trim()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Sending...' : 'Comment'}
        </button>
      </div>
      
      <div onKeyDown={handleKeyDown}>
        <EditorContent 
          editor={editor} 
          autoFocus={autoFocus}
          className="min-h-[80px]"
        />
      </div>
      
      <div className="px-3 py-2 text-xs text-gray-500 border-t bg-gray-50">
        <kbd className="px-1 py-0.5 bg-gray-200 rounded border">Ctrl+Enter</kbd> to submit
      </div>
    </div>
  );
};
