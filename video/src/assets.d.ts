// Schriftdateien werden vom Remotion-Bundler als URL eingebunden.
declare module "*.woff2" {
  const url: string;
  export default url;
}
