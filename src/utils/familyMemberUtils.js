/**
 * Utility functions for handling family member mappings between in-memory and database
 */

/**
 * Maps 'self-default' and other special IDs to actual database IDs
 * @param {Object} pool - PostgreSQL connection pool
 * @param {string} memberId - The member ID to map (can be 'self-default', etc.)
 * @returns {Promise<string>} The actual member ID to use in the database
 */
export const mapFamilyMemberIdToDb = async (pool, memberId) => {
  // Cache for mapping results to improve performance
  const mappingCache = new Map();
  
  // If we don't have a member ID, use default self
  if (!memberId) {
    memberId = 'self-default';
  }
  
  // If it's not a special ID and already looks like a DB ID (doesn't contain '-default'), return as is
  if (memberId && !memberId.includes('-default')) {
    // Check if the ID actually exists in the database
    try {
      const checkQuery = "SELECT EXISTS(SELECT 1 FROM family_members WHERE id = $1)";
      const checkResult = await pool.query(checkQuery, [memberId]);
      
      if (checkResult.rows[0].exists) {
        return memberId; // The ID exists, safe to use
      }
      // If we reach here, the ID doesn't exist - we'll fall through to the default mapping
    } catch (error) {
      console.warn(`Error checking if family member ID ${memberId} exists:`, error);
      // Continue with default mapping logic
    }
  }
  
  // Check if we already have this mapping cached
  if (mappingCache.has(memberId)) {
    return mappingCache.get(memberId);
  }
  
  try {
    let result = null;
    
    // Handle the default IDs we know about
    if (memberId === 'self-default') {
      // Get the self user from the family_members table
      const selfMemberQuery = "SELECT id FROM family_members WHERE relationship = 'Self' LIMIT 1";
      const selfMemberResult = await pool.query(selfMemberQuery);
      
      if (selfMemberResult.rows.length > 0) {
        result = selfMemberResult.rows[0].id;
      }
    } else if (memberId === 'spouse-default') {
      // Get the spouse user from the family_members table
      const spouseMemberQuery = "SELECT id FROM family_members WHERE relationship = 'Spouse' LIMIT 1";
      const spouseMemberResult = await pool.query(spouseMemberQuery);
      
      if (spouseMemberResult.rows.length > 0) {
        result = spouseMemberResult.rows[0].id;
      }
    } else if (memberId === 'parent-default') {
      // Get the parent user from the family_members table
      const parentMemberQuery = "SELECT id FROM family_members WHERE relationship = 'Parent' LIMIT 1";
      const parentMemberResult = await pool.query(parentMemberQuery);
      
      if (parentMemberResult.rows.length > 0) {
        result = parentMemberResult.rows[0].id;
      }
    }
    
    // If we couldn't map it specifically, get any family member as fallback
    if (!result) {
      console.warn(`Could not specifically map ${memberId}, using first available family member`);
      const anyMemberQuery = "SELECT id FROM family_members ORDER BY created_at LIMIT 1";
      const anyMemberResult = await pool.query(anyMemberQuery);
      
      if (anyMemberResult.rows.length > 0) {
        result = anyMemberResult.rows[0].id;
      }
    }
    
    // If we still don't have a result, there are no family members
    if (!result) {
      throw new Error("No family members found in the database. Please create at least one family member first.");
    }
    
    // Cache the result for future use
    mappingCache.set(memberId, result);
    return result;
  } catch (error) {
    console.error(`Error mapping family member ID ${memberId}:`, error);
    throw error;
  }
};
