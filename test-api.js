
/**
 * API testing script
 * 
 * Run this script to test the API endpoints
 * Usage: node test-api.js
 */

require('dotenv').config();
const fetch = require('node-fetch');

const API_URL = process.env.API_URL || 'http://localhost:8081/api';

async function testAPI() {
  console.log('🚀 Starting API tests...');
  console.log(`🌐 API URL: ${API_URL}`);
  
  try {
    // Test health check endpoint
    console.log('\n🏥 Testing health check endpoint...');
    const healthResponse = await fetch(`${API_URL}/health-check`);
    console.log(`Status: ${healthResponse.status}`);
    const healthData = await healthResponse.json();
    console.log('Response:', JSON.stringify(healthData, null, 2));
    
    // Test fixed deposits endpoint
    console.log('\n💰 Testing fixed deposits endpoint...');
    const fdResponse = await fetch(`${API_URL}/fixed-deposits`);
    console.log(`Status: ${fdResponse.status}`);
    const fdData = await fdResponse.json();
    console.log(`Retrieved ${fdData.length} fixed deposits`);
    
    // Test stocks endpoint
    console.log('\n📈 Testing stocks endpoint...');
    const stocksResponse = await fetch(`${API_URL}/stocks`);
    console.log(`Status: ${stocksResponse.status}`);
    const stocksData = await stocksResponse.json();
    console.log(`Retrieved ${stocksData.length} stocks`);
    
    // Test provident funds endpoint
    console.log('\n🏦 Testing provident funds endpoint...');
    const pfResponse = await fetch(`${API_URL}/provident-funds`);
    console.log(`Status: ${pfResponse.status}`);
    const pfData = await pfResponse.json();
    console.log(`Retrieved ${pfData.length} provident funds`);
    
    console.log('\n✅ API tests completed successfully!');
  } catch (error) {
    console.error('\n❌ API test failed:', error.message);
    console.error('Error details:', error);
  }
}

testAPI();
