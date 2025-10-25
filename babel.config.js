module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@assets': './assets',
            '@components': './components',
            '@screens': './app', // Você pode querer renomear este para '@app' para clareza
          },
        },
      ],
    ],
  };
};