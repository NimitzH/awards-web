const {VueLoaderPlugin} = require('vue-loader');
const config = require('./config');

module.exports = {
	mode: 'development',
	entry: './src/index.js',
	output: {
		path: config.publicDir,
		filename: 'index.js',
	},
	resolve: {
		extensions: [
			'.js',
			'.vue',
		],
	},
	target: 'web',
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader',
			},
			{
				test: /\.css$/,
				use: [
					'vue-style-loader',
					'css-loader',
				],
			},
			{
				test: /\.scss$/,
				use: [
					'vue-style-loader',
					'css-loader',
					'sass-loader',
				],
			},
			{
				test: /\.js$/,
				use: [
					'babel-loader',
				],
			},
		],
	},
	plugins: [
		new VueLoaderPlugin(),
	],
};
