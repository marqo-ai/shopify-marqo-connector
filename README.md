# Shopify-Marqo Connector

A lightweight service for managing document updates in Shopify and syncing them with Marqo's vector search engine.

## Local Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- A Shopify store with admin API access
- A Marqo account and API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/marqo-ai/shopify-marqo-connector.git
cd shopify-marqo-connector
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory with the following variables:
```env
PORT=5000
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret
MARQO_API_KEY=your_marqo_api_key
MARQO_URL=your_marqo_url
MARQO_INDEX_NAME=your_index_name
TEST_MODE=false
MARQO_CONFIG={"tensorFields":["multimodal"],"mappings":{"multimodal":{"type":"multimodal_combination","weights":{"image_url":0.9,"name":0.1}}}}
```

4. Start the development server:
```bash
npm start
```

The server will start on port 5000 by default. You can change this in the `.env` file.

## Cloud Run Deployment

### Prerequisites
- Google Cloud Platform account
- Google Cloud CLI installed
- Docker installed locally

### Deployment Steps

1. Build the Docker image:
```bash
docker build -t gcr.io/[YOUR_PROJECT_ID]/shopify-marqo-connector .
```

2. Push the image to Google Container Registry:
```bash
docker push gcr.io/[YOUR_PROJECT_ID]/shopify-marqo-connector
```

3. Deploy to Cloud Run:
```bash
gcloud run deploy shopify-marqo-connector \
  --image gcr.io/[YOUR_PROJECT_ID]/shopify-marqo-connector \
  --platform managed \
  --region [YOUR_REGION] \
  --allow-unauthenticated \
  --set-env-vars="PORT=8080,SHOPIFY_WEBHOOK_SECRET=[YOUR_SECRET],MARQO_API_KEY=[YOUR_KEY],MARQO_URL=[YOUR_URL],MARQO_INDEX_NAME=[YOUR_INDEX],TEST_MODE=false,MARQO_CONFIG={\"tensorFields\":[\"multimodal\"],\"mappings\":{\"multimodal\":{\"type\":\"multimodal_combination\",\"weights\":{\"image_url\":0.9,\"name\":0.1}}}}"
```

### Environment Variables for Cloud Run

When deploying to Cloud Run, you'll need to set the following environment variables:
- `PORT`: Set to 8080 (Cloud Run default)
- `SHOPIFY_WEBHOOK_SECRET`: Your Shopify webhook secret
- `MARQO_API_KEY`: Your Marqo API key
- `MARQO_URL`: Your Marqo instance URL
- `MARQO_INDEX_NAME`: Your Marqo index name
- `TEST_MODE`: Set to false for production
- `MARQO_CONFIG`: JSON string containing your Marqo configuration

## Usage

Once deployed, the service will automatically:
1. Listen for Shopify webhook events
2. Process product updates
3. Sync changes with your Marqo index

## Testing

To run tests locally:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
