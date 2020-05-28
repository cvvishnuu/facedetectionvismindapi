const Clarifai = require('clarifai');

const app = new Clarifai.App({
 apiKey: 'aec7195bae514651bcc54fd03c082187'
});

const handleApiCall = (req, res) => {
	const { input } = req.body;
	if(input.value === '') {
		res.status(400);
	} else {
		app.models
			.predict(Clarifai.FACE_DETECT_MODEL, input)
			.then(data => {
				res.json(data);
			})	
			.catch(err => res.status(400).json('Unable to work with the API'))
	}
}

const handleImage = (req, res, db) => {
	const { id } = req.body;
	db('users').where('id', '=', id)
	.increment('entries', 1)
	.returning('entries')
	.then(entries => {
		res.json(entries[0]);
	})
	.catch(err => res.status(400).json('unable to count the entries'))
}

module.exports = {handleImage, handleApiCall}