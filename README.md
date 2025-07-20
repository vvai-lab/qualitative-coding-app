# Qualitative Coding App

A modern web application for qualitative data analysis, built with React and Vite. This tool helps researchers analyze text documents by creating codes, segmenting text, and assigning codes to segments for systematic qualitative analysis.

## 🌐 Live Demo

Try the app live at: **[https://vvai-lab.github.io/qualitative-coding-app/](https://vvai-lab.github.io/qualitative-coding-app/)**

## Features

### 📄 Document Management
- Upload and display text documents (.txt files)
- View document content with syntax highlighting
- Select and segment text for coding

### 🏷️ Code Management
- Create, edit, and delete qualitative codes
- **🎨 Automatic color assignment** with 24 distinct preset colors
- Add descriptions to codes for better documentation
- Import codes from CSV files with optional color column
- Search and filter codes in real-time
- Inline editing with double-click functionality
- Visual color indicators for easy code identification

### 📝 Segment Management
- Create text segments from uploaded documents
- Assign multiple codes to each segment
- Visual code tags with color coding
- Import segments from CSV files
- Interactive dropdown for code assignment with search
- Real-time filtering of segments
- **🤖 AI Auto-Coding**: Automatically assign relevant codes to segments using LLM analysis

### 📊 Data Export
- Export coded segments to CSV format
- Download includes segment text and assigned codes
- Clean CSV formatting for further analysis

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Compact, professional interface
- Drag-and-drop file uploads
- Real-time search functionality
- Card-based layouts with hover effects
- Smooth transitions and animations

## Technology Stack

- **Frontend**: React 18 with hooks
- **Build Tool**: Vite for fast development
- **Styling**: Tailwind CSS for utility-first styling
- **File Processing**: PapaParse for CSV handling
- **State Management**: React Context API
- **Data Persistence**: Local Storage

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vvai-lab/qualitative-coding-app.git
cd qualitative-coding-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🚀 Deployment

This app is automatically deployed to GitHub Pages when changes are pushed to the main branch.

### Manual Deployment to GitHub Pages

If you want to deploy manually:

1. Build the project:
```bash
npm run build
```

2. Deploy to GitHub Pages:
```bash
npm run deploy
```

### Setting up GitHub Pages (for maintainers)

1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Under "Source", select "GitHub Actions"
4. The app will automatically deploy when you push to the main branch

## Usage Guide

### 1. Upload a Document
- Click "Load Document" to upload a .txt file
- The document content will appear in the left panel

### 2. Create Codes
- Use the "Codes" panel on the right to create qualitative codes
- Double-click to edit code names and descriptions
- Click the color dot to change code colors
- Use the search bar to quickly find codes

### 3. Create Segments
- Select text from the document or import segments via CSV
- Use the middle panel to view and manage text segments

### 4. Assign Codes to Segments
- Click the dropdown on any segment to assign codes
- Use the search function to quickly find relevant codes
- Multiple codes can be assigned to each segment
- **🤖 Use AI Auto-Coding**: Click "Auto-Assign Codes" to let AI automatically assign relevant codes to all segments

### 5. Export Data
- Click "Download CSV" in the header to export your coded data
- The CSV includes segment text and assigned codes

## 🤖 AI Auto-Coding Setup

The app includes AI-powered automatic code assignment functionality that can analyze your text segments and assign relevant codes.

### OpenAI Configuration

For best results, configure OpenAI API access directly in the app:

1. **In the Segments panel**, click "AI Settings" to expand the configuration
2. **Enter your OpenAI API key** (starts with `sk-...`)
3. **Your API key is session-only** - not stored permanently for security
4. **Get your API key** from [OpenAI Platform](https://platform.openai.com/api-keys)

**Note**: You'll need to re-enter your API key each time you refresh the page for security reasons.

### Fallback Mode

If no API key is configured, the app will use a rule-based approach that matches keywords from code names and descriptions with segment text.

### How AI Auto-Coding Works

1. **Analysis**: The AI analyzes each text segment against your available codes
2. **Context Understanding**: Uses code names and descriptions to understand what each code represents
3. **Smart Assignment**: Assigns only relevant codes, can assign multiple codes per segment
4. **Quality Focus**: Designed to avoid over-coding by being conservative in assignments
5. **Security**: API keys are session-only and never stored permanently

## CSV Import Format

### For Codes:
```csv
Name,Description,Color
"Positive Sentiment","Expressions of positive emotions","#22c55e"
"Negative Sentiment","Expressions of negative emotions","#ef4444"
"Neutral Tone","Objective or neutral statements"
```

**Note**: The Color column is optional. If no color is provided or the color format is invalid, colors will be automatically assigned from a preset palette of 24 visually distinct colors.

### For Segments:
```csv
Text
"This is a sample text segment to be coded"
"Another segment of text for analysis"
```

## Project Structure

```
src/
├── App.jsx                 # Main application component
├── lib/
│   ├── models.js          # Data models (Project, Code, Segment, Document)
│   ├── localStorageService.js  # Data persistence
│   ├── csvMapperConfigs.js     # CSV import configurations
│   ├── autoCodingService.js    # AI auto-coding functionality
│   └── components/
│       ├── CodeManager.jsx     # Code management interface
│       ├── SegmentManager.jsx  # Segment management interface
│       ├── DocumentDisplay.jsx # Document viewer
│       ├── ApiKeySettings.jsx  # OpenAI API key configuration
│       ├── CsvUpload.jsx      # Generic CSV upload component
│       ├── CsvMapper.jsx      # CSV column mapping interface
│       └── FileUpload.jsx     # File upload with drag & drop
```

## Architecture Highlights

- **Component-driven design** with reusable, modular components
- **Configuration-driven CSV import** system for extensibility
- **Generic CSV mapper** eliminates code duplication
- **Responsive flex layouts** with proper scrolling behavior
- **Real-time search** across both codes and segments
- **AI-powered auto-coding** with OpenAI integration and rule-based fallback
- **Automatic color assignment** with 24 preset colors and smart collision detection
- **Consistent naming conventions** and clean code organization

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality

The project follows modern React best practices:
- Functional components with hooks
- Proper state management
- Component composition
- DRY principles with reusable components
- Consistent styling with Tailwind CSS

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React and Vite for modern development experience
- Styled with Tailwind CSS for rapid UI development
- CSV processing powered by PapaParse library
