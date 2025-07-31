// Debug script to test imports
console.log('Starting debug...');

try {
  require('dotenv').config();
  console.log('✅ dotenv loaded');
  
  const express = require('express');
  console.log('✅ express loaded');
  
  // Test if ts-node can compile a simple TypeScript file
  const { execSync } = require('child_process');
  
  console.log('Testing TypeScript compilation...');
  execSync('npx ts-node -e "console.log(\'TypeScript works\')"', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Error:', error.message);
}