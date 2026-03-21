#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoDataPath = path.join(__dirname, 'web-applications', 'repo_data');

console.log('🔍 Checking repo_data directory...');

if (!fs.existsSync(repoDataPath)) {
  console.log('❌ repo_data directory not found');
  console.log('🚀 Running npm run make:setup-index to generate repo_data...');
  
  try {
    execSync('npm run make:setup-index', { stdio: 'inherit', cwd: __dirname });
    console.log('✅ repo_data generated successfully');
  } catch (error) {
    console.error('❌ Failed to generate repo_data:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ repo_data directory exists');
  
  // Check if essential files exist
  const requiredFiles = ['files.json', 'imports.json', 'chunks.json', 'symbols.json'];
  const missingFiles = requiredFiles.filter(file => 
    !fs.existsSync(path.join(repoDataPath, file))
  );
  
  if (missingFiles.length > 0) {
    console.log(`❌ Missing repo_data files: ${missingFiles.join(', ')}`);
    console.log('🚀 Regenerating repo_data...');
    
    try {
      execSync('npm run make:setup-index', { stdio: 'inherit', cwd: __dirname });
      console.log('✅ repo_data regenerated successfully');
    } catch (error) {
      console.error('❌ Failed to regenerate repo_data:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✅ All required repo_data files present');
  }
}

console.log('🎉 repo_data is ready for use');
