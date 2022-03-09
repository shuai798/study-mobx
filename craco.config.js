const { when, whenDev, whenProd, whenTest, ESLINT_MODES, POSTCSS_MODES } = require('@craco/craco');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CracoLessPlugin = require('craco-less');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

const isEnvDevelopment = process.env.REACT_APP_ENV === 'dev';

const isEnvSystemIntegration = process.env.REACT_APP_ENV === 'sit';

const isEnvAcceptance = process.env.REACT_APP_ENV === 'uat';

const isEnvProduction = process.env.REACT_APP_ENV === 'prod';

const localIdentName = '[local]__[hash:base64:5]';
const Version = new Date().getTime();

module.exports = {
	webpack: {
		alias: {
			'@': path.resolve('src'),
		},
		plugins: [
			new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
			new HardSourceWebpackPlugin(),
			new SimpleProgressWebpackPlugin({ format: 'minimal' }),
			...when(
				isEnvDevelopment,
				() => [
					new CircularDependencyPlugin({
						exclude: /node_modules/,
						include: /src/,
						failOnError: true,
						allowAsyncCycles: false,
						cwd: process.cwd(),
					}),
				],
				[],
			),
			...when(
				isEnvAcceptance,
				() => [
					new BundleAnalyzerPlugin({
						analyzerMode: 'static',
						openAnalyzer: true,
						logLevel: 'info',
					}),
				],
				[],
			),
			...when(
				isEnvProduction,
				() => [
					new TerserPlugin({
						parallel: true,
						cache: true,
						// sourceMap: false, // Must be set to true if using source-maps in production
						terserOptions: {
							ecma: undefined,
							parse: { ecma: 8 },
							compress: {
								unused: true,
								dead_code: true,
								ecma: 5,
								comparisons: false,
								inline: 2,
								warnings: false,
								drop_console: true,
								drop_debugger: true,
								pure_funcs: ['console.log'],
							},
						},
					}),
					new CompressionWebpackPlugin({
						algorithm: 'gzip',
						test: new RegExp('\\.(' + ['js', 'css'].join('|') + ')$'),
						threshold: 10240,
						minRatio: 0.8,
					}),
				],
				[],
			),
		],
		configure: (webpackConfig, { env, paths }) => {
			paths.appBuild = 'dmp';
			webpackConfig.output = {
				...webpackConfig.output,
				// del chunk
				chunkFilename: `static/js/[name].[contenthash:8].${Version}.js`,
				// chunkFilename: `static/js/[name].[contenthash:8].js`,
				// ...when(
				// 	isEnvSystemIntegration && isEnvAcceptance,
				// 	() => ({
				// 		filename: 'static/js/[name].js',
				// 		chunkFilename: 'static/js/[name].js',
				// 	}),
				// 	{}
				// ),
				path: path.resolve(__dirname, 'dmp'),
				publicPath: './',
			};

			webpackConfig.plugins.map((plugin) => {
				/**
				 * 支持移除 css 文件名的 hash 值
				 */
				if (plugin instanceof MiniCssExtractPlugin) {
					Object.assign(
						plugin.options,
						{
							ignoreOrder: true,
							// del chunk
							chunkFilename: `static/css/[name].[contenthash:8].${Version}.css`,
							// chunkFilename: `static/css/[name].[contenthash:8].css`,
						},
						// when(
						// 	isEnvSystemIntegration && isEnvAcceptance,
						// 	() => ({
						// 		filename: 'static/css/[name].css',
						// 		chunkFilename: 'static/css/[name].css',
						// 	}),
						// 	{}
						// )
					);
				}

				return plugin;
			});
			/**
			 * webpack split chunks
			 */
			webpackConfig.optimization.splitChunks = {
				...webpackConfig.optimization.splitChunks,
				...{
					chunks: 'all',
					// minSize: 30000,
					// minChunks: 1,
					// maxAsyncRequests: 5,
					// maxInitialRequests: 3,
					// automaticNameDelimiter: '~',
					name: 'vender',
					cacheGroups: {
						vendors: {
							test: /[\\/]node_modules[\\/]/,
							name: 'vendors',
							minSize: 30000,
							minChunks: 1,
							chunks: 'initial',
							priority: 1,
						},
						commons: {
							test: /[\\/]src[\\/]/,
							name: 'commons',
							minSize: 30000,
							minChunks: 2,
							chunks: 'initial',
							priority: -1,
							reuseExistingChunk: true,
						},
						antdDesign: {
							name: 'antd-design',
							priority: 20,
							test: /[\\/]node_modules[\\/]@ant-design[\\/]/,
							chunks: 'all',
						},
						reactLib: {
							name: 'react-lib',
							priority: 20,
							test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom|lodash)[\\/]/,
							chunks: 'all',
						},
						// styles: {
						// 	name: false,
						// 	test: /\.css$/,
						// 	chunks: 'all',
						// 	enforce: true,
						// },
					},
				},
			};
			return webpackConfig;
		},
	},
	babel: {
		plugins: [
			['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
			['@babel/plugin-proposal-decorators', { legacy: true }],
		],
		loaderOptions: (babelLoaderOptions, { env, paths }) => {
			return babelLoaderOptions;
		},
	},
	plugins: [
		{
			plugin: CracoLessPlugin,
			options: {
				lessLoaderOptions: {
					lessOptions: {
						modifyVars: {
							'@primary-color': '#007EED',
							'@link-color': '#007EED',
							'@font-size-base': '12px',
							'@text-color': 'rgb(51,51,51)',
							'@border-radius-base': '0',
							'@border-color-base': '#DEDEDE',
						},
						localIdentName: localIdentName,
						javascriptEnabled: true,
					},
				},
			},
		},
	],
};
