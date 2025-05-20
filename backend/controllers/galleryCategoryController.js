const GalleryCategory = require('../models/GalleryCategory');

// Отримати всі категорії галереї
const getAllGalleryCategories = async (req, res) => {
  try {
    const categories = await GalleryCategory.find();
    console.log('Fetched gallery categories:', categories);
    res.json(categories);
  } catch (err) {
    console.error('GET /api/gallery-categories Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Створити нову категорію галереї
const createGalleryCategory = async (req, res) => {
  const { name } = req.body;
  console.log('POST /api/gallery-categories body:', req.body);
  if (!name) return res.status(400).json({ message: 'Category name is required' });

  try {
    const existingCategory = await GalleryCategory.findOne({ name });
    if (existingCategory) return res.status(400).json({ message: 'Category already exists' });

    const category = new GalleryCategory({ name });
    const newCategory = await category.save();
    console.log('Saved gallery category:', newCategory);
    res.status(201).json(newCategory);
  } catch (err) {
    console.error('POST /api/gallery-categories Error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Видалити категорію галереї
const deleteGalleryCategory = async (req, res) => {
  try {
    const category = await GalleryCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await category.deleteOne();
    console.log('Deleted gallery category ID:', req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('DELETE /api/gallery-categories Error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllGalleryCategories,
  createGalleryCategory,
  deleteGalleryCategory,
};