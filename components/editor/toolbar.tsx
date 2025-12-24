"use client";

import { Editor } from "@tiptap/react";
import { useState, useEffect, useRef } from "react";
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, List, ListOrdered, Quote, Heading1, Heading2, Heading3, Undo, Redo, Image as ImageIcon, Loader2 } from "lucide-react";

interface EditorToolbarProps {
  editor: Editor;
  onImageUpload?: (file: File) => Promise<string | null>;
  isUploadingImage?: boolean;
}

export default function EditorToolbar({ editor, onImageUpload, isUploadingImage = false }: EditorToolbarProps) {
  const [, setUpdateTrigger] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateToolbar = () => {
      setUpdateTrigger((prev) => prev + 1);
    };

    editor.on("selectionUpdate", updateToolbar);
    editor.on("transaction", updateToolbar);

    return () => {
      editor.off("selectionUpdate", updateToolbar);
      editor.off("transaction", updateToolbar);
    };
  }, [editor]);

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    if (onImageUpload) {
      const url = await onImageUpload(file);
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }

    // Reset input
    event.target.value = '';
  };

  const ToolbarButton = ({ onClick, isActive = false, children, title }: { onClick: () => void; isActive?: boolean; children: React.ReactNode; title: string }) => (
    <button
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      type="button"
      title={title}
      className="p-2 rounded transition-colors duration-300 cursor-pointer"
      style={{
        backgroundColor: isActive ? 'var(--surface-hover)' : 'transparent',
        color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
      }}
      onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
      onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold (Ctrl+B)">
        <Bold size={18} />
      </ToolbarButton>

      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic (Ctrl+I)">
        <Italic size={18} />
      </ToolbarButton>

      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Underline (Ctrl+U)">
        <UnderlineIcon size={18} />
      </ToolbarButton>

      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title="Strikethrough">
        <Strikethrough size={18} />
      </ToolbarButton>

      <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive("code")} title="Code">
        <Code size={18} />
      </ToolbarButton>

      <div className="w-px h-8 mx-1" style={{ backgroundColor: 'var(--border)' }} />

      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })} title="Heading 1">
        <Heading1 size={18} />
      </ToolbarButton>

      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="Heading 2">
        <Heading2 size={18} />
      </ToolbarButton>

      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} title="Heading 3">
        <Heading3 size={18} />
      </ToolbarButton>

      <div className="w-px h-8 mx-1" style={{ backgroundColor: 'var(--border)' }} />

      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Bullet List">
        <List size={18} />
      </ToolbarButton>

      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Numbered List">
        <ListOrdered size={18} />
      </ToolbarButton>

      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="Quote">
        <Quote size={18} />
      </ToolbarButton>

      <div className="w-px h-8 mx-1" style={{ backgroundColor: 'var(--border)' }} />

      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)">
        <Undo size={18} />
      </ToolbarButton>

      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Shift+Z)">
        <Redo size={18} />
      </ToolbarButton>

      {onImageUpload && (
        <>
          <div className="w-px h-8 mx-1" style={{ backgroundColor: 'var(--border)' }} />

          <ToolbarButton
            onClick={handleImageButtonClick}
            isActive={false}
            title="Insert Image"
          >
            {isUploadingImage ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
          </ToolbarButton>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            onChange={handleImageSelect}
            className="hidden"
            disabled={isUploadingImage}
          />
        </>
      )}
    </div>
  );
}

