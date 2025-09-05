import 'fake-indexeddb/auto';

// Setup global IndexedDB for tests
if (typeof global !== 'undefined') {
  // Setup fake-indexeddb
  const FDBFactory = require('fake-indexeddb/lib/FDBFactory');
  const FDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
  
  global.indexedDB = new FDBFactory();
  global.IDBKeyRange = FDBKeyRange;
  
  // Setup crypto for Node.js environment if needed
  if (!global.crypto) {
    const { webcrypto } = require('crypto');
    global.crypto = webcrypto;
  }
}