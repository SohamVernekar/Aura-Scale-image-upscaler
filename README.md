# AuraScale AI - Premium Image Upscaler & Face Restoration

AuraScale AI is a premium, high-performance, and responsive web application designed to restore blurry portraits and upscale low-resolution image textures. Leveraging state-of-the-art AI models, the application provides an interactive workspace to sharpen background elements (Real-ESRGAN) and reconstruct facial details (CodeFormer) in real-time.

---

## 🌟 Key Features

*   **Interactive Comparison Canvas**: A custom-engineered before/after vertical split slider allowing real-time side-by-side visual inspections.
*   **Fix Blurry Faces (CodeFormer)**: Advanced face restoration model with a configurable **Fidelity slider** (0.0 to 1.0) to balance identity preservation vs. face sharpening.
*   **Sharpen Background (Real-ESRGAN)**: Textures upscale model optimized to clean artifacts, sharpen clothing, structures, and scenery.
*   **Smart Client-Side Resizing**: Automatic browser-side canvas optimization that keeps uploaded images under 3.5 Megapixels. This speeds up uploads and ensures requests bypass Hugging Face's strict GPU resolution boundaries.
*   **Failover Backend Cluster**: Node.js/Express server that automatically loops through alternative Gradio Space mirrors if the main inference node is asleep or rate-limited.
*   **Download Proxy**: Custom server-side proxy endpoint that pipes output images as attachment downloads, bypassing standard browser CORS limits and pop-up blocker triggers.

---

## 🛠️ Technology Stack

*   **Frontend**: React (Hooks), Vite, Tailwind CSS v4 (native compiler), Lucide React (Icons).
*   **Backend**: Node.js, Express, Multer (multipart upload buffer management), `@gradio/client` (API integration).
*   **AI Models**: CodeFormer (Face Restoration) & Real-ESRGAN (Super-Resolution).

---

## 📂 Repository Structure

```text
├── public/                 # Static frontend assets
├── src/
│   ├── assets/             # Images & Vector SVG files
│   ├── components/         # Workspace, Sidebar & Slider components
│   ├── services/           # API integration and Downscaler utilities
│   ├── App.jsx             # Main React application orchestration
│   └── main.jsx            # Application entrypoint
├── upscaler-backend/
│   ├── uploads/            # Temporary file upload cache (gitignored)
│   ├── .env.example        # Env configuration reference
│   ├── .env                # Secret keys config (gitignored)
│   ├── server.js           # Express API and Failover Gradio pipeline
│   └── package.json        # Backend dependencies
├── index.html              # HTML entrypoint with Outfit Google Fonts
├── vite.config.js          # Vite config utilizing @tailwindcss/vite
└── package.json            # Frontend configurations
```

---

## 🚀 Setup & Local Installation

### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm (or yarn / pnpm)

### 1. Backend Configuration
1. Open a terminal window and navigate to the backend folder:
   ```bash
   cd upscaler-backend
   ```
2. Install the server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Generate a free **Hugging Face Read Access Token** at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) and paste it into `.env`:
   ```env
   PORT=5000
   HF_TOKEN=your_token_starts_with_hf_here
   ```
5. Start the backend server:
   ```bash
   node server.js
   ```
   *The console should print: `🚀 Upscaler backend running seamlessly on port 5000`*

### 2. Frontend Configuration
1. Open a new terminal window at the **root directory** of the project.
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open the displayed local address in your browser (typically `http://localhost:5173` or `http://localhost:5174`).

---

## 🛡️ License

This project is licensed under the MIT License. See the LICENSE file for details.
All AI models used in this workspace belong to their respective creators (CodeFormer by sczhou, Real-ESRGAN by xinntao).
