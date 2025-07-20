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
- Assign colors to codes for visual organization
- Add descriptions to codes for better documentation
- Import codes from CSV files with mapping interface
- Search and filter codes in real-time
- Inline editing with double-click functionality

### 📝 Segment Management
- Create text segments from uploaded documents
- Assign multiple codes to each segment
- Visual code tags with color coding
- Import segments from CSV files
- Interactive dropdown for code assignment with search
- Real-time filtering of segments

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

### 5. Export Data
- Click "Download CSV" in the header to export your coded data
- The CSV includes segment text and assigned codes

## CSV Import Format

### For Codes:
```csv
Name,Description,Color
"Positive Sentiment","Expressions of positive emotions","#22c55e"
"Negative Sentiment","Expressions of negative emotions","#ef4444"
```

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
│   └── components/
│       ├── CodeManager.jsx     # Code management interface
│       ├── SegmentManager.jsx  # Segment management interface
│       ├── DocumentDisplay.jsx # Document viewer
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
