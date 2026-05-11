import { createTheme } from '@mui/material/styles'

// Concordia University Wisconsin brand palette
const CUW_NAVY = '#003D82'
const CUW_NAVY_DARK = '#002759'
const CUW_NAVY_LIGHT = '#1B5BB8'
const CUW_BLUE = '#245699'
const CUW_GOLD = '#FFB81C'
const CUW_GOLD_DARK = '#E0A116'
const CUW_GRAY_LIGHT = '#F4F4F4'
const CUW_GRAY_DARK = '#4A4A4A'
const CUW_TEXT = '#1F2937'
const CUW_BORDER = '#E5E7EB'

const theme = createTheme({
  palette: {
    primary: {
      main: CUW_NAVY,
      light: CUW_NAVY_LIGHT,
      dark: CUW_NAVY_DARK,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: CUW_GOLD,
      light: '#FFD166',
      dark: CUW_GOLD_DARK,
      contrastText: CUW_NAVY_DARK,
    },
    info: {
      main: CUW_BLUE,
    },
    background: {
      default: CUW_GRAY_LIGHT,
      paper: '#FFFFFF',
    },
    text: {
      primary: CUW_TEXT,
      secondary: CUW_GRAY_DARK,
    },
    divider: CUW_BORDER,
  },
  typography: {
    fontFamily: '"Open Sans", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: '"Merriweather", Georgia, serif',
      fontWeight: 700,
      color: CUW_NAVY,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Merriweather", Georgia, serif',
      fontWeight: 700,
      color: CUW_NAVY,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Merriweather", Georgia, serif',
      fontWeight: 700,
      color: CUW_NAVY,
    },
    h4: {
      fontFamily: '"Merriweather", Georgia, serif',
      fontWeight: 700,
      color: CUW_NAVY,
    },
    h5: {
      fontFamily: '"Open Sans", sans-serif',
      fontWeight: 700,
      color: CUW_NAVY,
    },
    h6: {
      fontFamily: '"Open Sans", sans-serif',
      fontWeight: 700,
      color: CUW_NAVY,
    },
    button: {
      fontFamily: '"Open Sans", sans-serif',
      fontWeight: 700,
      letterSpacing: '0.04em',
    },
    body1: {
      color: CUW_TEXT,
    },
    body2: {
      color: CUW_TEXT,
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: '0.04em',
          borderRadius: 2,
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 22,
          paddingRight: 22,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: CUW_NAVY,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: CUW_NAVY_DARK,
          },
        },
        containedSecondary: {
          backgroundColor: CUW_GOLD,
          color: CUW_NAVY_DARK,
          '&:hover': {
            backgroundColor: CUW_GOLD_DARK,
          },
        },
        outlinedPrimary: {
          borderColor: CUW_NAVY,
          color: CUW_NAVY,
          borderWidth: 2,
          '&:hover': {
            borderColor: CUW_NAVY_DARK,
            backgroundColor: 'rgba(0, 61, 130, 0.06)',
            borderWidth: 2,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: CUW_NAVY,
          color: '#FFFFFF',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: '0.04em',
          fontSize: '0.85rem',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 2,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: CUW_NAVY,
          '& .MuiTableCell-head': {
            color: '#FFFFFF',
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '0.78rem',
            letterSpacing: '0.05em',
          },
        },
      },
    },
  },
})

export default theme
