module.exports = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          removeDimensions: false,
          removeXMLNS: false,
          cleanupIDs: false,
        }
      }
    }
  ]
};