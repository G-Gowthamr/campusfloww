# CampusFlow

A fully functional, MERN-stack productivity app built for the **Codestorm Hackathon**.

## 🚀 How to Push this Project to GitHub

You are seeing the `git : The term 'git' is not recognized` error because **Git was just installed on your computer**, and your current terminal window hasn't updated its system variables yet to realize it's there!

Follow these exact steps to push your code:

### Step 1: Restart VS Code completely
1. Close Visual Studio Code.
2. Re-open Visual Studio Code and open the `CampusFlow` folder.
*This step is **crucial** because it refreshes your terminal so it recognizes the `git` command!*

### Step 2: Push your code
Open a new terminal in VS Code (`Terminal` -> `New Terminal`) and paste this exact command:

```bash
git push -u origin main
```

A GitHub sign-in window will pop up in your browser. Click **Sign in with Browser** and authorize the push.

*(Note: I already ran `git init`, `git add .`, and `git commit` for you, so you only need to run that single push command!)*

---

## 🌐 Deployment Instructions

Once your code is safely on GitHub, you can deploy the two halves of this application:

### 1. Backend (Render)
1. Go to [Render.com](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repository.
3. Settings:
   * **Root Directory**: `server`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
4. Add Environment Variable:
   * `MONGO_URI` = `mongodb+srv://...` (Your MongoDB Atlas connection string)
5. Copy the deployed Render URL (e.g. `https://campusflow-api.onrender.com`).

### 2. Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com) and create a **New Project**.
2. Connect your GitHub repository.
3. Settings:
   * **Framework Preset**: Vite
   * **Root Directory**: `client`
4. Add Environment Variable:
   * `VITE_API_URL` = Your Render URL from step 1 + `/api` (e.g. `https://campusflow-api.onrender.com/api`)
5. Click **Deploy**.

---

## 🔐 Hackathon Demo Credentials
When judges visit your Vercel link, they will see a login screen. They must use these credentials to enter the app:

*   **Username:** `demo_user`
*   **Password:** `demo_password`
