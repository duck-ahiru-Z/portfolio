const fs = require('fs');
const path = require('path');

console.log('Starting build process to generate net-mode (anonymous) portfolio...');

// 1. net フォルダのクリーンアップ＆再作成
const netDir = path.join(__dirname, 'net');
if (fs.existsSync(netDir)) {
  fs.rmSync(netDir, { recursive: true, force: true });
}
fs.mkdirSync(netDir);

// 2. 再帰的コピー関数 (net, .git, node_modules はコピー除外)
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    const base = path.basename(src);
    if (base === 'net' || base === '.git' || base === 'node_modules' || base === '.gemini') {
      return;
    }
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    // スクリプトファイル自体はコピーしない
    if (path.basename(src) === 'build.js') {
      return;
    }
    fs.copyFileSync(src, dest);
  }
}

// コピー実行
copyRecursive(__dirname, netDir);

// 3. /net/data/profile.json の匿名化上書き
const netProfilePath = path.join(netDir, 'data', 'profile.json');
if (fs.existsSync(netProfilePath)) {
  try {
    const profile = JSON.parse(fs.readFileSync(netProfilePath, 'utf8'));
    
    // ネット用の値で上書き (大学名や団体名はそのまま維持)
    if (profile.netName) {
      profile.name = profile.netName;
    }
    if (profile.netEmail) {
      profile.email = profile.netEmail;
    }
    
    // ネット用の一時キーを削除
    delete profile.netName;
    delete profile.netEmail;
    
    fs.writeFileSync(netProfilePath, JSON.stringify(profile, null, 2), 'utf8');
    console.log('- data/profile.json successfully anonymized.');
  } catch (err) {
    console.error('Error processing profile.json:', err);
  }
}

// 4. /net/README.md の本名置換
const netReadmePath = path.join(netDir, 'README.md');
if (fs.existsSync(netReadmePath)) {
  try {
    let readme = fs.readFileSync(netReadmePath, 'utf8');
    
    // 「岩倉 隼人」および「岩倉隼人」を「あひる」に自動置換して同期
    readme = readme.replace(/岩倉\s*隼人/g, 'あひる');
    
    fs.writeFileSync(netReadmePath, readme, 'utf8');
    console.log('- README.md successfully anonymized and synced.');
  } catch (err) {
    console.error('Error processing README.md:', err);
  }
}

console.log('Success! Anonymous portfolio generated in /net directory.');
