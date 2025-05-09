export default [
  {
    input: 'index.js',   // 진입점
    output: {
      file: 'dist/index.cjs',   // CJS용 출력 파일
      format: 'cjs',            // CommonJS 포맷
      exports: 'auto'           // export 방식 자동
    }
  },
  {
    input: 'index.js',
    output: {
      file: 'dist/index.mjs',   // ESM용 출력 파일
      format: 'esm'             // ESM 포맷
    }
  }
];