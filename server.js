const express = require ('express');
const bcrypt = require ('bcrypt-nodejs');
const cors = require ('cors'); 
const knex = require ('knex');
const { response } = require('express');

const databasee = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1', //localhost
      user : 'postgres', //add your user name for the database here
      password : 'test', //add your correct password in here
      database : 'smartbrain' //add your database name you created here
    }
});

/*
databasee.select('*').from('users')
.then(data => { console.log(data);}) */ //this is how to grap data from a database using knex package

const app = express(); 
app.use(express.json());
app.use(cors());
/*****************************we are not goint to use this rout actually 
app.get('/', (req, res) =>{
    res.send(databasee.users); 
})
*/


/*********************this was our signIn page with local database and not with server 
app.post('/signIn', (req, res)=>{
    if (req.body.email === database.users[0].email && req.body.password === database.users[0].password){
       // res.json(database.users[0]); 
       res.json("success");
    } else {
        res.status(400).json('error logging in');
    }
} )
*/
app.post('/signIn', (req, res)=>{
    databasee.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data =>{   //the result here will be data = [anonymous {email:'wa@gmail.com', hash:'$251$$54jdhgeyegkh855'}] for exemple 
     const isValid =  bcrypt.compareSync(req.body.password, data[0].hash);  //we are comparing the blablabla which is the hash with the real password
     if (isValid){
        return  databasee.select('*').from('users')
         .where('email', '=', req.body.email)
         .then(user =>{
             res.json(user[0])
         })
         .catch(err => res.status(400).json('unable to get user signIn serverfile'))
     }else{
         res.status(400).json('wrong password signIn serverfile')
     }
    })
    .catch(err => res.status(400).json('wrong email credentials signIn serverfile'))
} )

/******************************************** this is how to register a user in  a local data base which is array or obj 
app.post('/register', (req, res) =>{
    const {email, name, password} = req.body; 
    database.users.push({
        id:'125', 
        name: name, 
        email: email, 
        entries: 0, 
        joined: new Date()
    })
    res.json(database.users[database.users.length-1]);
})
***********************************************************************************/


app.post('/register', (req, res) =>{
    const {email, name, password} = req.body; 
    const hash = bcrypt.hashSync(password);
    databasee.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail =>{
            return trx('users')
            .returning('*')
            .insert({
                email: loginEmail[0],
                name: name,
                joined: new Date()
            })
            .then (user => { res.json(user[0]);  })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json(err,'error register serverfile'))
})







app.get('/profile/:id', (req, res) =>{
    const {id} = req.params; 
    databasee.select('*').from('users').where({id})
    .then(user =>{
        if (user.length){
            res.json(user[0])
        }else {
            res.status(400).json('not found profile serverfile')
        }
    })
    .catch(err => res.status(400).json('erro getting user, profile serverfile'))
} )

app.put('/image', (req, res) =>{
    const {id} = req.body; 
    databasee('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0]);
    })
    .catch(err => res.status(400).json('unable to get entries image serverfile'))
} )



app.listen(3000, () =>{
    console.log('backend is running on port 3000')
})