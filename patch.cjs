
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/pages/StudyFlow.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix imports
content = content.replace(/orbFloat1Anim, orbFloat2Anim, orbFloat3Anim, deadlineShimmerAnim,/, 'orbFloat1Anim, orbFloat2Anim, orbFloat3Anim,');
content = content.replace(/import \{ COLORS, HIDE_SCROLLBAR \} from '\.\.\/styles';/, 'import { COLORS, HIDE_SCROLLBAR, fadeInUpAnim, deadlineShimmerAnim } from \"../styles\";');

// Fix double return
content = content.replace(/return \(\r?\n\s*return \(/, 'return (');

// Update orbs background
content = content.replace(/background: 'rgba\(144, 85, 255, 0\.4\)'/g, 'background: `${COLORS.primary}66`');
content = content.replace(/background: 'rgba\(19, 226, 218, 0\.3\)'/g, 'background: `${COLORS.secondary}4d`');
content = content.replace(/background: 'rgba\(124, 111, 247, 0\.15\)'/g, 'background: `${COLORS.accent}26`');

fs.writeFileSync(filePath, content);
console.log('Successfully patched StudyFlow.jsx');
