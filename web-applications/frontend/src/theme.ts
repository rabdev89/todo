import { createTheme } from '@mui/material/styles'

// Tokens sourced from `web-applications/project-management/design/style_guide.json`
export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#027CEC' },
    background: { default: '#F2F8FD', paper: '#FFFFFF' },
    text: { primary: '#272D32', secondary: '#818D99' },
    error: { main: '#CA0061' },
    success: { main: '#009292' },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
})

