const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const DB_FILE = path.join(__dirname, 'db.json');

// ===============================
// MIDDLEWARES
// ===============================

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// ===============================
// LER BANCO DE DADOS
// ===============================

function lerBancoDados() {

    if (!fs.existsSync(DB_FILE)) {

        fs.writeFileSync(
            DB_FILE,
            JSON.stringify({ alunos: [] }, null, 2)
        );

    }

    const data = fs.readFileSync(DB_FILE, 'utf-8');

    return JSON.parse(data);
}


// ===============================
// SALVAR BANCO DE DADOS
// ===============================

function salvarBancoDados(data) {

    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(data, null, 2)
    );

}


function cpfValido(cpf) {
    const d = String(cpf || '').replace(/\D/g, '');
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
    for (let tamanho = 9; tamanho < 11; tamanho++) {
        let soma = 0;
        for (let i = 0; i < tamanho; i++) soma += Number(d[i]) * (tamanho + 1 - i);
        const digito = (soma * 10) % 11 % 10;
        if (digito !== Number(d[tamanho])) return false;
    }
    return true;
}
function validarExtras(cpf, telefone, idade) {
    if (!cpfValido(cpf)) return 'CPF inválido.';
    if (!/^\d{10,11}$/.test(String(telefone || '').replace(/\D/g, ''))) return 'Telefone inválido.';
    if (!Number.isInteger(Number(idade)) || idade === '' || idade === null || Number(idade) < 0 || Number(idade) > 120) return 'Idade inválida.';
    return null;
}

// ===============================
// CREATE - CADASTRAR ALUNO
// ===============================

app.post('/api/alunos', (req, res) => {

    const { nome, email, curso, cpf, telefone, idade } = req.body;

    // Validação dos campos
    if (!nome || !email || !curso) {

        return res.status(400).json({
            error: 'Todos os campos são obrigatórios.'
        });

    }

    const erroExtras = validarExtras(cpf, telefone, idade);
    if (erroExtras) return res.status(400).json({ error: erroExtras });

    const db = lerBancoDados();

    // Calcula o próximo ID
    // Ignora registros antigos que não possuem ID

    const nextId = db.alunos.length > 0
        ? Math.max(
            0,
            ...db.alunos.map(a => Number(a.id) || 0)
        ) + 1
        : 1;

    // Criar novo aluno
    const novoAluno = {
        id: nextId,
        nome,
        email,
        curso,
        cpf: String(cpf).replace(/\D/g, ""),
        telefone: String(telefone).replace(/\D/g, ""),
        idade: Number(idade)
    };

    // Adicionar ao banco
    db.alunos.push(novoAluno);

    // Salvar no db.json
    salvarBancoDados(db);

    // Retornar aluno cadastrado
    res.status(201).json(novoAluno);

});


// ===============================
// READ - LISTAR ALUNOS
// ===============================

app.get('/api/alunos', (req, res) => {


    const db = lerBancoDados();

    res.json(db.alunos);

});


// ===============================
// UPDATE - EDITAR ALUNO
// ===============================

app.put('/api/alunos/:id', (req, res) => {

    const id = parseInt(req.params.id);

    const { nome, email, curso, cpf, telefone, idade } = req.body;

    // Validar campos
    if (!nome || !email || !curso) {

        return res.status(400).json({
            error: 'Todos os campos são obrigatórios.'
        });

    }

    const erroExtras = validarExtras(cpf, telefone, idade);
    if (erroExtras) return res.status(400).json({ error: erroExtras });
    const db = lerBancoDados();

    // Procurar aluno pelo ID
    const index = db.alunos.findIndex(
        a => a.id === id
    );

    if (index === -1) {

        return res.status(404).json({
            error: 'Aluno não encontrado.'
        });

    }

    // Atualizar dados
    db.alunos[index] = {
        ...db.alunos[index],
        nome,
        email,
        curso,
        cpf: String(cpf).replace(/\D/g, ""),
        telefone: String(telefone).replace(/\D/g, ""),
        idade: Number(idade)
    };

    // Salvar alterações
    salvarBancoDados(db);

    res.json(db.alunos[index]);

});


// ===============================
// DELETE - EXCLUIR ALUNO
// ===============================

app.delete('/api/alunos/:id', (req, res) => {

    const id = parseInt(req.params.id);

    const db = lerBancoDados();

    // Procurar aluno
    const index = db.alunos.findIndex(
        a => a.id === id
    );

    if (index === -1) {

        return res.status(404).json({
            error: 'Aluno não encontrado.'
        });

    }

    // Remover aluno
    db.alunos.splice(index, 1);

    // Salvar alterações
    salvarBancoDados(db);

    res.status(204).send();

});


// ===============================
// INICIAR SERVIDOR
// ===============================

app.listen(PORT, () => {

    console.log('================================');

    console.log(`Servidor rodando na porta ${PORT}`);

    console.log(`Acesse: http://localhost:${PORT}`);

    console.log('Banco de dados: db.json');

    console.log('================================');

});