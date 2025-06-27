const express = require('express');
const router = express.Router()
const { createRecipe, getRecipes, updateRecipes, deleteRecipes } = require('../controllers/recipeController')
const authenticate = require('../middlwares/authMiddlware')

router.post('/recipes', authenticate, createRecipe)
router.get('/recipes', authenticate, getRecipes)
router.put('/recipes/:title', authenticate, updateRecipes);
router.delete('/recipes/:title', authenticate, deleteRecipes);
module.exports = router;