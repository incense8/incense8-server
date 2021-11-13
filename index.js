const app = require('./src/app');

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
	console.log(`app is listning http://localhost:${PORT}`);
});
