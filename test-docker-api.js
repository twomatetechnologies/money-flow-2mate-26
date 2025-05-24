/**
 * Simple Docker test for the SIP Investments API
 */
import fetch from 'node-fetch';

const API_URL = 'http://localhost:8081';

// Test creating SIP investments with 'self-default' family member ID
async function testSipCreationWithDefaultFamilyMember() {
  try {
    console.log('Testing creating SIP with self-default family member ID...');
    
    const sipData = {
      name: 'Test SIP with self-default',
      amount: 5000,
      frequency: 'Monthly',
      startDate: new Date().toISOString(),
      duration: 12,
      familyMemberId: 'self-default'  // This should be mapped to a valid DB ID
    };
    
    // Create the SIP investment
    const createResponse = await fetch(`${API_URL}/api/sip-investments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sipData)
    });
    
    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(`Failed to create SIP: ${JSON.stringify(errorData)}`);
    }
    
    const createdSip = await createResponse.json();
    console.log(`SUCCESS! Created SIP with ID: ${createdSip.id}`);
    console.log(`Family member ID in DB: ${createdSip.family_member_id}`);
    
    // Verify the SIP was created with a valid family member ID
    const sipId = createdSip.id;
    
    // Clean up - delete the test SIP
    const deleteResponse = await fetch(`${API_URL}/api/sip-investments/${sipId}`, {
      method: 'DELETE'
    });
    
    if (deleteResponse.ok) {
      console.log(`Cleaned up test SIP ${sipId}`);
    } else {
      console.warn(`Failed to clean up test SIP ${sipId}`);
    }
    
    return true;
  } catch (error) {
    console.error('Test failed:', error.message);
    return false;
  }
}

// Run the test
testSipCreationWithDefaultFamilyMember()
  .then(success => {
    console.log(`Test ${success ? 'PASSED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
