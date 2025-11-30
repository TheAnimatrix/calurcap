#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('\n🚀 Calurcap Setup Wizard\n');
  console.log('This script will update your project configuration.\n');

  const appName = await question('Enter App Name (e.g., My App): ') || 'Calurcap';
  const appId = await question('Enter App ID (e.g., com.example.app): ') || 'com.avarnic.calurcap';
  const supabaseUrl = await question('Enter Supabase URL (optional): ');
  const supabaseKey = await question('Enter Supabase Anon Key (optional): ');
  const googleClientId = await question('Enter Google Web Client ID (optional): ');

  console.log('\nUpdating files...\n');

  // 1. Update package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    pkg.name = appName.toLowerCase().replace(/\s+/g, '-');
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, '\t'));
    console.log('✅ Updated package.json');
  }

  // 2. Update capacitor.config.ts
  const capConfigPath = path.join(process.cwd(), 'capacitor.config.ts');
  if (fs.existsSync(capConfigPath)) {
    let content = fs.readFileSync(capConfigPath, 'utf-8');
    content = content.replace(/appId: '.*'/, `appId: '${appId}'`);
    content = content.replace(/appName: '.*'/, `appName: '${appName}'`);
    if (googleClientId) {
      content = content.replace(/serverClientId: '.*'/, `serverClientId: '${googleClientId}'`);
    }
    fs.writeFileSync(capConfigPath, content);
    console.log('✅ Updated capacitor.config.ts');
  }

  // 3. Update android/app/build.gradle
  const gradlePath = path.join(process.cwd(), 'android/app/build.gradle');
  if (fs.existsSync(gradlePath)) {
    let content = fs.readFileSync(gradlePath, 'utf-8');
    content = content.replace(/namespace ".*"/, `namespace "${appId}"`);
    content = content.replace(/applicationId ".*"/, `applicationId "${appId}"`);
    fs.writeFileSync(gradlePath, content);
    console.log('✅ Updated android/app/build.gradle');
  }

  // 4. Update src/lib/supabaseClient.ts
  // 4. Update src/lib/supabaseClient.ts
  if (supabaseUrl || supabaseKey) {
    const supabasePath = path.join(process.cwd(), 'src/lib/supabaseClient.ts');
    if (fs.existsSync(supabasePath)) {
      let content = fs.readFileSync(supabasePath, 'utf-8');
      if (supabaseUrl) content = content.replace(/VITE_SUPABASE_URL \|\| '.*'/, `VITE_SUPABASE_URL || '${supabaseUrl}'`);
      if (supabaseKey) content = content.replace(/VITE_SUPABASE_ANON_KEY \|\| '.*'/, `VITE_SUPABASE_ANON_KEY || '${supabaseKey}'`);
      fs.writeFileSync(supabasePath, content);
      console.log('✅ Updated src/lib/supabaseClient.ts');
    }
  }

  // 5. Update android/app/src/main/res/values/strings.xml
  const stringsXmlPath = path.join(process.cwd(), 'android/app/src/main/res/values/strings.xml');
  if (fs.existsSync(stringsXmlPath)) {
    let content = fs.readFileSync(stringsXmlPath, 'utf-8');
    content = content.replace(/<string name="app_name">.*<\/string>/, `<string name="app_name">${appName}</string>`);
    content = content.replace(/<string name="title_activity_main">.*<\/string>/, `<string name="title_activity_main">${appName}</string>`);
    fs.writeFileSync(stringsXmlPath, content);
    console.log('✅ Updated android/app/src/main/res/values/strings.xml');
  }

  // 6. Update src/routes/+page.svelte
  const pageSveltePath = path.join(process.cwd(), 'src/routes/+page.svelte');
  if (fs.existsSync(pageSveltePath)) {
    let content = fs.readFileSync(pageSveltePath, 'utf-8');
    // Replace "Calurcap." in the H1
    content = content.replace(/Calurcap\./g, `${appName}.`);
    // Replace "Calurcap" in the title/meta if present (or just generic replacements)
    content = content.replace(/>\s*Calurcap\s*</g, `>${appName}<`); 
    fs.writeFileSync(pageSveltePath, content);
    console.log('✅ Updated src/routes/+page.svelte');
  }

  // 7. Update MainActivity.java and move it
  // Current path is hardcoded to com/avarnic/calurcap, we need to find it or assume it's there
  const javaBasePath = path.join(process.cwd(), 'android/app/src/main/java');
  // We need to find the current MainActivity.java to know where it is
  // A simple recursive search or just assuming the default structure if it hasn't changed
  // For this template, we assume it starts at com/avarnic/calurcap
  const oldPackagePath = path.join(javaBasePath, 'com', 'avarnic', 'calurcap');
  const oldActivityPath = path.join(oldPackagePath, 'MainActivity.java');

  if (fs.existsSync(oldActivityPath)) {
    let content = fs.readFileSync(oldActivityPath, 'utf-8');
    content = content.replace(/package com\.avarnic\.calurcap;/, `package ${appId};`);
    
    // Create new directory structure
    const newPackagePath = path.join(javaBasePath, ...appId.split('.'));
    fs.mkdirSync(newPackagePath, { recursive: true });
    
    const newActivityPath = path.join(newPackagePath, 'MainActivity.java');
    fs.writeFileSync(newActivityPath, content);
    console.log(`✅ Moved MainActivity.java to ${newActivityPath}`);

    // Optional: Clean up old empty directories if they are empty
    // This is a bit risky if we delete something we shouldn't, so maybe just leave them or try to delete specific ones
    // For now, let's just leave the old file? No, that causes duplicate class errors. We must delete the old file.
    fs.unlinkSync(oldActivityPath);
    
    // Try to remove empty parent directories
    try {
        if (fs.readdirSync(oldPackagePath).length === 0) fs.rmdirSync(oldPackagePath);
        const parent = path.dirname(oldPackagePath);
        if (fs.readdirSync(parent).length === 0) fs.rmdirSync(parent);
    } catch (e) {
        // Ignore errors deleting directories
    }
  } else {
      console.log('⚠️ Could not find MainActivity.java at default location. Skipping package move.');
  }

  console.log('\n✨ Setup complete! You may need to run "npx cap sync" to apply changes to the Android project.\n');
  rl.close();
}

main();
