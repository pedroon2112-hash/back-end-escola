const API_URL = '/api/alunos';

// Elementos
const form = document.getElementById('aluno-form');
const tbody = document.getElementById('alunos-tbody');
const btnCancel = document.getElementById('btn-cancel');
const btnSubmit = document.getElementById('btn-save');

// Campos do formulário
const inputId = document.getElementById('aluno-id');
const inputNome = document.getElementById('nome');
const inputEmail = document.getElementById('email');
const inputCurso = document.getElementById('curso');
const inputCpf = document.getElementById('cpf');
const inputTelefone = document.getElementById('telefone');
const inputIdade = document.getElementById('idade');

// Estado local
let editandoId = null;


// ===============================
// CARREGAR ALUNOS
// ===============================

async function carregarAlunos() {
    try {
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error('Erro ao buscar alunos');
        }

        const alunos = await resposta.json();

        tbody.innerHTML = '';

        if (alunos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center;">
                        Nenhum aluno encontrado.
                    </td>
                </tr>
            `;
            return;
        }

        alunos.forEach(aluno => {
            const tr = document.createElement('tr');
            const celulas = [aluno.id, aluno.nome, aluno.email, aluno.curso, aluno.cpf || '—', aluno.telefone || '—', aluno.idade ?? '—'];
            celulas.forEach(valor => {
                const td = document.createElement('td');
                td.textContent = valor;
                tr.appendChild(td);
            });
            const acoes = document.createElement('td');
            acoes.className = 'actions';
            const editar = document.createElement('button');
            editar.className = 'btn-icon btn-edit';
            editar.textContent = 'Editar';
            editar.addEventListener('click', () => iniciarEdicao(aluno));
            const excluir = document.createElement('button');
            excluir.className = 'btn-icon btn-delete';
            excluir.textContent = 'Excluir';
            excluir.addEventListener('click', () => deletarAluno(aluno.id));
            acoes.append(editar, excluir);
            tr.appendChild(acoes);
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Erro ao carregar alunos:', error);

        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center;">
                    Erro ao carregar alunos.
                </td>
            </tr>
        `;
    }
}


// ===============================
// SALVAR / EDITAR ALUNO
// ===============================

form.addEventListener('submit', async (e) => {

    e.preventDefault();

    const aluno = {
        nome: inputNome.value.trim(),
        email: inputEmail.value.trim(),
        curso: inputCurso.value,
        cpf: inputCpf.value.trim(),
        telefone: inputTelefone.value.trim(),
        idade: Number(inputIdade.value)
    };

    try {

        let resposta;

        // EDITAR
        if (editandoId !== null) {

            resposta = await fetch(`${API_URL}/${editandoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(aluno)
            });

        }

        // CADASTRAR
        else {

            resposta = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(aluno)
            });

        }

        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => ({}));
            throw new Error(erro.error || 'Servidor não conseguiu salvar o aluno');
        }

        resetarFormulario();

        await carregarAlunos();

    } catch (error) {

        console.error('Erro ao salvar:', error);

        alert(error.message);
    }
});


// ===============================
// INICIAR EDIÇÃO
// ===============================

function iniciarEdicao(aluno) {
    const { id, nome, email, curso, cpf, telefone, idade } = aluno;

    editandoId = id;

    inputId.value = id;
    inputNome.value = nome;
    inputEmail.value = email;
    inputCurso.value = curso;
    inputCpf.value = cpf || "";
    inputTelefone.value = telefone || "";
    inputIdade.value = idade ?? "";

    btnSubmit.textContent = 'Salvar Alterações';

    btnCancel.style.display = 'inline-block';
}


// ===============================
// CANCELAR EDIÇÃO
// ===============================

btnCancel.addEventListener('click', () => {
    resetarFormulario();
});


// ===============================
// RESETAR FORMULÁRIO
// ===============================

function resetarFormulario() {

    form.reset();

    inputId.value = '';

    editandoId = null;

    btnSubmit.textContent = 'Salvar Aluno';

    btnCancel.style.display = 'none';
}


// ===============================
// EXCLUIR ALUNO
// ===============================

async function deletarAluno(id) {

    const confirmar = confirm(
        'Tem certeza que deseja excluir este aluno?'
    );

    if (!confirmar) {
        return;
    }

    try {

        const resposta = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!resposta.ok) {
            throw new Error('Erro ao excluir aluno');
        }

        await carregarAlunos();

    } catch (error) {

        console.error('Erro ao excluir:', error);

        alert('Erro ao excluir aluno.');
    }
}


// ===============================
// CARREGAR AO ABRIR A PÁGINA
// ===============================

carregarAlunos();
function mascararCPF(valor) {
    return valor.replace(/\D/g, '').slice(0,11).replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2');
}
function mascararTelefone(valor) {
    const d = valor.replace(/\D/g, '').slice(0,11);
    if (d.length <= 2) return d ? '(' + d : '';
    if (d.length <= 6) return '(' + d.slice(0,2) + ') ' + d.slice(2);
    return '(' + d.slice(0,2) + ') ' + d.slice(2, d.length === 11 ? 7 : 6) + '-' + d.slice(d.length === 11 ? 7 : 6);
}
inputCpf.addEventListener('input', () => inputCpf.value = mascararCPF(inputCpf.value));
inputTelefone.addEventListener('input', () => inputTelefone.value = mascararTelefone(inputTelefone.value));
