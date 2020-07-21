export const monacoEditorOptions = {
  theme: 'blackboard',
  language: 'dockerfile',
  minimap: { enabled: false },
  fontFamily: 'Roboto, sans-serif',
  fontSize: '13px',
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

export const customTheme = {
  base: 'vs',
  inherit: true,
  rules: [
    {
      foreground: '919191',
      token: 'comment'
    },
    {
      foreground: '4E5859',
      token: 'string'
    },
    {
      foreground: '48bb78',
      token: 'type'
    },
    {
      foreground: '4E5859',
      token: 'type.delimiter'
    },
    {
      foreground: '4E5859',
      token: 'predefined'
    },
    {
      foreground: '4E5859',
      token: 'namespace'
    },
    {
      foreground: '4E5859',
      token: 'constructor'
    },
    {
      foreground: 'a535ae',
      token: 'constant.language'
    },
    {
      foreground: '48bb78',
      token: 'keyword'
    },
    {
      foreground: '48bb78',
      token: 'storage'
    },
    {
      foreground: '21439c',
      token: 'entity.name.type'
    },
    {
      foreground: '21439c',
      token: 'entity.name.function'
    },
    {
      foreground: 'a535ae',
      token: 'support.function'
    },
    {
      foreground: 'a535ae',
      token: 'support.constant'
    },
    {
      foreground: 'a535ae',
      token: 'support.type'
    },
    {
      foreground: 'a535ae',
      token: 'support.class'
    },
    {
      foreground: 'a535ae',
      token: 'support.variable'
    },
    {
      foreground: 'ffffff',
      background: '990000',
      token: 'invalid'
    },
    {
      foreground: '990000',
      token: 'constant.other.placeholder.py'
    }
  ],
  colors: {
    'editor.foreground': '#4E5859',
    'editor.background': '#FFFFFF',
    'editor.selectionBackground': '#f0fff4',
    'editor.lineHighlightBackground': '#48bb7812',
    'editorCursor.foreground': '#000000',
    'editorWhitespace.foreground': '#FFFFFF'
  }
};
