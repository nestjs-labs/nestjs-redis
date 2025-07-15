export default {
  '*.ts': ['prettier --write', 'eslint --fix', () => 'tsc --project tsconfig.build.json --noEmit']
};
