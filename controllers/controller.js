
 export default class GeralController {
 
    constructor() {
        this.home = async (req, res) => {
          try {
            // Importar modelos
            const { default: Cliente } = await import('../models/cliente.js');
            const { default: Manutencao } = await import('../models/manutencao.js');
            const { default: Componente } = await import('../models/componente.js');

            // Buscar estatísticas
            const [
              totalClientes,
              totalManutencoes,
              totalEmAnalise,
              totalEmReparo,
              totalConcluidas,
              totalComponentes,
              faturamento,
              componentesBaixos,
              manutencoes
            ] = await Promise.all([
              Cliente.countDocuments(),
              Manutencao.countDocuments(),
              Manutencao.countDocuments({ status: 'em_analise' }),
              Manutencao.countDocuments({ status: 'em_reparo' }),
              Manutencao.countDocuments({ status: 'concluido' }),
              Componente.countDocuments(),
              Manutencao.aggregate([
                { $match: { status: 'concluido' } },
                { $group: { _id: null, total: { $sum: '$valorTotal' } } }
              ]),
              Componente.find({ quantidadeDisponivel: { $lte: 5 } }).sort({ quantidadeDisponivel: 1, nome: 1 }).limit(5).lean(),
              Manutencao.find().populate('cliente').sort({ dataEntrada: -1 }).limit(5).lean()
            ]);

            res.render('dashboard', {
              totalClientes,
              totalManutencoes,
              totalEmAnalise,
              totalEmReparo,
              totalConcluidas,
              totalComponentes,
              faturamentoConcluido: faturamento[0]?.total || 0,
              componentesBaixos,
              manutencoes
            });
          } catch (err) {
            console.error(err);
            res.render('dashboard', { 
              totalClientes: 0, 
              totalManutencoes: 0, 
              totalEmAnalise: 0, 
              totalEmReparo: 0, 
              totalConcluidas: 0, 
              totalComponentes: 0,
              faturamentoConcluido: 0,
              componentesBaixos: [],
              manutencoes: []
            });
          }
        };

        this.homesite= async (req, res) => {
          res.render('site/index');
        };

        this.formulario = async (req, res) => {
          res.render('index')
        };

    }
 }
