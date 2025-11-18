
# Safar Sar - AI Trip Planner

This is a React-based AI trip planner application designed to be deployed on Google Cloud Run.

## Prerequisites

1.  **Google Cloud SDK:** Make sure you have the `gcloud` CLI installed and authenticated.
2.  **Google Cloud Project:** A Google Cloud project with billing enabled.
3.  **Enabled APIs:** Ensure the following APIs are enabled in your project:
    *   Cloud Build API (`serviceusage.googleapis.com`)
    *   Cloud Run API (`run.googleapis.com`)
    *   Artifact Registry API (`artifactregistry.googleapis.com`)
    *   Secret Manager API (`secretmanager.googleapis.com`)

## Deployment Steps

### 1. Set Up Environment Variables

In your local terminal, set the following environment variables:

```bash
export PROJECT_ID="your-gcp-project-id"
export REGION="us-central1" # Or your preferred region
export GEMINI_API_KEY="your-gemini-api-key" # Your actual Gemini API Key
```

### 2. Create a Secret in Secret Manager

We will store the Gemini API key securely in Secret Manager.

```bash
# Create the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# Add the first version of the secret
echo -n "${GEMINI_API_KEY}" | gcloud secrets versions add GEMINI_API_KEY --data-file=-
```

### 3. Grant Cloud Build Access to the Secret

The Cloud Build service account needs permission to access the secret during the build process.

```bash
# Get your project number
PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')

# Grant the Secret Accessor role to the Cloud Build service account
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 4. Create an Artifact Registry Repository

This is where your Docker container images will be stored.

```bash
gcloud artifacts repositories create safar-sar-repo \
  --repository-format=docker \
  --location=${REGION} \
  --description="Docker repository for Safar Sar application"
```

### 5. Submit the Build to Cloud Build

This command reads the `cloudbuild.yaml` file, builds the Docker image, and pushes it to your Artifact Registry.

```bash
gcloud builds submit . --config=cloudbuild.yaml
```

### 6. Deploy to Cloud Run

Deploy the container image from Artifact Registry to Cloud Run.

```bash
gcloud run deploy safar-sar-app \
  --image="${REGION}-docker.pkg.dev/${PROJECT_ID}/safar-sar-repo/safar-sar-app:latest" \
  --platform="managed" \
  --region="${REGION}" \
  --allow-unauthenticated \
  --port=80
```

After the command completes, it will provide a URL where your application is live.

## Local Development

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Create Environment File:**
    Create a file named `.env` in the root of the project and add your API key:
    ```
    VITE_API_KEY=your-gemini-api-key
    ```

3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.
