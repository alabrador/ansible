module.exports = {
  reactStrictMode: true,
  env: {
    AWX_API_URL: process.env.AWX_API_URL,
    AWX_USERNAME: process.env.AWX_USERNAME,
    AWX_PASSWORD: process.env.AWX_PASSWORD,
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};