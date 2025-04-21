const Category = require('../models/Category');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;    

// Create a new category
exports.createCategory = async (req, res) => {
    const { name } = req.body;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check if the category name already exists
        const existingCategory = await Category.findOne({ name: name.trim() });
        if (existingCategory) {
            return res.status(400).json({ error: 'Category name is already there' });
        }

        const newCategory = new Category({ name: name.trim() });

        await newCategory.save();
        res.status(201).json({ data: newCategory });
    } catch (error) {
        console.error('Error creating category:', error.stack);
        res.status(500).json({ error: 'Server error' });
    }
};


// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json({ data: categories });
    } catch (error) {
        console.error('Error fetching categories:', error.stack);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid category ID' });
    }

    try {
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ data: category });
    } catch (error) {
        console.error('Error fetching category:', error.stack);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update category by ID
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid category ID' });
    }

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json({ data: updatedCategory });
    } catch (error) {
        console.error('Error updating category:', error.stack);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete category by ID
exports.deleteCategory = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid category ID' });
    }

    try {
        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error.stack);
        res.status(500).json({ error: 'Server error' });
    }
};
