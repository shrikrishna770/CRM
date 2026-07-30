import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

export async function readJsonData<T>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [] as unknown as T;
  }
}

export async function writeJsonData<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.warn(`Warning: Failed to write JSON file ${filename} (this is normal on read-only serverless filesystems like Vercel):`, error);
    // Do not throw error so the request can degrade gracefully in ephemeral environments
  }
}
