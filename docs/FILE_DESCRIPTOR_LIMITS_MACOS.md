# Fix File Descriptor Limits (macOS)

Fix "EMFILE: too many open files" error.

## Quick Fix

```bash
ulimit -n 65536
echo 'ulimit -n 65536' >> ~/.zshrc && source ~/.zshrc
```

## Permanent Fix

Create `/Library/LaunchDaemons/limit.maxfiles.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key><string>limit.maxfiles</string>
    <key>ProgramArguments</key>
    <array>
      <string>launchctl</string><string>limit</string><string>maxfiles</string>
      <string>65536</string><string>200000</string>
    </array>
    <key>RunAtLoad</key><true/>
  </dict>
</plist>
```

Load: `sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist`

Verify: `launchctl limit maxfiles` (should show 65536)

Clean: `cd ~/Desktop/code/study-buddy && rm -rf .next .turbo node_modules/.cache && npm run build`
