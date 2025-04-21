const express = require('express');
const router = express.Router();
const { 
    createCategory, 
    getCategories, 
    getCategoryById, 
    updateCategory, 
    deleteCategory 
} = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');



router.post('/add',authenticate,authorize('Admin'), createCategory);
router.get('/getAll',authenticate, getCategories);
router.get('/get/:id',authenticate, getCategoryById);  
router.put('/update/:id',authenticate, updateCategory);
router.delete('/delete/:id', deleteCategory);

module.exports = router;
