#!/usr/bin/env node

/**
 * Script de nettoyage du projet Expo
 * Ce script supprime les fichiers de cache et remet le projet dans un état propre
 */

const fs = require('fs');
const path = require('path');

const filesToDelete = [
  'package-lock.json',
  'yarn.lock',
  'node_modules',
  '.expo',
  'dist',
  'web-build'
];

const deleteRecursive = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    if (fs.lstatSync(dirPath).isDirectory()) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`🗑️  Supprimé: ${dirPath}`);
    } else {
      fs.unlinkSync(dirPath);
      console.log(`🗑️  Supprimé: ${dirPath}`);
    }
  }
};

console.log('🧹 Nettoyage du projet...\n');

filesToDelete.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  deleteRecursive(filePath);
});

console.log('\n✅ Nettoyage terminé!');
console.log('\n📋 Prochaines étapes:');
console.log('1. npm install');
console.log('2. npx expo start');

module.exports = {};