export interface MemoryEntry {
  promptInfo: string;
  seed?: number;
  imageUrl?: string;
  timestamp?: number;
}

export type MemoryData = {
  [key: string]: MemoryEntry;
};

// In-memory store (can be replaced by a DB or cache like Redis for persistence)
const memoryStore: MemoryData = {};

// Retrieve memory entry by key
const getMemory = (key: string): MemoryEntry | undefined => {
  return memoryStore[key];
};

// Set or update memory for a given key
export const setMemory = (key: string, data: MemoryEntry): void => {
  // Store memory by key, cloning the data to prevent direct mutations
  memoryStore[key] = { ...data };
};

// Clear all memory (use with caution, depending on your use case)
export const clearMemory = (): void => {
  Object.keys(memoryStore).forEach((key) => delete memoryStore[key]);
};

// Optional: Automatically clear stale memory after a timeout (e.g., after 30 minutes)
export const clearStaleMemory = (timeout: number = 30 * 60 * 1000): void => {
  const currentTime = Date.now();

  Object.keys(memoryStore).forEach((key) => {
    const entry = memoryStore[key];

    // Assuming each memory entry has a timestamp of when it was created/updated
    if (entry && entry.timestamp && currentTime - entry.timestamp > timeout) {
      delete memoryStore[key]; // Clear stale entry
    }
  });
};

// Optional: Enhance memory by adding a timestamp field when creating new memories
export const setMemoryWithTimestamp = (
  key: string,
  data: MemoryEntry
): void => {
  const memoryWithTimestamp = { ...data, timestamp: Date.now() };
  setMemory(key, memoryWithTimestamp);
};

export { getMemory };
