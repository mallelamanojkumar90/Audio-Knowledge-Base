#!/usr/bin/env node

/**
 * AI Model Configuration Helper
 * Helps set up the correct AI provider configuration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '../.env');
const envExamplePath = path.join(__dirname, '../env.example');

console.log('\n🤖 AI Model Configuration Helper\n');
console.log('This script will help you configure your AI provider.\n');

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.log('📝 No .env file found. Creating from env.example...\n');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file\n');
  } else {
    console.error('❌ Error: env.example not found!');
    process.exit(1);
  }
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('Available AI Providers:');
  console.log('1. Groq (Llama) - FREE, Fast, Recommended ⭐');
  console.log('2. OpenAI (GPT) - Paid, Industry Standard');
  console.log('3. Anthropic (Claude) - Paid, Long Context\n');

  const choice = await question('Select provider (1-3): ');

  let provider, apiKeyName, apiKey, model;

  switch (choice.trim()) {
    case '1':
      provider = 'groq';
      apiKeyName = 'GROQ_API_KEY';
      console.log('\n📍 Get your Groq API key from: https://console.groq.com/keys\n');
      apiKey = await question('Enter your Groq API key: ');
      model = await question('Model (press Enter for llama-3.3-70b-versatile): ') || 'llama-3.3-70b-versatile';
      break;

    case '2':
      provider = 'openai';
      apiKeyName = 'OPENAI_API_KEY';
      console.log('\n📍 Get your OpenAI API key from: https://platform.openai.com/api-keys\n');
      apiKey = await question('Enter your OpenAI API key: ');
      model = await question('Model (press Enter for gpt-4-turbo-preview): ') || 'gpt-4-turbo-preview';
      break;

    case '3':
      provider = 'anthropic';
      apiKeyName = 'ANTHROPIC_API_KEY';
      console.log('\n📍 Get your Anthropic API key from: https://console.anthropic.com/\n');
      apiKey = await question('Enter your Anthropic API key: ');
      model = await question('Model (press Enter for claude-3-5-sonnet-20241022): ') || 'claude-3-5-sonnet-20241022';
      break;

    default:
      console.log('❌ Invalid choice. Exiting.');
      rl.close();
      return;
  }

  // Read current .env
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Update AI_PROVIDER
  if (envContent.includes('AI_PROVIDER=')) {
    envContent = envContent.replace(/AI_PROVIDER=.*/g, `AI_PROVIDER=${provider}`);
  } else {
    envContent += `\nAI_PROVIDER=${provider}\n`;
  }

  // Update API key
  const apiKeyRegex = new RegExp(`${apiKeyName}=.*`, 'g');
  if (envContent.includes(`${apiKeyName}=`)) {
    envContent = envContent.replace(apiKeyRegex, `${apiKeyName}=${apiKey}`);
  } else {
    envContent += `${apiKeyName}=${apiKey}\n`;
  }

  // Update model
  const modelKeyName = `${provider.toUpperCase()}_MODEL`;
  const modelRegex = new RegExp(`${modelKeyName}=.*`, 'g');
  if (envContent.includes(`${modelKeyName}=`)) {
    envContent = envContent.replace(modelRegex, `${modelKeyName}=${model}`);
  } else {
    envContent += `${modelKeyName}=${model}\n`;
  }

  // Write back to .env
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Configuration saved to .env\n');
  console.log('📋 Your configuration:');
  console.log(`   Provider: ${provider}`);
  console.log(`   Model: ${model}`);
  console.log(`   API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);
  console.log('🚀 Next steps:');
  console.log('   1. Restart your backend server: npm run dev');
  console.log('   2. Upload an audio file to test transcription');
  console.log('   3. Check the logs for confirmation\n');

  rl.close();
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  rl.close();
  process.exit(1);
});
