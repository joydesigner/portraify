import { exec } from 'child_process';
import { access, mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WEIGHTS_DIR = join(dirname(__dirname), 'weights/Kolors-IP-Adapter-FaceID-Plus');

async function downloadWeights() {
  try {
    console.log('Checking for Kolors IP Adapter FaceID Plus weights...');
    
    // Check if weights directory exists
    try {
      await access(WEIGHTS_DIR);
      console.log('Weights directory already exists');
    } catch {
      console.log('Creating weights directory...');
      await mkdir(WEIGHTS_DIR, { recursive: true });
    }
    
    // Download weights
    console.log('Downloading weights from Hugging Face...');
    const command = `huggingface-cli download --resume-download Kwai-Kolors/Kolors-IP-Adapter-FaceID-Plus --local-dir ${WEIGHTS_DIR}`;
    
    await new Promise((resolve, reject) => {
      const process = exec(command);
      
      process.stdout?.on('data', (data) => {
        console.log(data.toString());
      });
      
      process.stderr?.on('data', (data) => {
        console.error(data.toString());
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          console.log('Weights downloaded successfully');
          resolve(true);
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });
    });
    
    // Verify weights
    const files = await readdir(WEIGHTS_DIR);
    if (files.length === 0) {
      throw new Error('No weight files found after download');
    }
    
    console.log('Weight files found:', files);
    console.log('Installation complete!');
    
  } catch (error) {
    console.error('Error downloading weights:', error);
    process.exit(1);
  }
}

downloadWeights(); 