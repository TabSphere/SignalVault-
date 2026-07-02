#!/bin/bash
set -e

echo "=========================================="
echo "  SignalVault Vercel Fix Script"
echo "=========================================="

# Step 1: Check if we're in the right folder
echo "Current folder: $(pwd)"

if [ ! -d "frontend" ]; then
  echo "ERROR: No 'frontend' folder found. Are you in the SignalVault project root?"
  exit 1
fi

if [ ! -f "frontend/package.json" ]; then
  echo "❌ Error: frontend/package.json not found"
  echo "   Make sure the frontend folder is complete"
  exit 1
fi

echo "[1/6] Found frontend/ folder - proceeding with fix..."

# Step 2: Move all frontend files to root for Vercel deployment
echo "[2/6] Moving frontend files to repo root..."

for item in frontend/public frontend/src frontend/README.md frontend/components.json frontend/eslint.config.js frontend/index.html frontend/info.md frontend/package.json frontend/postcss.config.js frontend/tailwind.config.js frontend/tsconfig.app.json frontend/tsconfig.json frontend/tsconfig.node.json frontend/vercel.json frontend/vite.config.ts; do
  if [ -e "$item" ]; then
    target=$(basename "$item")
    if [ -e "$target" ]; then
      echo "  Backing up existing $target to $target.backup"
      git mv "$target" "$target.backup"
    fi
    git mv "$item" .
    echo "  Moved $item to root"
  fi
done

echo "✅ Frontend files moved to repo root"

# Step 3: Handle any remaining files in frontend/
echo "[3/6] Checking for leftover files..."
if [ -d "frontend" ]; then
  for ignored in frontend/node_modules frontend/dist frontend/package-lock.json; do
    if [ -e "$ignored" ]; then
      rm -rf "$ignored"
      echo "  Removed $ignored"
    fi
  done

  remaining=$(find frontend -mindepth 1 -maxdepth 1 2>/dev/null)
  if [ -n "$remaining" ]; then
    echo "  Copying remaining files from frontend/ to root:"
    echo "$remaining" | sed 's/^/    /'
    shopt -s dotglob
    cp -r frontend/* . 2>/dev/null || true
    shopt -u dotglob
  fi

  git rm -r frontend 2>/dev/null || true
  rm -rf frontend
  echo "  Removed frontend/ directory"
fi

echo "[3/6] Files moved. Checking key files at root..."
ls -la package.json index.html vercel.json 2>/dev/null && echo "  OK - Key files present at root" || echo "  WARNING - Some files missing"

if [ ! -f ".env.local" ]; then
  echo "⚠️  Warning: No .env.local file found."
  echo "   Copy .env.example to .env.local and fill in your real keys."
fi

if grep -q "\.env\.local" .gitignore; then
  echo "✅ .env.local is gitignored"
else
  echo "⚠️  Adding .env.local to .gitignore..."
  echo ".env.local" >> .gitignore
fi

# Step 4: Pull latest changes
echo "[4/6] Pulling latest changes from GitHub..."
git pull origin main

# Step 5: Commit the fix
echo "[5/6] Committing changes..."
git add -A
git commit -m "fix: move frontend files to repo root for Vercel deployment" \
  -m "- Moved all frontend/ contents to repository root" \
  -m "- Removed empty frontend/ subfolder" \
  -m "- Vercel now finds package.json, index.html, and vite.config.ts at root" \
  -m "- Fixes 404 NOT_FOUND error on deployment" || echo "  Nothing to commit"

# Step 6: Push to GitHub
echo "[6/6] Pushing to GitHub..."
git push origin main

echo "=========================================="
echo "  DONE! Fix applied successfully."
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Vercel should auto-deploy from the GitHub push (if connected)."
echo "2. Go to https://vercel.com/dashboard and check the deployment."
echo "3. Set Environment Variables in Vercel:"
echo "   VITE_SUPABASE_URL"
echo "   VITE_SUPABASE_ANON_KEY"
echo "   VITE_STRIPE_PUBLISHABLE_KEY"
echo "4. Make sure Project Privacy is set to Public."
