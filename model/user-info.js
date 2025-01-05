import mongoose, {Schema, SchemaTypes} from 'mongoose';

const schema = new Schema({
	login: {
		type: SchemaTypes.String,
		default: ''
	},
	password: {
		type: SchemaTypes.String,
		default: null
	},
	email: {
		type: SchemaTypes.String,
		default: ''
	},
	avatar: {
		type: SchemaTypes.String,
		default: null
	},
	googleId: {
		type: SchemaTypes.Number,
		default: null,
	},
	facebookId: {
		type: SchemaTypes.Number,
		default: null
	},
	resetToken: {
		type: String,
		default: null
	},
	resetTokenExpiration: {
		type: Date,
		default: null
	}
	
}, {timestamps: true}); // Автоматом додасть поля createdAt, updatedAt (час створення і час оновлення запису)

const model = mongoose.model('user', schema, 'user-info');
export default model;
