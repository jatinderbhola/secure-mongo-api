import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: {
    type: String
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    index: true,
    unique: true,
    required: true
  },
  portalRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portal',
    required: true,
    unique: true
  },
  database: {
    type: String,
    required: true
  },
  apiKeyHash: {
    type: String,
    index: true,
    unique: true,
    required: true
  },
  allowedOrigins: [String]
});

export const Client = mongoose.model('Client', clientSchema);
