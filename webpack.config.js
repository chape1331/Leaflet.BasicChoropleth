const path = require('path');

module.exports = {
    entry: './src/L.BasicChoropleth.js',
    output: {
        filename: 'L.BasicChoropleth.min.js',
        path: path.resolve(__dirname, 'dist')
    },
    mode: 'development',
    externals: {
        'leaflet': 'L'
    }
}
