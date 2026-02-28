// Data Migration Script from products.json to Sanity
// Run this script after setting up your Sanity project

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
const PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID;

// Configure your Sanity client
const client = createClient({
  projectId: PROJECT_ID, // Replace with your actual project ID
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: 'skcWnXBaVTrej11dIS9O8LBlUv2TytRx03agNsCWvlmAeMfg9Os8F57wEGS4XH4EhPdMKQNH51t1VqpTtRbagyxqrRwTIGPQra4efYS6Ik2eb6awmPOeae29eSZC6f1YJS85Ex5SW80jdVpLGH9UJvLTTQIP5diMpLceT953LvNRIZRhojUU', // You'll need to create a write token in Sanity
})

// Read the existing products.json file
const productsData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'src/data/products.json'), 'utf8')
)

async function migrateData() {
  try {
    console.log('Starting data migration...')

    // First, migrate categories
    console.log('Migrating categories...')
    const categoryMappings = {}
    
    for (const category of productsData.categories) {
      const sanityCategory = {
        _type: 'category',
        name_en: category.name_en,
        name_ar: category.name_ar,
        slug: {
          _type: 'slug',
          current: category.slug
        },
        description_en: category.description_en,
        description_ar: category.description_ar,
      }

      const result = await client.create(sanityCategory)
      categoryMappings[category.id] = result._id
      console.log(`Created category: ${category.name_en}`)
    }

    // Then, migrate products
    console.log('Migrating products...')
    
    for (const product of productsData.products) {
      // Convert images to Sanity format (you'll need to upload actual images)
      const sanityImages = product.images.map(img => ({
        _type: 'productImage',
        image: {
          _type: 'image',
          // Note: You'll need to upload actual images to Sanity
          // For now, this creates a placeholder structure
          asset: {
            _type: 'reference',
            _ref: 'image-placeholder' // Replace with actual image asset reference
          }
        },
        alt_en: img.alt_en,
        alt_ar: img.alt_ar,
      }))

      const sanityProduct = {
        _type: 'product',
        name_en: product.name_en,
        name_ar: product.name_ar,
        category: {
          _type: 'reference',
          _ref: categoryMappings[product.category_id]
        },
        description_en: product.description_en,
        description_ar: product.description_ar,
        price: product.price,
        unit: product.unit,
        in_stock: product.in_stock,
        images: sanityImages,
        specifications: product.specifications,
        features: product.features,
        benefits: product.benefits,
        usage_instructions: product.usage_instructions,
      }

      const result = await client.create(sanityProduct)
      console.log(`Created product: ${product.name_en}`)
    }

    console.log('Data migration completed successfully!')
    
  } catch (error) {
    console.error('Error during migration:', error)
  }
}

// Uncomment the line below to run the migration
// migrateData()

export { migrateData }

