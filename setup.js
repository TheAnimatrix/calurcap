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

  console.log('\n✨ Setup complete! You may need to run "npx cap sync" to apply changes to the Android project.\n');
  rl.close();
}

main();
