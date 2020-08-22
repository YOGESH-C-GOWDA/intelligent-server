const express = require("express");
const bodyParser = require("body-parser");
const { emit } = require("nodemon");//  not needed ????
const cors = require("cors");
const knex = require("knex");
// const bcrypt = require("bcrypt");



const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'test',
        database: 'smartbrain'
    }
});

const pro = db.select('*').from('users');
// console.log("p = ", pro);
// pro.then(data => console.log(data));


const app = express();

let u = 0, g = 0, p = 0;

// Middle Ware

// app.use((req, res, next) => {
//     console.log("Use", ++u);
//     next();
// })

app.use(bodyParser.json());
app.use(cors());



app.get("/", (req, res) => {

    console.log("get", ++g);

    res.json("YOGESH ITS WORKING ");


});

app.post("/signin", (req, res) => {
    console.log("post signin ", ++p);
    // console.log("signin req.body", JSON.parse(req.body));

    console.log(req.body);

    db
        .select('email', 'hash')
        .from('login')
        .where('email', '=', req.body.email)
        .then(user => {
            console.log("hash value  = ", user);
            console.log("hash value  = ", user[0].hash);
            const isValid = bcrypt.compareSync(req.body.password, user[0].hash);
            console.log("Validation = ", isValid);
            if (isValid) {
                return db.select('*')
                    .from('users')
                    .where('email', '=', req.body.email)
                    .then(user => {
                        res.json(user[0])
                    })
                    .catch(err => res.status(400).json('unable to get users'))

            } else {
                return res.status(400).json('wrong credentials plz try again')
            }
        })
        .catch(err => console.log("error = ", err));

})

app.post("/register", (req, res) => {

    console.log("hello its the reguster");

    const { name, password, email } = req.body;

    console.log("name", name);
    console.log("password", password);
    console.log("password type", typeof (password));

    const saltRounds = 10;
    const hash = bcrypt.hashSync(String(password), saltRounds);
    console.log(hash);

    const correct = bcrypt.compareSync("123456", hash); // true
    const wrong = bcrypt.compareSync("preetu", hash); // false

    console.log("correct", correct);
    console.log("worng", wrong);

    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                //return is extremely imp else program hangs;
                return trx('users')
                    .returning('*')
                    .insert({
                        email: loginEmail[0],
                        name: name,
                        joined: new Date()
                    })
                    .then(user => { res.json(user[0]) })
            })
            //most important line trx.commit
            .then(trx.commit)
            .catch(trx.rollback)


    }).catch(err => { res.status(400).json("could not register") });

})

app.get("/profile/:id", (req, res) => {

    console.log("profile");
    const { id } = req.params;
    console.log("id", id);

    db
        .select('*')
        .from('users')
        .where({ id: id })
        .then(user => {
            if (user.length > 0) {
                res.json(user);
            } else {
                res.status(400).json("Invalid ");
            }
        })
        .catch(err => res.status(400).json("Error: Sorry cant respond to ur request "));


})

app.put("/image", (req, res) => {
    console.log("image");
    const { id } = req.body;
    console.log(req.body);
    console.log("id", id);

    let found = false;
    dataBase.map((person) => {
        console.log("map");
        console.log(person);
        if (person.id == id) {
            found = true;
            ++person.rank
            res.json(person);
            return;
        }
    })
    if (found === false) {
        res.status(404).json("was unsucessfull response ")
    }
})

app.listen(process.env.PORT || 5555, () => {
    console.log(`listening to request on port ${process.env.PORT} or 5555`)
});
