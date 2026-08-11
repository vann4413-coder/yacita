const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Ver todo el monorepo
config.watchFolders = [monorepoRoot];

// Resolver módulos desde la app y desde la raíz
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Permitir importar los paquetes @yacita/* como código fuente TS
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
