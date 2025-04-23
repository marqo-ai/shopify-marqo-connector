require('dotenv').config();
const axios = require('axios');

// Initialize Marqo client config
const MARQO_URL = process.env.MARQO_URL || 'http://localhost:8882';
const INDEX_NAME = process.env.MARQO_INDEX_NAME || 'trueclassic-products';
const TEST_MODE = process.env.TEST_MODE === 'true';

// Parse Marqo configuration from environment
const MARQO_CONFIG = process.env.MARQO_CONFIG ? JSON.parse(process.env.MARQO_CONFIG) : {
    tensorFields: ['multimodal'],
    mappings: {
        multimodal: {
            type: "multimodal_combination",
            weights: {
                image_url: 0.9,
                name: 0.1
            }
        }
    }
};

// Initialize axios client for Marqo
const marqoClient = axios.create({
    baseURL: MARQO_URL,
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.MARQO_API_KEY
    }
});

const transformProductForMarqo = (product) => {
    // Basic product data
    const marqoProduct = {
        _id: product.id.toString(),
        name: product.title,
        image_url: product.images && product.images[0] ? product.images[0].src : '',
        vendor: product.vendor,
        product_type: product.product_type,
        tags: product.tags,
    };

    return marqoProduct;
};

async function processProduct(productData) {
    console.log('Processing product:', {
        id: productData.id,
        title: productData.title,
        testMode: TEST_MODE
    });

    const document = transformProductForMarqo(productData);
    const requestData = {
        documents: [document],
        mappings: MARQO_CONFIG.mappings,
        tensorFields: MARQO_CONFIG.tensorFields
    };
    
    if (TEST_MODE) {
        // Debug: Print the exact curl command
        const curlCommand = `curl -XPOST '${MARQO_URL}/indexes/${INDEX_NAME}/documents' \\
-H 'x-api-key: ${process.env.MARQO_API_KEY}' \\
-H 'Content-type: application/json' \\
-d '${JSON.stringify(requestData, null, 2)}'`;
        
        console.log('\n=== Debug - Exact Curl Command ===');
        console.log(curlCommand);
        console.log('================================\n');
        
        console.log('TEST MODE: Would add document to Marqo:', {
            index: INDEX_NAME,
            document: document,
            mappings: MARQO_CONFIG.mappings,
            tensorFields: MARQO_CONFIG.tensorFields
        });
        return true;
    }
    
    try {
        await marqoClient.post(`/indexes/${INDEX_NAME}/documents`, requestData);
        
        console.log(`Processed product ${productData.id} in Marqo`);
        return true;
    } catch (error) {
        console.error('Error adding document to Marqo:', error.response?.data || error.message);
        throw error;
    }
}

async function deleteProduct(productId) {
    if (TEST_MODE) {
        // Debug: Print the exact curl command
        const curlCommand = `curl -XPOST '${MARQO_URL}/indexes/${INDEX_NAME}/documents/delete-batch' \\
-H 'x-api-key: ${process.env.MARQO_API_KEY}' \\
-H 'Content-type: application/json' \\
-d '["${productId.toString()}"]'`;
        
        console.log('\n=== Debug - Exact Curl Command ===');
        console.log(curlCommand);
        console.log('================================\n');

        console.log('TEST MODE: Would delete document from Marqo:', {
            index: INDEX_NAME,
            id: productId
        });
        return true;
    }

    try {
        await marqoClient.post(`/indexes/${INDEX_NAME}/documents/delete-batch`, [productId.toString()]);
        
        console.log(`Deleted product ${productId} from Marqo`);
        return true;
    } catch (error) {
        console.error('Error deleting document from Marqo:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = {
    processProduct,
    deleteProduct
}; 