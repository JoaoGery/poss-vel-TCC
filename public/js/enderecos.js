document.addEventListener('DOMContentLoaded', () => {
  const estado = document.querySelector('[data-estado]');
  const cidade = document.querySelector('[data-cidade]');
  const cidades = document.querySelector('[data-lista-cidades]');

  if (!estado || !cidade || !cidades) return;

  const carregarCidades = async () => {
    const uf = estado.value;
    cidades.replaceChildren();

    if (!uf) {
      cidade.placeholder = 'Escolha primeiro o estado';
      return;
    }

    cidade.placeholder = 'Carregando cidades...';

    try {
      const resposta = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${encodeURIComponent(uf)}/municipios`);
      if (!resposta.ok) throw new Error('Não foi possível consultar municípios.');

      const municipios = await resposta.json();
      const fragmento = document.createDocumentFragment();

      municipios
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
        .forEach((municipio) => {
          const opcao = document.createElement('option');
          opcao.value = municipio.nome;
          fragmento.appendChild(opcao);
        });

      cidades.appendChild(fragmento);
      cidade.placeholder = 'Digite ou escolha uma cidade';
    } catch (erro) {
      cidade.placeholder = 'Digite a cidade';
      console.warn('Não foi possível carregar as cidades do IBGE.', erro);
    }
  };

  estado.addEventListener('change', () => {
    cidade.value = '';
    carregarCidades();
  });

  if (estado.value) carregarCidades();
});
