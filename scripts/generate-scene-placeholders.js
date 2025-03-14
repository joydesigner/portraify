// This script generates placeholder images for scenes
// Run with: node scripts/generate-scene-placeholders.js

const fs = require('fs');
const path = require('path');

// Scene definitions
const scenes = [
  {
    id: 'professional',
    title: 'Professional',
    color: '#3B82F6', // blue-500
  },
  {
    id: 'passport',
    title: 'Passport/Visa',
    color: '#10B981', // emerald-500
  },
  {
    id: 'business',
    title: 'Business Meeting',
    color: '#6366F1', // indigo-500
  },
  {
    id: 'academic',
    title: 'Academic',
    color: '#8B5CF6', // violet-500
  },
  {
    id: 'social',
    title: 'Social Media',
    color: '#EC4899', // pink-500
  },
  {
    id: 'wedding',
    title: 'Wedding',
    color: '#F59E0B', // amber-500
  },
  {
    id: 'student',
    title: 'Student/Work ID',
    color: '#EF4444', // red-500
  },
  {
    id: 'virtual',
    title: 'Virtual Background',
    color: '#14B8A6', // teal-500
  },
];

// Create SVG placeholder for each scene
scenes.forEach(scene => {
  const svg = `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="400" fill="${scene.color}" />
    <rect x="0" y="300" width="400" height="100" fill="rgba(0,0,0,0.3)" />
    <text x="20" y="350" font-family="Arial" font-size="24" font-weight="bold" fill="white">${scene.title}</text>
    <circle cx="200" cy="150" r="80" fill="rgba(255,255,255,0.2)" />
    <circle cx="200" cy="150" r="40" fill="rgba(255,255,255,0.3)" />
  </svg>`;

  const outputDir = path.join(__dirname, '../public/scenes');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, `${scene.id}.svg`);
  fs.writeFileSync(outputPath, svg);
  console.log(`Created: ${outputPath}`);
});

console.log('All scene placeholders generated successfully!'); 