const debug = require('debug')('app:inicio');
// const dbDebug = require('debug')('app:db');
const express = require('express');
const config = require('config');
const logger = require('./logger');
const app = express();
const Joi = require("@hapi/joi");
const morgan = require('morgan');
const { response } = require('express');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

// Configuración de entornos
console.log('Aplication: ' + config.get('nombre'));
console.log('DB Server: ' + config.get('configDB.host'));

if(app.get('env') === 'development'){
    // Uso de middleware de tercero - Morgan
    app.use(morgan('tiny'));
    // console.log('Morgan habilitado....');
    debug('Morgan está habilitado');
}

debug('Conectando con la db...');

app.use(logger);

const usuarios = [
    { id: 1, nombre: 'Grover' },
    { id: 2, nombre: 'Pablo' },
    { id: 3, nombre: 'Ana' }
]

app.get('/', (req, res) => {
    res.send('Hola mundo desde express');
})

app.get('/api/usuarios', (req, res) => {
    // res.send(['grover', 'luis', 'ana']);
    res.send(usuarios);
})

app.get('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id);
    if (!usuario) res.status(404).send('Usuario no encontrado');
    res.send(usuario);
})

app.get('/api/usuarios/:year/:mes', (req, res) => {
    res.send(req.params);
})

app.get('/api/usuarios/:year/:mes', (req, res) => {
    res.send(req.query);
})

app.post('/api/usuarios', (req, res) => {
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    })

    const { error, value } = schema.validate({ nombre: req.body.nombre })

    if (!error) {
        const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        }

        console.log(value);
        usuarios.push(usuario);
        res.send(usuario);
    } else {
        console.log(error);
        const message = error.details[0].message;
        res.status(400).send(message);
    }
})

app.put('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id);

    if (!usuario) {
        res.status(404).send('Usuario no encontrado');
        return;
    }

    const { error, value } = validaUsuario(req.body.nombre);

    if (error) {
        const message = error.details[0].message;
        res.status(400).send(message);
        return;
    }
    usuario.nombre = value.nombre;

    res.send(usuario);
})

app.delete('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id);
    if (!usuario) {
        res.status(404).send('Usuario no encontrado');
        return;
    }

    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1);
    res.send(usuarios);

})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}....`);
})

function existeUsuario(id) {
    return (usuarios.find(u => u.id === parseInt(id)));
}

function validaUsuario(nom) {
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    })
    return (schema.validate({ nombre: nom }));
}