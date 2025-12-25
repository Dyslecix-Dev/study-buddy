# 1. Verify the launch daemons are active (should show 65536)

launchctl limit maxfiles

# 2. Open a new terminal and verify your session limit

ulimit -n

# 3. If step 2 shows less than 65536, add to your shell config

echo 'ulimit -n 65536' >> ~/.zshrc

# 4. Reload your shell config

source ~/.zshrc

# 5. Verify again

ulimit -n

# 6. Navigate to your project

cd ~/Desktop/code/study-buddy

# 7. Clean all build artifacts

rm -rf .next .turbo node_modules/.cache

# 8. Run your build

npm run build

# Or for development

npm run dev
