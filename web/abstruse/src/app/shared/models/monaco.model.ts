export const monacoEditorOptions = {
  theme: 'blackboard',
  language: 'dockerfile',
  minimap: { enabled: false },
  fontFamily:
    'Rubik, BlinkMacSystemFont, -apple-system, "Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "Helvetica", "Arial", sans-serif',
  fontSize: '14px',
  fontWeight: '400',
  formatOnPaste: true,
  formatOnType: true,
  lineNumbers: 'on',
  lineDecoratorsWidth: 2,
  lineNumbersMinChars: 3,
  overviewRulerBorder: false,
  roundedSelection: false,
  renderLineHighlight: 'none',
  renderWhitespace: 'all',
  revealHorizontalRightPadding: 0,
  scrollBeyondLastLine: false,
  letterSpacing: 1,
  scrollbar: {
    vertical: 'hidden',
    horizontal: 'hidden',
    useShadows: false,
    horizontalHasArrows: false,
    horizontalScrollbarSize: 0,
    horizontalSlideSize: 0,
    verticalHasArrow: false,
    verticalScrollbarSize: 0,
    verticalSliderSize: 0
  }
};

export const blackboardTheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    {
      background: '0C1021',
      token: ''
    },
    {
      foreground: 'aeaeae',
      token: 'comment'
    },
    {
      foreground: 'd8fa3c',
      token: 'constant'
    },
    {
      foreground: 'ff6400',
      token: 'entity'
    },
    {
      foreground: 'fbde2d',
      token: 'keyword'
    },
    {
      foreground: 'fbde2d',
      token: 'storage'
    },
    {
      foreground: '61ce3c',
      token: 'string'
    },
    {
      foreground: '61ce3c',
      token: 'meta.verbatim'
    },
    {
      foreground: '8da6ce',
      token: 'support'
    },
    {
      foreground: 'ab2a1d',
      fontStyle: 'italic',
      token: 'invalid.deprecated'
    },
    {
      foreground: 'f8f8f8',
      background: '9d1e15',
      token: 'invalid.illegal'
    },
    {
      foreground: 'ff6400',
      fontStyle: 'italic',
      token: 'entity.other.inherited-class'
    },
    {
      foreground: 'ff6400',
      token: 'string constant.other.placeholder'
    },
    {
      foreground: '7f90aa',
      token: 'meta.tag'
    },
    {
      foreground: '7f90aa',
      token: 'meta.tag entity'
    },
    {
      foreground: 'ffffff',
      token: 'entity.name.section'
    },
    {
      foreground: 'd5e0f3',
      token: 'keyword.type.variant'
    }
  ],
  colors: {
    'editor.foreground': '#F8F8F8',
    'editor.background': '#2f3136',
    'editor.selectionBackground': '#010101',
    'editor.lineHighlightBackground': '#FFFFFF0F',
    'editorCursor.foreground': '#FFFFFFA6',
    'editorWhitespace.foreground': '#FFFFFF40'
  }
};
