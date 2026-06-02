
 export default class GeralController {
 
    constructor() {
        this.home = async (req, res) => {
          try {
            // Importar modelos
            const { default: Cliente } = await import('../models/cliente.js');
            const { default: Manutencao } = await import('../models/manutencao.js');
            const { default: Componente } = await import('../models/componente.js');

            // Buscar estatísticas
            const totalClientes = await Cliente.countDocuments();
            const totalManutencoes = await Manutencao.countDocuments();
            const totalEmAnalise = await Manutencao.countDocuments({ status: 'em_analise' });
            const totalEmReparo = await Manutencao.countDocuments({ status: 'em_reparo' });
            const totalConcluidas = await Manutencao.countDocuments({ status: 'concluido' });
            const totalComponentes = await Componente.countDocuments();

            // Buscar manutenções recentes
            const manutencoes = await Manutencao.find()
              .populate('cliente')
              .sort({ dataEntrada: -1 })
              .limit(5)
              .lean();

            res.render('dashboard', {
              totalClientes,
              totalManutencoes,
              totalEmAnalise,
              totalEmReparo,
              totalConcluidas,
              totalComponentes,
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

