import pool from '../config/db.js';

export const getDepartments = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT d.*, COUNT(doc.id)::int AS doctor_count
      FROM departments d
      LEFT JOIN doctors doc ON d.id = doc.department_id AND doc.is_available = TRUE
      GROUP BY d.id
      ORDER BY d.name ASC;
    `);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, description, icon_name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Department name is required.' });
    }

    const result = await pool.query(
      `INSERT INTO departments (name, description, icon_name)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      [name.trim(), description || null, icon_name || 'Activity']
    );

    res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'A department with this name already exists.' });
    }
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, icon_name } = req.body;

    const result = await pool.query(
      `UPDATE departments
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           icon_name = COALESCE($3, icon_name)
       WHERE id = $4
       RETURNING *;`,
      [name ? name.trim() : null, description, icon_name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM departments WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
