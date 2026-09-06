import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../../lib/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../../../.local-db.json');

// In-memory data store with file persistence
let store = {
  users: {},
};

// Load existing local data if present
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    store = JSON.parse(raw);
    logger.info('Loaded local dev data store');
  }
} catch {
  // Use empty store
}

function saveStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    logger.warn({ error: err.message }, 'Failed to persist local store');
  }
}

class LocalDocRef {
  constructor(pathSegments) {
    this.path = pathSegments;
  }

  get id() {
    return this.path[this.path.length - 1];
  }

  async get() {
    let current = store;
    for (const segment of this.path) {
      current = current?.[segment];
    }
    return {
      id: this.id,
      exists: current !== undefined && current !== null,
      data: () => (current ? { ...current } : undefined),
    };
  }

  async set(data) {
    let current = store;
    for (let i = 0; i < this.path.length - 1; i++) {
      const segment = this.path[i];
      if (!current[segment]) current[segment] = {};
      current = current[segment];
    }
    const docId = this.path[this.path.length - 1];
    current[docId] = { ...data };
    saveStore();
    return { id: docId, ...data };
  }

  async update(updates) {
    let current = store;
    for (let i = 0; i < this.path.length - 1; i++) {
      const segment = this.path[i];
      if (!current[segment]) current[segment] = {};
      current = current[segment];
    }
    const docId = this.path[this.path.length - 1];
    if (!current[docId]) {
      throw new Error(`Document ${docId} not found`);
    }
    current[docId] = { ...current[docId], ...updates };
    saveStore();
    return { id: docId, ...current[docId] };
  }

  async delete() {
    let current = store;
    for (let i = 0; i < this.path.length - 1; i++) {
      const segment = this.path[i];
      if (!current[segment]) return;
      current = current[segment];
    }
    const docId = this.path[this.path.length - 1];
    delete current[docId];
    saveStore();
  }

  collection(name) {
    return new LocalCollectionRef([...this.path, name]);
  }
}

class LocalCollectionRef {
  constructor(pathSegments) {
    this.path = pathSegments;
    this._filters = [];
    this._orderByField = null;
    this._orderDirection = 'asc';
    this._limitCount = null;
  }

  doc(id) {
    return new LocalDocRef([...this.path, id]);
  }

  where(field, op, value) {
    const clone = this._clone();
    clone._filters.push({ field, op, value });
    return clone;
  }

  orderBy(field, direction = 'asc') {
    const clone = this._clone();
    clone._orderByField = field;
    clone._orderDirection = direction;
    return clone;
  }

  limit(count) {
    const clone = this._clone();
    clone._limitCount = count;
    return clone;
  }

  _clone() {
    const copy = new LocalCollectionRef(this.path);
    copy._filters = [...this._filters];
    copy._orderByField = this._orderByField;
    copy._orderDirection = this._orderDirection;
    copy._limitCount = this._limitCount;
    return copy;
  }

  async get() {
    let current = store;
    for (const segment of this.path) {
      current = current?.[segment];
    }

    if (!current || typeof current !== 'object') {
      return { docs: [] };
    }

    let items = Object.entries(current).map(([id, data]) => ({
      id,
      ref: new LocalDocRef([...this.path, id]),
      data: () => ({ ...data }),
      ...data,
    }));

    // Apply filters
    for (const filter of this._filters) {
      items = items.filter((item) => {
        const itemVal = item[filter.field];
        if (filter.op === '==') return itemVal === filter.value;
        if (filter.op === '!=') return itemVal !== filter.value;
        if (filter.op === '>') return itemVal > filter.value;
        if (filter.op === '>=') return itemVal >= filter.value;
        if (filter.op === '<') return itemVal < filter.value;
        if (filter.op === '<=') return itemVal <= filter.value;
        return true;
      });
    }

    // Apply sorting
    if (this._orderByField) {
      const field = this._orderByField;
      const mult = this._orderDirection === 'desc' ? -1 : 1;
      items.sort((a, b) => {
        const valA = a[field] ?? '';
        const valB = b[field] ?? '';
        if (valA < valB) return -1 * mult;
        if (valA > valB) return 1 * mult;
        return 0;
      });
    }

    // Apply limit
    if (this._limitCount !== null) {
      items = items.slice(0, this._limitCount);
    }

    const docs = items.map((item) => ({
      id: item.id,
      ref: item.ref,
      exists: true,
      data: () => {
        const copy = { ...item };
        delete copy.ref;
        delete copy.id;
        return copy;
      },
    }));

    return { docs };
  }
}

class LocalBatch {
  constructor() {
    this.ops = [];
  }

  delete(ref) {
    this.ops.push(async () => ref.delete());
    return this;
  }

  set(ref, data) {
    this.ops.push(async () => ref.set(data));
    return this;
  }

  update(ref, data) {
    this.ops.push(async () => ref.update(data));
    return this;
  }

  async commit() {
    for (const op of this.ops) {
      await op();
    }
  }
}

export class LocalFirestore {
  collection(name) {
    return new LocalCollectionRef([name]);
  }

  batch() {
    return new LocalBatch();
  }
}
