# **✈️ Safar Sar: A Multi-Agent AI Trip Planner**

Safar Sar is a modern travel platform that solves the complexity of group trip planning. It uses a **Hierarchical Multi-Agent System (MAS)** built on the **Google Agent Development Kit (ADK)** to coordinate varied budgets, departure locations, and logistics in real-time.

This repository contains the source code for the Safar Sar platform, as detailed in the accompanying [technical blog post](https://www.google.com/search?q=link-to-your-blog-post).

## **🏛️ Architecture Overview**

The system is designed around five specialized, modular agents that collaborate via a **Root Orchestration Agent**. This microservice-based architecture ensures that each complex task is handled by a specialized expert.

* **Root Orchestration Agent:** Manages user intent (Chat, Edit, Book, Plan) and routes tasks.  
* **Itinerary Planning Agent (IPA):** Generates itineraries using a **grounded** model (connected to a BigQuery data source) to prevent hallucinations.  
* **Multimodal Transport Agent (MTA):** A ParallelAgent that simultaneously queries flight, train, and car rental APIs for each group member.  
* **Human-in-the-Loop (HITL) Agent:** Manages the UI and real-time group edits via Firestore.  
* **Compliance & Documentation Agent (CDA):** Handles visa, passport, and travel advisories.

## **🛠️ Tech Stack**

* **AI / Agents:** Google Agent Development Kit (ADK), Gemini  
* **Backend:** Node.js  
* **Deployment:** Google Cloud Run (as independent serverless microservices)  
* **Database:** Cloud Firestore (as the real-time single source of truth)  
* **Data Warehouse:** Google BigQuery (for grounding the IPA)  
* **APIs:** Google Flights API, various Train APIs

## **🚀 Getting Started (Local Development)**

Follow these instructions to get a local development server running.

**Note:** The production architecture deploys each agent as an independent microservice on Google Cloud Run. This local setup runs the core application for development and testing.

### **1\. Prerequisites**

* Node.js (v18.x or later)  
* npm  
* A Google Cloud Platform (GCP) project with **Billing enabled**.  
* APIs Enabled: Cloud Run, Firestore, BigQuery.  
* A configured .env file (see step 3).

### **2\. Clone the Repository**

Bash

git clone https://github.com/your-username/safar-sar.git  
cd safar-sar

### **3\. Install Dependencies**

Bash

npm i

### **4\. Configure Environment**

Before running, you must set up your environment. This project relies heavily on Google Cloud services.

* Create a .env file in the root directory (cp .env.example .env).  
* Add your credentials for:  
  * Google Cloud (Project ID, Service Account key)  
  * Cloud Firestore configuration  
  * BigQuery dataset and table names  
  * Any external travel API keys (e.g., Google Flights)

### **5\. Run the Application**

Bash

npm run start

### **6\. View in Browser**

Once the server is running, navigate to:

http://localhost:3000

---

## **🔮 Future Work**

* Integrate a **Traveler Profile Agent (TPA)** to refine a Preference Vector based on booking history.  
* Extend the **Multimodal Combination Planner (MCP)** to optimize for carbon footprint.
