import { Node, mergeAttributes } from '@tiptap/core'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface NoteLinkOptions {
  HTMLAttributes: Record<string, any>
  onNoteLinkClick?: (noteId: string, noteTitle: string) => void
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    noteLink: {
      /**
       * Set a note link
       */
      setNoteLink: (attributes: { noteId: string; noteTitle: string }) => ReturnType
      /**
       * Remove a note link at the current position
       */
      unsetNoteLink: () => ReturnType
    }
  }
}

export const NoteLink = Node.create<NoteLinkOptions>({
  name: 'noteLink',

  priority: 1000,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'note-link',
      },
      onNoteLinkClick: undefined,
    }
  },

  group: 'inline',

  inline: true,

  selectable: true,

  atom: true,

  addAttributes() {
    return {
      noteId: {
        default: null,
        parseHTML: element => element.getAttribute('data-note-id'),
        renderHTML: attributes => {
          if (!attributes.noteId) {
            return {}
          }
          return {
            'data-note-id': attributes.noteId,
          }
        },
      },
      noteTitle: {
        default: null,
        parseHTML: element => element.getAttribute('data-note-title'),
        renderHTML: attributes => {
          if (!attributes.noteTitle) {
            return {}
          }
          return {
            'data-note-title': attributes.noteTitle,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="note-link"]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'note-link',
      }),
      `[[${node.attrs.noteTitle || 'Untitled'}]]`,
    ]
  },

  renderText({ node }) {
    return `[[${node.attrs.noteTitle || 'Untitled'}]]`
  },

  addCommands() {
    return {
      setNoteLink:
        attributes =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          })
        },
      unsetNoteLink:
        () =>
        ({ commands }) => {
          return commands.deleteSelection()
        },
    }
  },

  addProseMirrorPlugins() {
    const options = this.options

    return [
      new Plugin({
        key: new PluginKey('noteLinkClick'),
        props: {
          handleClick(view, pos, event) {
            const target = event.target as HTMLElement
            if (target.getAttribute('data-type') === 'note-link') {
              const noteId = target.getAttribute('data-note-id')
              const noteTitle = target.getAttribute('data-note-title')
              if (noteId && noteTitle && options.onNoteLinkClick) {
                options.onNoteLinkClick(noteId, noteTitle)
                return true
              }
            }
            return false
          },
        },
      }),
    ]
  },
})

// Plugin to detect and highlight [[...]] patterns for auto-suggestion
export const noteLinkDetectionPlugin = (onTrigger: (query: string, from: number, to: number) => void) => {
  return new Plugin({
    key: new PluginKey('noteLinkDetection'),
    state: {
      init() {
        return DecorationSet.empty
      },
      apply(tr, set) {
        const { selection } = tr
        const { $from } = selection
        const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc')

        // Check if we're typing [[...]]
        const match = textBefore.match(/\[\[([^\]]*?)$/)

        if (match) {
          const query = match[1]
          const from = $from.pos - match[1].length - 2 // -2 for the [[
          const to = $from.pos

          // Trigger the suggestion callback
          onTrigger(query, from, to)
        }

        return set
      },
    },
  })
}
