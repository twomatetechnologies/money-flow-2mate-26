
/**
 * Family Members API Implementation
 */
import { v4 as uuidv4 } from 'uuid';

// Get all family members
const getAllFamilyMembers = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query("SELECT * FROM family_members ORDER BY name ASC");
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching family members:', error);
    res.status(500).json({ error: 'Failed to retrieve family members' });
  }
};

// Get a specific family member by ID
const getFamilyMemberById = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const result = await db.query("SELECT * FROM family_members WHERE id = $1", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Family member with ID ${id} not found` });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching family member ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to retrieve family member' });
  }
};

// Create a new family member
const createFamilyMember = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const {
      name,
      relationship,
      dateOfBirth, // Comes as string from JSON, DB expects DATE or null
      color,
      isActive = true,
      notes
    } = req.body;

    // Basic validation
    if (!name || !relationship || !color) {
      return res.status(400).json({ error: 'Missing required fields: name, relationship, color' });
    }

    const newId = `fam-${uuidv4().slice(0, 8)}`;
    const dobValue = dateOfBirth ? new Date(dateOfBirth).toISOString().split('T')[0] : null;

    const query = `
      INSERT INTO family_members (id, name, relationship, date_of_birth, color, is_active, notes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *;
    `;
    const values = [newId, name, relationship, dobValue, color, isActive, notes || null];
    
    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating family member:', error);
    res.status(500).json({ error: 'Failed to create family member' });
  }
};

// Update an existing family member
const updateFamilyMember = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const {
      name,
      relationship,
      dateOfBirth,
      color,
      isActive,
      notes
    } = req.body;

    const existingMemberResult = await db.query("SELECT * FROM family_members WHERE id = $1", [id]);
    if (existingMemberResult.rows.length === 0) {
      return res.status(404).json({ error: `Family member with ID ${id} not found` });
    }

    const fieldsToUpdate = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      fieldsToUpdate.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (relationship !== undefined) {
      fieldsToUpdate.push(`relationship = $${paramCount++}`);
      values.push(relationship);
    }
    if (dateOfBirth !== undefined) {
      fieldsToUpdate.push(`date_of_birth = $${paramCount++}`);
      values.push(dateOfBirth ? new Date(dateOfBirth).toISOString().split('T')[0] : null);
    }
    if (color !== undefined) {
      fieldsToUpdate.push(`color = $${paramCount++}`);
      values.push(color);
    }
    if (isActive !== undefined) {
      fieldsToUpdate.push(`is_active = $${paramCount++}`);
      values.push(isActive);
    }
    if (notes !== undefined) {
      fieldsToUpdate.push(`notes = $${paramCount++}`);
      values.push(notes);
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ error: 'No fields to update provided' });
    }

    fieldsToUpdate.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE family_members
      SET ${fieldsToUpdate.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;
    
    const result = await db.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating family member ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update family member' });
  }
};

// Delete a family member
const deleteFamilyMember = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    const result = await db.query("DELETE FROM family_members WHERE id = $1 RETURNING *", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Family member with ID ${id} not found` });
    }
    
    // Successfully deleted, return 200 with a success message or 204 for no content.
    // For consistency with other delete operations, let's use 200 with a success message.
    res.status(200).json({ success: true, message: `Family member with ID ${id} deleted successfully` });
  } catch (error) {
    console.error(`Error deleting family member ${req.params.id}:`, error);
    // Check for foreign key constraint violation (e.g., if family member is tied to other records)
    if (error.code === '23503') { // PostgreSQL error code for foreign_key_violation
        return res.status(409).json({ 
            error: `Cannot delete family member with ID ${id} as they are referenced in other records. Please update or remove those references first.` 
        });
    }
    res.status(500).json({ error: 'Failed to delete family member' });
  }
};

export {
  getAllFamilyMembers,
  getFamilyMemberById,
  createFamilyMember,
  updateFamilyMember,
  deleteFamilyMember
};
