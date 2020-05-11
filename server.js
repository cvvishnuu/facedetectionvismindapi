const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
	client: 'pg',
	connection: {
		host: '127.0.0.1',
		user: 'postgres',
		password: 'test',
		database: 'smartbrain'
	}
});

db.select('*').from('users').then(data => {
	console.log(data);
});

const app = express();

app.use(bodyParser.json())
app.use(cors());

const database = {
	users: [
		{
			id: '123',
			name: 'vishnuu',
			email: 'vishnuu@gmail.com',
			password: 'cookies',
			entries: 0,
			joined: new Date()
		},
		{
			id: '124',
			name: 'jenisha',
			email: 'jenisha@gmail.com',
			password: 'chocolates',
			entries: 0,
			joined: new Date()
		}
	]
}

app.get('/', (req, res) => {
	res.json(database.users);
})

app.post('/signin', (req, res) => {
	const { email, password } = req.body;
	db.select('email', 'hash').from('login')
		.where('email', '=', email)
		.then(data => {
			const isValid = bcrypt.compareSync(password, data[0].hash);
			if(isValid) {
				return db.select('*').from('users')
					.where('email', '=', email)
					.then(user => {
						res.json(user[0])
					})
					.catch(err => res.status(400).json('Unable to get the user'))
			} else {
				res.status(400).json('Wrong User Credentials')
			}
		})
		.catch(err => res.status(400).json('Wrong User Credentials'))
})

app.post('/register', (req, res) => {
	const { name, email, password } = req.body;
	const hash = bcrypt.hashSync(password);
	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email: email
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			return trx('users')
				.returning('*')
				.insert({
					name: name,
					email: loginEmail[0],
					joined: new Date()
				})
				.then(user => {
					res.json(user[0]);
				})
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err => res.status(400).json('Unable to register'))
})

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	db.select('*').from('users').where({id})
		.then(user => {
			if(user.length){
				res.json(user[0]);
			} else {
				res.status(400).json('Not found');
			}
		})
		.catch(err => res.status(400).json('error getting the user'))

})

app.put('/image', (req, res) => {
	const { id } = req.body;
	db('users').where('id', '=', id)
	.increment('entries', 1)
	.returning('entries')
	.then(entries => {
		res.json(entries[0]);
	})
	.catch(err => res.status(400).json('unable to count the entries'))
})

app.listen(3001, () => {
	console.log('app is running on port 3001');
})

