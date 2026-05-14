import { ImageAnnotatorClient } from '@google-cloud/vision';
import fs from 'fs';
import path from 'path';

const client = new ImageAnnotatorClient({
  keyFilename: '/home/benhal/Documents/webdev/CCCUPXLI/cc_cup_XLI/ticketing/secrets/relay-496307-78b7a70f534b.json'
});

async function testOcr() {
  const imagePath = '/home/benhal/Documents/webdev/CCCUPXLI/cc_cup_XLI/ticketing/datasets/ktp1.png';
  const [result] = await client.textDetection(imagePath);
  const detections = result.textAnnotations;
  console.log('Text:');
  detections.forEach(text => console.log(text.description));
}

testOcr().catch(console.error);
