/**
 * Test script for family member ID mapping
 * Run with: node test-family-member-mapping.js
 * 
 * This script tests both the utility function and the API endpoints
 * to ensure that family member IDs are correctly mapped.
 */
import { mapFamilyMemberIdToDb } from './src/utils/familyMemberUtils.js';
import pg from 'pg';
import axios from 'axios';

// API URL
const API_URL = process.env.API_URL || 'http://localhost:3001';

// Database connection
const pool = new pg.Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'financeapp',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres123'
});

async function testFamilyMemberMapping() {
  try {
    console.log('Testing family member ID mapping...');
    
    // Test cases
    const testCases = [
      'self-default',
      'spouse-default',
      'parent-default',
      'fam-001', // should remain as is
      null, // should default to a valid ID
      undefined, // should default to a valid ID
      'non-existent-id', // should map to a valid ID
    ];
    
    // Run tests
    for (const testId of testCases) {
      try {
        console.log(`Testing ID: ${testId || 'undefined/null'}`);
        const mappedId = await mapFamilyMemberIdToDb(pool, testId);
        
        // Verify the mapped ID exists in the database
        const verifyQuery = "SELECT EXISTS(SELECT 1 FROM family_members WHERE id = $1)";
        const verifyResult = await pool.query(verifyQuery, [mappedId]);
        
        console.log(`  Original ID: ${testId || 'undefined/null'}`);
        console.log(`  Mapped ID: ${mappedId}`);
        console.log(`  Exists in DB: ${verifyResult.rows[0].exists}`);
        
        if (!verifyResult.rows[0].exists) {
          console.error(`  ERROR: Mapped ID ${mappedId} does not exist in the database!`);
        }
      } catch (error) {
        console.error(`  ERROR testing ID ${testId}:`, error.message);
      }
      console.log('---');
    }
    
    console.log('Testing SIP creation with mapped IDs...');
    
    // Test SIP creation with various family member IDs
    const testSipCreation = async (familyMemberId) => {
      try {
        // Map the ID first to see what it would be
        const mappedId = await mapFamilyMemberIdToDb(pool, familyMemberId);
        console.log(`Testing SIP creation with family member ID: ${familyMemberId || 'undefined/null'} -> ${mappedId}`);
        
        // Insert directly to test foreign key constraint
        const sipId = `sip-test-${Date.now().toString().slice(-6)}`;
        const insertQuery = `
          INSERT INTO sip_investments (
            id, name, type, amount, frequency, start_date, duration, 
            current_value, returns, returns_percent, family_member_id, 
            fund_type, last_updated
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING id, name, family_member_id
        `;
        
        const values = [
          sipId,
          `Test SIP for ${familyMemberId || 'default'}`,
          'Mutual Fund',
          1000,
          'Monthly',
          new Date().toISOString(),
          12,
          1000,
          0,
          0,
          mappedId,
          'Mutual Fund',
          new Date().toISOString()
        ];
        
        const result = await pool.query(insertQuery, values);
        console.log(`  SUCCESS! Created SIP with ID: ${result.rows[0].id}`);
        console.log(`  Name: ${result.rows[0].name}`);
        console.log(`  Family member ID in DB: ${result.rows[0].family_member_id}`);
        
        // Clean up - delete the test SIP
        await pool.query('DELETE FROM sip_investments WHERE id = $1', [sipId]);
        console.log(`  Cleaned up test SIP ${sipId}`);
      } catch (error) {
        console.error(`  ERROR creating SIP with family member ID ${familyMemberId}:`, error.message);
      }
      console.log('---');
    };
    
    // Test SIP creation with various family member IDs
    await testSipCreation('self-default');
    await testSipCreation('spouse-default');
    await testSipCreation('parent-default');
    await testSipCreation('fam-001');
    await testSipCreation(null);
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Close the database connection
    await pool.end();
    console.log('Database mapping tests completed');
  }
}

/**
 * Test the API endpoints for SIP investments with family member IDs
 */
async function testApiEndpoints() {
  try {
    console.log('\n--- Testing API Endpoints ---\n');
    
    // First, check what family members exist through the API
    console.log('Checking existing family members through API...');
    try {
      const familyResponse = await axios.get(`${API_URL}/api/family-members`);
      console.log('Family members:', familyResponse.data);
    } catch (error) {
      console.error('Failed to fetch family members:', error.message);
      // Continue with the test even if this fails
    }
    
    // Test creating SIP investments with different family member IDs
    const testCases = [
      { name: 'Test SIP with self-default', familyMemberId: 'self-default' },
      { name: 'Test SIP with spouse-default', familyMemberId: 'spouse-default' },
      { name: 'Test SIP with fam-001', familyMemberId: 'fam-001' },
      { name: 'Test SIP with no family ID', familyMemberId: undefined }
    ];
    
    for (const testCase of testCases) {
      console.log(`\nTesting API: Creating SIP with family member ID: ${testCase.familyMemberId || 'undefined'}`);
      
      try {
        const sipData = {
          name: testCase.name,
          amount: 5000,
          frequency: 'Monthly',
          startDate: new Date().toISOString(),
          duration: 12
        };
        
        // Add the family member ID if defined
        if (testCase.familyMemberId) {
          sipData.familyMemberId = testCase.familyMemberId;
        }
        
        // Create the SIP investment
        const createResponse = await axios.post(`${API_URL}/api/sip-investments`, sipData);
        console.log(`  SUCCESS! Created SIP with ID: ${createResponse.data.id}`);
        console.log(`  Family member ID in DB: ${createResponse.data.family_member_id}`);
        
        // Verify the SIP was created with a valid family member ID
        const sipId = createResponse.data.id;
        const verifyResponse = await axios.get(`${API_URL}/api/sip-investments/${sipId}`);
        console.log(`  Verified SIP ID: ${verifyResponse.data.id}`);
        console.log(`  Verified family member ID: ${verifyResponse.data.family_member_id}`);
        
        // Check if the family member ID exists in the database
        const verifyQuery = "SELECT EXISTS(SELECT 1 FROM family_members WHERE id = $1)";
        const verifyResult = await pool.query(verifyQuery, [verifyResponse.data.family_member_id]);
        console.log(`  Family member ID exists in DB: ${verifyResult.rows[0].exists}`);
        
        // Clean up - delete the test SIP
        await axios.delete(`${API_URL}/api/sip-investments/${sipId}`);
        console.log(`  Cleaned up test SIP ${sipId}`);
      } catch (error) {
        console.error(`  ERROR with family member ID ${testCase.familyMemberId}:`, error.message);
        if (error.response) {
          console.error('  Response data:', error.response.data);
          console.error('  Response status:', error.response.status);
        }
      }
      console.log('---');
    }
    
    console.log('API endpoint tests completed');
  } catch (error) {
    console.error('API test failed:', error);
  }
}

// Run the tests
async function runAllTests() {
  console.log('Starting family member ID mapping tests...');
  
  // Test the mapping utility function
  await testFamilyMemberMapping();
  
  // Test the API endpoints
  await testApiEndpoints();
  
  console.log('All tests completed');
}

runAllTests();
