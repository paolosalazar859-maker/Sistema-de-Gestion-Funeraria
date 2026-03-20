const { execSync } = require('child_process');
const path = require('path');

exports.default = async function afterPack(context) {
  const appOutDir = context.appOutDir;
  const platform = context.packager.platform.name;
  
  console.log('🔧 Recompilando better-sqlite3 para producción...');
  
  try {
    // Recompilar better-sqlite3 para la plataforma de destino
    execSync('npx electron-rebuild -f -w better-sqlite3', {
      cwd: context.appDir,
      stdio: 'inherit'
    });
    console.log('✅ better-sqlite3 recompilado exitosamente');
  } catch (error) {
    console.error('❌ Error recompilando better-sqlite3:', error);
  }
};
