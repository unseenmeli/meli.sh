# Deploying Visitor Counter to Render

## Steps to Deploy:

1. **Push to GitHub** (if not already done):
   ```bash
   git add server.js package.json
   git commit -m "Add visitor counter backend"
   git push
   ```

2. **Create Render Account**:
   - Go to https://render.com
   - Sign up with GitHub

3. **Deploy the Backend**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repo (meli.sh)
   - Configure:
     - **Name**: meli-visitor-counter (or any name)
     - **Root Directory**: leave blank (uses repo root)
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free
   - Click "Create Web Service"

4. **Get Your WebSocket URL**:
   - After deployment, you'll get a URL like: `https://meli-visitor-counter.onrender.com`
   - Your WebSocket URL will be: `wss://meli-visitor-counter.onrender.com`

5. **Update Frontend**:
   - Edit `script.js` line 29
   - Replace `'wss://your-app-name.onrender.com'` with your actual URL
   - Commit and push the change

## Testing Locally First:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run server locally:
   ```bash
   npm start
   ```

3. Update script.js temporarily to use local WebSocket:
   ```javascript
   const WS_URL = 'ws://localhost:3001';
   ```

4. Open your site and check console for connection messages

## Notes:
- Free tier sleeps after 15 min of inactivity
- First visitor after sleep sees delay (server waking up)
- Once awake, real-time updates work perfectly