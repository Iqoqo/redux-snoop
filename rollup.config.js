import commonjs from "rollup-plugin-commonjs";
import sourceMaps from "rollup-plugin-sourcemaps";
import typescript from "rollup-plugin-typescript2";
import tslint from "rollup-plugin-tslint";
import localResolve from "rollup-plugin-local-resolve";

// import babel from 'rollup-plugin-babel';
const pkg = require("./package.json");
import path from "path";

const rollupBase = {
  sourcemap: true,

  watch: {
    include: "src/**"
  },
  plugins: [
    localResolve(),

    /**
     * Here we are using path.resolve('../../node_modules')+"/**"
     * So commonjs module will be able to resolve hoisted packages,
     * That is, common packages that are hoisted by yarn or lerna into the root directory
     */
    commonjs({
      include: [path.resolve("node_modules/**")],
        loglevel: ["noConflict"]
    }),

    typescript({ useTsconfigDeclarationDir: true}),

    sourceMaps(),

    tslint({
      exclude: [
        "node_modules/**"
      ]
    })
  ]
};

const snoopConfig = { ...rollupBase, input: `src/index.ts`,
output: [
  {
    file: pkg.main,
    name: "index",
    format: "umd"
  },
  { file: pkg.module, format: "es" }
]}



export default [snoopConfig]
