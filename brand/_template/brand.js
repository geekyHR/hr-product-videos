// Brand settings for one organisation. Copy this folder to brand/<org>/ and fill it from the brand guidelines.
// Sample colours from the guideline PDF itself; do not guess them. Paths are relative to a project's index.html.
window.BRAND = {
  name: 'Example Org',
  colors: {
    background: '#14213D',   // main video background
    text: '#FFFFFF',
    palette: {               // used by scenes.js as E.C.<name>
      primary: '#14213D',
      accent: '#FCA311',
      secondary: '#3D5A80',
      soft1: '#E5E5E5',
      soft2: '#98C1D9',
      soft3: '#EE6C4D',
      paper: '#F4F4F2',
    },
  },
  font: {
    family: 'Inter',          // the brand font name; put the font files in brand/<org>/fonts/ and list them below
    files: [],                // e.g. [{ url: '../../brand/<org>/fonts/Brand-Light.otf', weight: 300 }]
  },
  logo: {
    onDark: '',               // e.g. '../../brand/<org>/logos/logo-white.png'
    onLight: '',
  },
};
