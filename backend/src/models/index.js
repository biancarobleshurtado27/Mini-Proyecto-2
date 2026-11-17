import { DataTypes, Sequelize } from 'sequelize'

export const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', logging: false })
const base = { sequelize, timestamps: false, freezeTableName: true }
export const Colaborador = sequelize.define('colaboradores', { id: { type: DataTypes.INTEGER, primaryKey: true }, nombre: DataTypes.STRING, departamento: DataTypes.STRING, puesto: DataTypes.STRING, fecha_ingreso: DataTypes.DATEONLY, estado: DataTypes.STRING }, base)
export const Usuario = sequelize.define('usuarios', { id: { type: DataTypes.INTEGER, primaryKey: true }, email: DataTypes.STRING, password_hash: DataTypes.STRING, rol: DataTypes.STRING, colaborador_id: DataTypes.INTEGER, activo: DataTypes.BOOLEAN }, base)
export const SaldoVacaciones = sequelize.define('saldos_vacaciones', { id: { type: DataTypes.INTEGER, primaryKey: true }, colaborador_id: DataTypes.INTEGER, periodo: DataTypes.STRING, dias_asignados: DataTypes.INTEGER, dias_tomados: DataTypes.INTEGER, dias_disponibles: DataTypes.INTEGER }, base)
export const Solicitud = sequelize.define('solicitudes', { id: { type: DataTypes.INTEGER, primaryKey: true }, colaborador_id: DataTypes.INTEGER, tipo: DataTypes.STRING, fecha_inicio: DataTypes.DATEONLY, fecha_fin: DataTypes.DATEONLY, estado: DataTypes.STRING, creada_en: DataTypes.DATE }, base)
export const Incapacidad = sequelize.define('incapacidades', { id: { type: DataTypes.INTEGER, primaryKey: true }, colaborador_id: DataTypes.INTEGER, tipo: DataTypes.STRING, fecha_inicio: DataTypes.DATEONLY, dias: DataTypes.INTEGER, entidad: DataTypes.STRING }, base)
export const Documento = sequelize.define('documentos', { id: { type: DataTypes.INTEGER, primaryKey: true }, drive_file_id: DataTypes.STRING, nombre: DataTypes.STRING, drive_url: DataTypes.STRING, contenido_hash: DataTypes.STRING, eliminado: DataTypes.BOOLEAN }, base)
export const DocumentChunk = sequelize.define('document_chunks', { id: { type: DataTypes.INTEGER, primaryKey: true }, documento_id: DataTypes.INTEGER, seccion: DataTypes.STRING, contenido: DataTypes.TEXT, embedding: DataTypes.TEXT, metadata_json: DataTypes.JSONB }, base)
export const ConsultaChat = sequelize.define('consultas_chat', { id: { type: DataTypes.INTEGER, primaryKey: true }, colaborador_id: DataTypes.INTEGER, pregunta: DataTypes.TEXT, intencion: DataTypes.STRING, agente: DataTypes.STRING, documentos_citados: DataTypes.JSONB, resuelta: DataTypes.BOOLEAN, escalada: DataTypes.BOOLEAN, latencia_ms: DataTypes.INTEGER }, base)
export const ReporteDiario = sequelize.define('reportes_diarios', { id: { type: DataTypes.INTEGER, primaryKey: true }, fecha: DataTypes.DATEONLY, datos_json: DataTypes.JSONB, resumen_texto: DataTypes.TEXT, generado_por: DataTypes.STRING }, base)
Documento.hasMany(DocumentChunk, { foreignKey: 'documento_id' })
DocumentChunk.belongsTo(Documento, { foreignKey: 'documento_id' })
