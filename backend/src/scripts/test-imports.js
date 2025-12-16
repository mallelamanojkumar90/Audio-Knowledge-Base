try {
  const { MemoryVectorStore } = require('langchain/vectorstores/memory');
  console.log('✅ Found at langchain/vectorstores/memory');
} catch (e) {
  console.log('❌ Not at langchain/vectorstores/memory', e.code);
}

try {
  const { MemoryVectorStore } = require('@langchain/community/vectorstores/memory');
  console.log('✅ Found at @langchain/community/vectorstores/memory');
} catch (e) {
  console.log('❌ Not at @langchain/community/vectorstores/memory', e.code);
}
