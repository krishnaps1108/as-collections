import Product from '../models/Product.js';

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add product (Seller / Admin)
export const addProduct = async (req, res) => {
  try {
    const { name, category, isAdult, price, description, ingredients, label } = req.body;
    let imageUrl = req.body.image || '';

    // Handle file upload
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // Parse variants if provided as JSON string
    let parsedVariants = [];
    if (req.body.variants) {
      try {
        parsedVariants = typeof req.body.variants === 'string' 
          ? JSON.parse(req.body.variants) 
          : req.body.variants;
      } catch (err) {
        console.error('Error parsing variants:', err);
      }
    }

    // Parse ingredients if provided as JSON or comma-separated
    let parsedIngredients = [];
    if (ingredients) {
      try {
        parsedIngredients = typeof ingredients === 'string' && ingredients.startsWith('[')
          ? JSON.parse(ingredients)
          : typeof ingredients === 'string' 
            ? ingredients.split(',').map(i => i.trim())
            : ingredients;
      } catch (err) {
        parsedIngredients = typeof ingredients === 'string' ? ingredients.split(',') : [];
      }
    }

    const product = new Product({
      name,
      category,
      isAdult: isAdult === 'true' || isAdult === true,
      variants: parsedVariants,
      price: price ? Number(price) : undefined,
      description,
      ingredients: parsedIngredients,
      label: label || 'AS Collections',
      image: imageUrl,
      seller: req.userId
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product (Seller / Admin)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Enforce ownership check: sellers can only edit their own products
    if (req.userRole === 'seller' && product.seller && product.seller.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this product' });
    }

    const { name, category, isAdult, price, description, ingredients, label } = req.body;
    let imageUrl = req.body.image;

    // Handle file upload
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (isAdult !== undefined) updateData.isAdult = isAdult === 'true' || isAdult === true;
    if (price !== undefined) updateData.price = price ? Number(price) : undefined;
    if (description !== undefined) updateData.description = description;
    if (label !== undefined) updateData.label = label;
    if (imageUrl !== undefined) updateData.image = imageUrl;

    if (req.body.variants !== undefined) {
      try {
        updateData.variants = typeof req.body.variants === 'string'
          ? JSON.parse(req.body.variants)
          : req.body.variants;
      } catch (err) {
        console.error('Error parsing variants in update:', err);
      }
    }

    if (ingredients !== undefined) {
      try {
        updateData.ingredients = typeof ingredients === 'string' && ingredients.startsWith('[')
          ? JSON.parse(ingredients)
          : typeof ingredients === 'string'
            ? ingredients.split(',').map(i => i.trim())
            : ingredients;
      } catch (err) {
        updateData.ingredients = typeof ingredients === 'string' ? ingredients.split(',') : [];
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};