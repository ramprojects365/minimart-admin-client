const fs = require('fs');

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

if (!googleMapsApiKey) {
  throw new Error('GOOGLE_MAPS_API_KEY is missing in Vercel environment variables');
}

const environmentProd = `
export const environment = {
  production: true,
  googleMapsApiKey: '${googleMapsApiKey}',
};
`;

fs.writeFileSync('./src/environments/environment.prod.ts', environmentProd);

console.log('environment.prod.ts updated with Google Maps API key');