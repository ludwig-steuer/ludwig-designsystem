/**
 * An SVG imported with `?url`: Vite hands over its served path; the Next.js
 * framework of Storybook wraps it as `{ src }`. `Frame.tsx` reads both.
 */
declare module "*.svg?url" {
  const asset: string | { src: string };
  export default asset;
}
