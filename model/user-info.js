import mongoose, {Schema, SchemaTypes} from 'mongoose';

const schema = new Schema({
	login: {
		type: SchemaTypes.String,
		default: '',
	},
	password: {
		type: SchemaTypes.String,
		default: null,
	},
	email: {
		type: SchemaTypes.String,
		default: '',
	},
	googleId: {
	type: SchemaTypes.Number,
		default: '',
	}
	
}, {timestamps: true}); // Автоматом додасть поля createdAt, updatedAt (час створення і час оновлення запису)

const model = mongoose.model('user', schema, 'user-info');
export default model;
